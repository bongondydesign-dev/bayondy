import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  findPaymentRefByReference,
  fulfillPaidOrderTransaction,
  markExpiredOrderTransaction,
  markFailedOrderTransaction,
} from "@/lib/moncash/fulfillment";
import {
  buildMonCashPayStatusHeaders,
  buildMonCashPayStatusLookupUrls,
  extractSafeHttpOrigin,
  extractSafeUpstreamError,
  isAllowedMonCashCurrency,
  isPaymentExpired24h,
  parseMonCashPayStatusResponse,
  resolveMonCashSecretKey,
  resolvePinnedSiteOrigins,
  validateMonCashSecretKeyForEnv,
  type ParsedMonCashPayStatus,
} from "@/lib/moncash/status";
import { ORDER_ID_REGEX } from "@/lib/moncash/validation";
import {
  checkFirestoreUidRateLimit,
  readJsonBodyWithLimit,
} from "@/lib/server/requestGuards";

const MONCASH_PAY_STATUS_URL = "https://api.moncashconnect.com/v1/pay-status";

async function resolveCourseDetails(
  db: FirebaseFirestore.Firestore,
  courseId: string | undefined
): Promise<{ slug: string | null; title: string | null }> {
  if (!courseId) return { slug: null, title: null };
  try {
    const snap = await db.collection("courses").doc(courseId).get();
    if (!snap.exists) return { slug: null, title: null };
    const data = snap.data();
    const slug =
      typeof data?.slug === "string" && data.slug.trim() ? data.slug.trim() : null;
    const title =
      typeof data?.title === "string" && data.title.trim() ? data.title.trim() : null;
    return { slug, title };
  } catch {
    return { slug: null, title: null };
  }
}

function toIsoStringOrNull(ts: unknown): string | null {
  if (
    ts &&
    typeof ts === "object" &&
    "toDate" in ts &&
    typeof (ts as { toDate?: () => Date }).toDate === "function"
  ) {
    try {
      return (ts as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return null;
    }
  }
  if (typeof ts === "string" && ts.trim()) {
    return ts.trim();
  }
  return null;
}

function toMillisOrNull(ts: unknown): number | null {
  if (
    ts &&
    typeof ts === "object" &&
    "toMillis" in ts &&
    typeof (ts as { toMillis?: () => number }).toMillis === "function"
  ) {
    try {
      return (ts as { toMillis: () => number }).toMillis();
    } catch {
      return null;
    }
  }
  if (typeof ts === "string" && ts.trim()) {
    const ms = Date.parse(ts.trim());
    return Number.isNaN(ms) ? null : ms;
  }
  return null;
}

export async function POST(req: NextRequest) {
  // 1. Authentification Firebase ID Token requise
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!idToken) {
    return NextResponse.json(
      { error: "Otantifikasyon obligatwa pou verifye peman an.", code: "AUTH_REQUIRED" },
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
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken, true);
    uid = decoded.uid;
  } catch {
    return NextResponse.json(
      { error: "Sesyon ou a ekspire oswa li pa valid.", code: "INVALID_AUTH_TOKEN" },
      { status: 401 }
    );
  }

  // 2. Lecture bornée (<= 16 Ko) de orderId dans le corps JSON
  const bodyResult = await readJsonBodyWithLimit(req, 16 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: "Kò JSON an pa valid.", code: bodyResult.code },
      { status: bodyResult.status }
    );
  }

  let requestedOrderId: string | null = null;
  if (
    bodyResult.data &&
    typeof bodyResult.data === "object" &&
    !Array.isArray(bodyResult.data)
  ) {
    const parsedBody = bodyResult.data as Record<string, unknown>;
    const candidate =
      typeof parsedBody.orderId === "string"
        ? parsedBody.orderId.trim()
        : typeof parsedBody.referenceId === "string"
          ? parsedBody.referenceId.trim()
          : typeof parsedBody.reference === "string"
            ? parsedBody.reference.trim()
            : "";
    if (candidate) {
      if (!ORDER_ID_REGEX.test(candidate)) {
        return NextResponse.json(
          { error: "Referans kòmand la pa valid.", code: "INVALID_ORDER_ID" },
          { status: 400 }
        );
      }
      requestedOrderId = candidate;
    }
  }

  try {
    const db = getAdminDb();

    // Limitation de débit par utilisateur (max 30 vérifications / 5 min)
    const withinLimit = await checkFirestoreUidRateLimit({
      db,
      scope: "moncash_verify",
      uid,
      maxRequests: 30,
      windowSeconds: 300,
    });
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Ou fè twòp verifikasyon. Tann kèk segond.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    // 3. Résolution du document paiement (par orderId ou dernier paiement de l'élève)
    interface PaymentDocData {
      uid?: string;
      courseId?: string;
      orderId?: string;
      merchantReference?: string;
      providerReference?: string;
      returnUrl?: string;
      amount?: number;
      currency?: string;
      method?: string;
      status?: string;
      failureReason?: string | null;
      createdAt?: unknown;
      paidAt?: unknown;
    }

    let paymentRef: FirebaseFirestore.DocumentReference | null = null;
    let paymentData: PaymentDocData | null = null;

    if (requestedOrderId) {
      paymentRef = await findPaymentRefByReference(db, requestedOrderId);
      if (paymentRef) {
        const snap = await paymentRef.get();
        if (snap.exists) {
          paymentData = (snap.data() ?? null) as PaymentDocData | null;
        }
      }
    } else {
      const userPaymentsSnap = await db
        .collection("payments")
        .where("uid", "==", uid)
        .limit(20)
        .get();

      if (!userPaymentsSnap.empty) {
        const sortedDocs = [...userPaymentsSnap.docs].sort((a, b) => {
          const msA = a.data().createdAt?.toMillis?.() ?? 0;
          const msB = b.data().createdAt?.toMillis?.() ?? 0;
          return msB - msA;
        });
        const pendingDoc = sortedDocs.find((d) => {
          const st = d.data().status;
          return st === "awaiting_payment" || st === "pending";
        });
        const targetDoc = pendingDoc ?? sortedDocs[0];
        paymentRef = targetDoc.ref;
        paymentData = targetDoc.data() as PaymentDocData;
      }
    }

    if (!paymentRef || !paymentData) {
      return NextResponse.json(
        { error: "Nou pa jwenn kòmand sa a.", code: "PAYMENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Contrôle strict de propriété côté serveur
    if (paymentData.uid !== uid) {
      return NextResponse.json(
        { error: "Ou pa gen otorizasyon pou verifye peman sa a.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const orderId =
      paymentData.orderId || paymentData.merchantReference || paymentRef.id;
    const courseId = paymentData.courseId || "";
    const amount = typeof paymentData.amount === "number" ? paymentData.amount : null;
    const currency =
      typeof paymentData.currency === "string" && paymentData.currency.trim()
        ? paymentData.currency.trim()
        : "HTG";
    const method =
      typeof paymentData.method === "string" && paymentData.method.trim()
        ? paymentData.method.trim()
        : "moncash";
    const createdAt = toIsoStringOrNull(paymentData.createdAt);
    const createdAtMs = toMillisOrNull(paymentData.createdAt);
    const paidAt = toIsoStringOrNull(paymentData.paidAt);

    // 4. Si déjà payé (ex: via webhook), s'assurer que l'inscription est bien active
    if (paymentData.status === "paid") {
      await fulfillPaidOrderTransaction({
        db,
        paymentRef,
        reference: orderId,
        amount,
        completedAt: null,
      });
      const course = await resolveCourseDetails(db, courseId);
      return NextResponse.json(
        {
          ok: true,
          status: "paid",
          orderId,
          courseId,
          courseSlug: course.slug,
          courseTitle: course.title,
          amount,
          currency,
          method,
          paidAt: paidAt || createdAt,
          source: "database",
        },
        { status: 200 }
      );
    }

    if (paymentData.status === "failed" || paymentData.status === "expired") {
      const course = await resolveCourseDetails(db, courseId);
      return NextResponse.json(
        {
          ok: true,
          status: "failed",
          orderId,
          courseId,
          courseSlug: course.slug,
          courseTitle: course.title,
          amount,
          currency,
          method,
          paidAt: createdAt,
          failureReason: paymentData.failureReason ?? null,
        },
        { status: 200 }
      );
    }

    // 5. Interroger MonCashConnect /v1/pay-status côté serveur avec origines épinglées
    const rawMccSecret = resolveMonCashSecretKey(process.env);
    const keyCheck = validateMonCashSecretKeyForEnv(rawMccSecret, process.env);
    if (!keyCheck.ok) {
      return NextResponse.json(
        { error: "Sèvis MonCash la poko konfigire sou sèvè a.", code: keyCheck.code },
        { status: 503 }
      );
    }
    const mccSecretKey = keyCheck.key;

    const course = await resolveCourseDetails(db, courseId);

    const pinnedOrigins = resolvePinnedSiteOrigins(process.env, req.nextUrl?.origin);
    const returnOrigin = extractSafeHttpOrigin(paymentData.returnUrl);
    const primaryOrigin =
      returnOrigin && pinnedOrigins.includes(returnOrigin)
        ? returnOrigin
        : pinnedOrigins[0] ?? null;

    const lookupUrls = buildMonCashPayStatusLookupUrls(MONCASH_PAY_STATUS_URL, [
      orderId,
      paymentData.providerReference,
    ]);

    const originAttempts: Array<string | null> = primaryOrigin
      ? [primaryOrigin, null]
      : [null];

    let parsedStatus: ParsedMonCashPayStatus | null = null;
    let lastUpstreamStatus: number | null = null;
    let lastUpstreamCode: string | null = null;
    let sawNetworkError = false;
    let sawOriginForbidden = false;

    for (const attemptOrigin of originAttempts) {
      const mccHeaders = buildMonCashPayStatusHeaders(mccSecretKey, attemptOrigin);
      let originRejectedThisPass = false;

      for (const lookupUrl of lookupUrls) {
        let mccRes: Response;
        try {
          mccRes = await fetch(lookupUrl, {
            method: "GET",
            headers: mccHeaders,
            cache: "no-store",
            signal: AbortSignal.timeout(10000),
          });
        } catch {
          sawNetworkError = true;
          break;
        }

        lastUpstreamStatus = mccRes.status;
        const rawPayload = await mccRes.json().catch(() => null);
        const upstreamErr = extractSafeUpstreamError(rawPayload);
        if (upstreamErr.code) lastUpstreamCode = upstreamErr.code;

        if (mccRes.status === 401) {
          console.error("[moncash/verify] Upstream authentication error", { orderId });
          return NextResponse.json(
            {
              error: "Sèvis verifikasyon peman an pa disponib kounye a.",
              code: "MCC_SERVICE_UNAVAILABLE",
            },
            { status: 502 }
          );
        }

        if (mccRes.status === 403) {
          sawOriginForbidden = true;
          originRejectedThisPass = true;
          break;
        }

        if (!mccRes.ok) {
          if (mccRes.status >= 500 && upstreamErr.message === "project_lookup_failed") {
            console.error("[moncash/verify] Upstream configuration error", { orderId });
            return NextResponse.json(
              {
                error: "Sèvis verifikasyon peman an rankontre yon erè konfigirasyon.",
                code: "MCC_SERVICE_UNAVAILABLE",
              },
              { status: 502 }
            );
          }
          continue;
        }

        const candidateParsed = parseMonCashPayStatusResponse(rawPayload);
        if (candidateParsed.ok) {
          parsedStatus = candidateParsed.data;
          break;
        }
      }

      if (parsedStatus || sawNetworkError || !originRejectedThisPass) {
        break;
      }
    }

    if (!parsedStatus) {
      if (sawOriginForbidden && lastUpstreamStatus === 403) {
        console.error("[moncash/verify] Upstream origin rejected (403)", { orderId });
        return NextResponse.json(
          {
            error: "Sèvis verifikasyon peman an refize domèn rekèt la.",
            code: "MCC_ORIGIN_NOT_ALLOWED",
          },
          { status: 502 }
        );
      }

      if (lastUpstreamStatus !== null && lastUpstreamStatus >= 500) {
        console.error("[moncash/verify] Upstream server error", {
          orderId,
          lastUpstreamStatus,
          lastUpstreamCode,
        });
        return NextResponse.json(
          {
            error: "Sèvis peman an gen yon pwoblèm tanporè. Eseye ankò nan kèk minit.",
            code: "MCC_UPSTREAM_ERROR",
          },
          { status: 502 }
        );
      }

      if (isPaymentExpired24h(createdAtMs)) {
        await markExpiredOrderTransaction({
          db,
          paymentRef,
          failureReason: "PAYMENT_EXPIRED_24H",
        });
        return NextResponse.json(
          {
            ok: true,
            status: "failed",
            orderId,
            courseId,
            courseSlug: course.slug,
            courseTitle: course.title,
            amount,
            currency,
            method,
            paidAt: createdAt,
            failureReason: "PAYMENT_EXPIRED_24H",
          },
          { status: 200 }
        );
      }

      if (lastUpstreamStatus !== null || sawNetworkError) {
        console.warn("[moncash/verify] Pay-status unresolved", {
          orderId,
          lastUpstreamStatus,
          lastUpstreamCode,
          sawNetworkError,
        });
      }

      return NextResponse.json(
        {
          ok: true,
          status: "pending",
          orderId,
          courseId,
          courseSlug: course.slug,
          courseTitle: course.title,
          amount,
          currency,
          method,
          paidAt: createdAt,
          ...(sawNetworkError ? { transient: true } : {}),
        },
        { status: 200 }
      );
    }

    const parsedStatusData = parsedStatus;

    if (parsedStatusData.status === "completed") {
      if (!isAllowedMonCashCurrency(parsedStatusData.currency)) {
        return NextResponse.json(
          { error: "Deviz peman an pa koresponn.", code: "CURRENCY_MISMATCH" },
          { status: 400 }
        );
      }

      const fulfilled = await fulfillPaidOrderTransaction({
        db,
        paymentRef,
        reference: parsedStatusData.reference || orderId,
        amount: parsedStatusData.amount,
        completedAt: parsedStatusData.completedAt,
      });

      if (fulfilled.outcome === "amount_mismatch") {
        console.warn("[moncash/verify] Amount mismatch detected", { orderId });
        return NextResponse.json(
          { error: "Montan peman an pa koresponn.", code: "AMOUNT_MISMATCH" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          status: "paid",
          orderId,
          courseId,
          courseSlug: course.slug,
          courseTitle: course.title,
          amount: amount ?? parsedStatusData.amount,
          currency,
          method,
          paidAt: parsedStatusData.completedAt || new Date().toISOString(),
          source: "pay-status",
        },
        { status: 200 }
      );
    }

    if (parsedStatusData.status === "failed") {
      await markFailedOrderTransaction({
        db,
        paymentRef,
        failureReason: parsedStatusData.failureReason || "payment_failed",
      });

      return NextResponse.json(
        {
          ok: true,
          status: "failed",
          orderId,
          courseId,
          courseSlug: course.slug,
          courseTitle: course.title,
          amount,
          currency,
          method,
          paidAt: createdAt,
          failureReason: parsedStatusData.failureReason,
        },
        { status: 200 }
      );
    }

    if (isPaymentExpired24h(createdAtMs)) {
      await markExpiredOrderTransaction({
        db,
        paymentRef,
        failureReason: "PAYMENT_EXPIRED_24H",
      });

      return NextResponse.json(
        {
          ok: true,
          status: "failed",
          orderId,
          courseId,
          courseSlug: course.slug,
          courseTitle: course.title,
          amount,
          currency,
          method,
          paidAt: createdAt,
          failureReason: "PAYMENT_EXPIRED_24H",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        orderId,
        courseId,
        courseSlug: course.slug,
        courseTitle: course.title,
        amount,
        currency,
        method,
        paidAt: createdAt,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[moncash/verify] Server error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      {
        error: "Erè sèvè pandan verifikasyon oswa aktivasyon kòmand lan.",
        code: "VERIFY_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
