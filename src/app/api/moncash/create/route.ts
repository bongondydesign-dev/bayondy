import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  isCheckoutSessionReusable,
  isPaymentExpired24h,
  resolveMonCashSecretKey,
  resolvePinnedSiteOrigins,
  validateMonCashSecretKeyForEnv,
} from "@/lib/moncash/status";
import {
  buildMonCashCreateHeaders,
  isMonCashSuccessStatus,
  isSafePaymentRedirectUrl,
  mapMonCashUpstreamError,
  MAX_MONCASH_AMOUNT_HTG,
  validateMonCashCreateInput,
} from "@/lib/moncash/validation";
import {
  checkFirestoreUidRateLimit,
  readJsonBodyWithLimit,
} from "@/lib/server/requestGuards";

const MONCASH_PAY_CREATE_URL = "https://api.moncashconnect.com/v1/pay-create";

export async function POST(req: NextRequest) {
  // 1. Authentification serveur obligatoire via Firebase ID Token
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!idToken) {
    return NextResponse.json(
      { error: "Otantifikasyon obligatwa pou peye.", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  if (!hasAdminCredentials()) {
    return NextResponse.json(
      { error: "Konfigirasyon sèvè a enkonplè.", code: "SERVER_CONFIG_MISSING" },
      { status: 503 }
    );
  }

  let uid: string;
  let customerName: string | undefined;
  let customerEmail: string | undefined;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken, true);
    if (decoded.admin === true) {
      return NextResponse.json(
        {
          error: "Kont admin yo gen aksè gratis nan tout fòmasyon yo.",
          code: "ADMIN_FREE_ACCESS",
        },
        { status: 403 }
      );
    }
    uid = decoded.uid;
    customerName =
      typeof decoded.name === "string" && decoded.name.trim()
        ? decoded.name.trim()
        : undefined;
    customerEmail =
      typeof decoded.email === "string" && decoded.email.trim()
        ? decoded.email.trim()
        : undefined;
  } catch {
    return NextResponse.json(
      { error: "Sesyon ou a ekspire oswa li pa valid.", code: "INVALID_AUTH_TOKEN" },
      { status: 401 }
    );
  }

  // 2. Lecture exclusive de la clé secrète côté serveur + contrôle Sandbox vs Production
  const rawMccSecret = resolveMonCashSecretKey(process.env);
  const keyCheck = validateMonCashSecretKeyForEnv(rawMccSecret, process.env);
  if (!keyCheck.ok) {
    return NextResponse.json(
      { error: "Sèvis MonCash la poko konfigire sou sèvè a.", code: keyCheck.code },
      { status: 503 }
    );
  }
  const mccSecretKey = keyCheck.key;

  // 3. Parsing borné (<= 16 Ko) et validation stricte des entrées
  const bodyResult = await readJsonBodyWithLimit(req, 16 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: "Kò JSON an pa valid.", code: bodyResult.code },
      { status: bodyResult.status }
    );
  }

  const allowedOrigins = resolvePinnedSiteOrigins(process.env, req.nextUrl?.origin);
  const validation = validateMonCashCreateInput(bodyResult.data, allowedOrigins, {
    requireCourseId: true,
  });
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error, code: validation.code },
      { status: validation.status }
    );
  }

  const { amount: clientAmount, orderId, returnUrl, courseId } = validation.data;
  if (!courseId) {
    return NextResponse.json(
      { error: "Fòmasyon an obligatwa pou peman sa a.", code: "COURSE_REQUIRED" },
      { status: 400 }
    );
  }

  const db = getAdminDb();

  // 4. Limitation de débit par utilisateur (max 10 créations / 15 min)
  const withinLimit = await checkFirestoreUidRateLimit({
    db,
    scope: "moncash_create",
    uid,
    maxRequests: 10,
    windowSeconds: 900,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Ou fè twòp tantativ peman. Tann kèk minit epi eseye ankò.", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  // 5. Vérifier existence, publication, non-inscription et PRIX SERVEUR obligatoire
  const courseSnap = await db.collection("courses").doc(courseId).get();
  if (!courseSnap.exists || courseSnap.data()?.status !== "published") {
    return NextResponse.json(
      { error: "Fòmasyon sa a pa disponib.", code: "COURSE_NOT_FOUND" },
      { status: 404 }
    );
  }

  const enrollmentSnap = await db
    .collection("enrollments")
    .doc(`${uid}_${courseId}`)
    .get();
  if (enrollmentSnap.exists && enrollmentSnap.data()?.status === "active") {
    return NextResponse.json(
      { error: "Ou deja enskri nan fòmasyon sa a.", code: "ALREADY_ENROLLED" },
      { status: 409 }
    );
  }

  const rawServerPrice = courseSnap.data()?.priceHTG;
  if (
    typeof rawServerPrice !== "number" ||
    !Number.isFinite(rawServerPrice) ||
    rawServerPrice <= 0
  ) {
    return NextResponse.json(
      { error: "Fòmasyon sa a poko gen yon pri an HTG disponib.", code: "COURSE_UNPRICED" },
      { status: 422 }
    );
  }

  const serverAmount = Math.round(rawServerPrice);
  if (serverAmount <= 0 || serverAmount > MAX_MONCASH_AMOUNT_HTG) {
    return NextResponse.json(
      { error: "Pri fòmasyon an depase limit MonCash la.", code: "INVALID_COURSE_PRICE" },
      { status: 422 }
    );
  }

  if (clientAmount !== serverAmount) {
    return NextResponse.json(
      { error: "Montan an pa koresponn ak pri fòmasyon an.", code: "AMOUNT_MISMATCH" },
      { status: 400 }
    );
  }

  // 6. Réutiliser un paiement récent (< 15 min) pour le même (uid, courseId)
  //    et expirer en arrière-plan les commandes en attente > 24h.
  try {
    const existingPaymentsSnap = await db
      .collection("payments")
      .where("uid", "==", uid)
      .limit(25)
      .get();

    const nowMs = Date.now();
    let reusablePaymentUrl: string | null = null;
    const expiredRefs: FirebaseFirestore.DocumentReference[] = [];

    const sortedCoursePayments = existingPaymentsSnap.docs
      .filter((doc) => doc.data().courseId === courseId)
      .sort((a, b) => {
        const msA = a.data().createdAt?.toMillis?.() ?? 0;
        const msB = b.data().createdAt?.toMillis?.() ?? 0;
        return msB - msA;
      });

    for (const pDoc of sortedCoursePayments) {
      const pData = pDoc.data();
      if (pData.status !== "awaiting_payment" && pData.status !== "pending") {
        continue;
      }
      const createdAtMs = pData.createdAt?.toMillis?.() ?? 0;
      if (isPaymentExpired24h(createdAtMs, nowMs)) {
        expiredRefs.push(pDoc.ref);
        continue;
      }
      if (
        !reusablePaymentUrl &&
        isCheckoutSessionReusable(createdAtMs, nowMs) &&
        pData.amount === serverAmount &&
        isSafePaymentRedirectUrl(pData.paymentUrl)
      ) {
        reusablePaymentUrl = pData.paymentUrl;
      }
    }

    if (expiredRefs.length > 0) {
      const batch = db.batch();
      for (const ref of expiredRefs) {
        batch.update(ref, {
          status: "expired",
          failureReason: "PAYMENT_EXPIRED_24H",
        });
      }
      await batch.commit().catch(() => {});
    }

    if (reusablePaymentUrl) {
      return NextResponse.json({ paymentUrl: reusablePaymentUrl, reused: true }, { status: 200 });
    }
  } catch {
    // Continuer vers une nouvelle session si la vérification préalable échoue transitoirement
  }

  // 7. Enregistrer la commande en BDD avec le montant SERVEUR AVANT la redirection
  const paymentRef = db.collection("payments").doc(orderId);
  try {
    await paymentRef.create({
      uid,
      courseId,
      orderId,
      merchantReference: orderId,
      amount: serverAmount,
      currency: "HTG",
      method: "moncash",
      status: "awaiting_payment",
      returnUrl,
      paymentUrl: null,
      failureReason: null,
      createdAt: FieldValue.serverTimestamp(),
      paidAt: null,
    });
  } catch (err) {
    const code = (err as { code?: number | string })?.code;
    if (code === 6 || code === "already-exists") {
      return NextResponse.json(
        { error: "Nimewo kòmand sa a deja egziste.", code: "DUPLICATE_ORDER_ID" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Nou pa t kapab anrejistre kòmand la.", code: "DB_WRITE_FAILED" },
      { status: 500 }
    );
  }

  // 8. Appel serveur vers MonCashConnect (/v1/pay-create)
  const requestOrigin = new URL(returnUrl).origin;
  let mccResponse: Response;
  try {
    mccResponse = await fetch(MONCASH_PAY_CREATE_URL, {
      method: "POST",
      headers: buildMonCashCreateHeaders(mccSecretKey, requestOrigin, orderId),
      body: JSON.stringify({
        amount: serverAmount,
        referenceId: orderId,
        returnUrl,
        ...(customerName ? { customerName } : {}),
        ...(customerEmail ? { customerEmail } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    await paymentRef
      .update({
        status: "failed",
        failureReason: "MONCASH_NETWORK_ERROR",
      })
      .catch(() => {});

    return NextResponse.json(
      {
        error: "Nou pa t kapab kontakte sèvis MonCash la.",
        code: "MONCASH_UNREACHABLE",
      },
      { status: 502 }
    );
  }

  const mccPayload = await mccResponse.json().catch(() => null);

  if (isMonCashSuccessStatus(mccResponse.status)) {
    const paymentUrl =
      mccPayload && typeof mccPayload === "object"
        ? (mccPayload as Record<string, unknown>).paymentUrl
        : null;

    if (!isSafePaymentRedirectUrl(paymentUrl)) {
      await paymentRef
        .update({
          status: "failed",
          failureReason: "INVALID_PAYMENT_URL",
        })
        .catch(() => {});

      return NextResponse.json(
        {
          error: "Lyen peman MonCash la pa valid.",
          code: "INVALID_PAYMENT_URL",
        },
        { status: 502 }
      );
    }

    const payloadObj =
      mccPayload && typeof mccPayload === "object"
        ? (mccPayload as Record<string, unknown>)
        : null;
    const rawProviderRef = payloadObj?.reference ?? payloadObj?.referenceId;
    const providerReference =
      typeof rawProviderRef === "string" &&
      rawProviderRef.trim() &&
      rawProviderRef.trim().length <= 128
        ? rawProviderRef.trim()
        : null;

    await paymentRef
      .update({
        paymentUrl,
        status: "awaiting_payment",
        ...(providerReference ? { providerReference } : {}),
      })
      .catch(() => {});

    return NextResponse.json({ paymentUrl }, { status: 201 });
  }

  // 9. Erreur retournée par MonCashConnect -> mise à jour BDD + erreur uniforme sansfuite interne
  const mappedError = mapMonCashUpstreamError(mccResponse.status, mccPayload);
  await paymentRef
    .update({
      status: "failed",
      failureReason: mappedError.code,
    })
    .catch(() => {});

  const clientStatus =
    mccResponse.status >= 400 && mccResponse.status < 600 ? mccResponse.status : 502;

  return NextResponse.json(mappedError, { status: clientStatus });
}
