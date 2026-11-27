import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  buildMonCashCreateHeaders,
  isMonCashSuccessStatus,
  isSafePaymentRedirectUrl,
  mapMonCashUpstreamError,
  validateMonCashCreateInput,
} from "@/lib/moncash/validation";

const MONCASH_PAY_CREATE_URL = "https://api.moncashconnect.com/v1/pay-create";

function resolveAllowedOrigins(req: NextRequest): string[] {
  const origins = new Set<string>();
  const requestOrigin = req.nextUrl?.origin;
  if (requestOrigin) origins.add(requestOrigin);

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) {
    origins.add(`${proto}://${host}`);
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    try {
      origins.add(new URL(configuredSiteUrl).origin);
    } catch {
      // Ignorer une URL malformée dans NEXT_PUBLIC_SITE_URL
    }
  }

  return Array.from(origins);
}

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

  // 2. Lecture exclusive de la clé secrète côté serveur
  const mccSecretKey = process.env.MCC_SECRET_KEY
    ?.trim()
    .replace(/^(['"])([\s\S]*)\1$/, "$2")
    .trim();
  if (!mccSecretKey) {
    return NextResponse.json(
      { error: "Sèvis MonCash la poko konfigire sou sèvè a.", code: "MCC_SECRET_MISSING" },
      { status: 503 }
    );
  }

  // 3. Parsing et validation stricte des entrées
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Kò JSON an pa valid.", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const validation = validateMonCashCreateInput(rawBody, resolveAllowedOrigins(req));
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error, code: validation.code },
      { status: validation.status }
    );
  }

  const { amount, orderId, returnUrl, courseId } = validation.data;
  const db = getAdminDb();

  // 4. Si lié à une formation, vérifier existence, publication, non-inscription et prix serveur
  if (courseId) {
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

    const serverPriceHTG = courseSnap.data()?.priceHTG;
    if (
      typeof serverPriceHTG === "number" &&
      Number.isFinite(serverPriceHTG) &&
      serverPriceHTG > 0 &&
      Math.round(serverPriceHTG) !== amount
    ) {
      return NextResponse.json(
        { error: "Montan an pa koresponn ak pri fòmasyon an.", code: "AMOUNT_MISMATCH" },
        { status: 400 }
      );
    }
  }

  // 5. Enregistrer la commande en BDD avec status="awaiting_payment" AVANT l'appel/redirection
  const paymentRef = db.collection("payments").doc(orderId);
  try {
    await paymentRef.create({
      uid,
      courseId: courseId ?? "",
      orderId,
      merchantReference: orderId,
      amount,
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

  // 6. Appel serveur vers MonCashConnect (/v1/pay-create)
  const requestOrigin = new URL(returnUrl).origin;
  let mccResponse: Response;
  try {
    mccResponse = await fetch(MONCASH_PAY_CREATE_URL, {
      method: "POST",
      headers: buildMonCashCreateHeaders(mccSecretKey, requestOrigin, orderId),
      body: JSON.stringify({
        amount,
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

    await paymentRef
      .update({
        paymentUrl,
        status: "awaiting_payment",
      })
      .catch(() => {});

    return NextResponse.json({ paymentUrl }, { status: 201 });
  }

  // 7. Erreur retournée par MonCashConnect -> mise à jour BDD + erreur structurée { error, code }
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
