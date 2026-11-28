import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  findPaymentRefByReference,
  fulfillPaidOrderTransaction,
  markFailedOrderTransaction,
} from "@/lib/moncash/fulfillment";
import { parseMonCashPayStatusResponse } from "@/lib/moncash/status";
import { ORDER_ID_REGEX } from "@/lib/moncash/validation";

const MONCASH_PAY_STATUS_URL = "https://api.moncashconnect.com/v1/pay-status";

async function resolveCourseSlug(
  db: FirebaseFirestore.Firestore,
  courseId: string | undefined
): Promise<string | null> {
  if (!courseId) return null;
  try {
    const snap = await db.collection("courses").doc(courseId).get();
    const slug = snap.exists ? snap.data()?.slug : null;
    return typeof slug === "string" && slug.trim() ? slug.trim() : null;
  } catch {
    return null;
  }
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

  // 2. Lecture optionnelle de orderId dans le corps JSON
  let requestedOrderId: string | null = null;
  try {
    const rawText = await req.text();
    if (rawText.trim()) {
      const parsedBody = JSON.parse(rawText) as Record<string, unknown>;
      if (parsedBody && typeof parsedBody === "object" && !Array.isArray(parsedBody)) {
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
    }
  } catch {
    return NextResponse.json(
      { error: "Kò JSON an pa valid.", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const db = getAdminDb();

  // 3. Résolution du document paiement (par orderId ou dernier paiement de l'élève)
  interface PaymentDocData {
    uid?: string;
    courseId?: string;
    orderId?: string;
    merchantReference?: string;
    amount?: number;
    status?: string;
    failureReason?: string | null;
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

  // 4. Si déjà payé (ex: via webhook), s'assurer que l'inscription est bien active
  if (paymentData.status === "paid") {
    await fulfillPaidOrderTransaction({
      db,
      paymentRef,
      reference: orderId,
      amount: typeof paymentData.amount === "number" ? paymentData.amount : null,
      completedAt: null,
    });
    const courseSlug = await resolveCourseSlug(db, courseId);
    return NextResponse.json(
      {
        ok: true,
        status: "paid",
        orderId,
        courseId,
        courseSlug,
        source: "database",
      },
      { status: 200 }
    );
  }

  if (paymentData.status === "failed" || paymentData.status === "expired") {
    const courseSlug = await resolveCourseSlug(db, courseId);
    return NextResponse.json(
      {
        ok: true,
        status: "failed",
        orderId,
        courseId,
        courseSlug,
        failureReason: paymentData.failureReason ?? null,
      },
      { status: 200 }
    );
  }

  // 5. Interroger MonCashConnect /v1/pay-status?referenceId=... côté serveur
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

  let mccRes: Response;
  try {
    mccRes = await fetch(
      `${MONCASH_PAY_STATUS_URL}?referenceId=${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mccSecretKey}`,
        },
        signal: AbortSignal.timeout(12000),
      }
    );
  } catch {
    const courseSlug = await resolveCourseSlug(db, courseId);
    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        orderId,
        courseId,
        courseSlug,
        transient: true,
      },
      { status: 200 }
    );
  }

  if (!mccRes.ok) {
    const courseSlug = await resolveCourseSlug(db, courseId);
    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        orderId,
        courseId,
        courseSlug,
        upstreamStatus: mccRes.status,
      },
      { status: 200 }
    );
  }

  const rawPayload = await mccRes.json().catch(() => null);
  const parsedStatus = parseMonCashPayStatusResponse(rawPayload);

  if (!parsedStatus.ok) {
    const courseSlug = await resolveCourseSlug(db, courseId);
    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        orderId,
        courseId,
        courseSlug,
      },
      { status: 200 }
    );
  }

  const courseSlug = await resolveCourseSlug(db, courseId);

  if (parsedStatus.data.status === "completed") {
    const fulfilled = await fulfillPaidOrderTransaction({
      db,
      paymentRef,
      reference: parsedStatus.data.reference || orderId,
      amount: parsedStatus.data.amount,
      completedAt: parsedStatus.data.completedAt,
    });

    if (fulfilled.outcome === "amount_mismatch") {
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
        courseSlug,
        source: "pay-status",
      },
      { status: 200 }
    );
  }

  if (parsedStatus.data.status === "failed") {
    await markFailedOrderTransaction({
      db,
      paymentRef,
      failureReason: parsedStatus.data.failureReason || "payment_failed",
    });

    return NextResponse.json(
      {
        ok: true,
        status: "failed",
        orderId,
        courseId,
        courseSlug,
        failureReason: parsedStatus.data.failureReason,
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
      courseSlug,
    },
    { status: 200 }
  );
}
