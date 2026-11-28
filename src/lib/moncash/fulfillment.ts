import "server-only";
import {
  FieldValue,
  Timestamp,
  type DocumentReference,
  type Firestore,
} from "firebase-admin/firestore";
import {
  runFulfillPaidOrderTransaction,
  type FulfillPaidOrderResult,
} from "./fulfillmentCore";

export type { FulfillPaidOrderResult };

export function parseCompletedAtTimestamp(
  value: string | number | null | undefined
): Timestamp | null {
  try {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      const ms = value > 1e12 ? value : value * 1000;
      return Timestamp.fromMillis(ms);
    }
    if (typeof value === "string" && value.trim()) {
      const ms = Date.parse(value.trim());
      if (!Number.isNaN(ms)) {
        return Timestamp.fromMillis(ms);
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function findPaymentRefByReference(
  db: Firestore,
  reference: string
): Promise<DocumentReference | null> {
  const safeRef = reference.trim();
  if (!safeRef) return null;

  const isSafeDocId =
    !safeRef.includes("/") && safeRef !== "." && safeRef !== "..";
  if (isSafeDocId) {
    const directRef = db.collection("payments").doc(safeRef);
    const directSnap = await directRef.get();
    if (directSnap.exists) {
      return directRef;
    }
  }

  const byOrderId = await db
    .collection("payments")
    .where("orderId", "==", safeRef)
    .limit(1)
    .get();

  if (!byOrderId.empty) {
    return byOrderId.docs[0].ref;
  }

  const byProviderRef = await db
    .collection("payments")
    .where("providerReference", "==", safeRef)
    .limit(1)
    .get();

  if (!byProviderRef.empty) {
    return byProviderRef.docs[0].ref;
  }

  return null;
}

/**
 * Marque la commande comme payée et active l'inscription au cours de manière
 * atomique et idempotente (utilisé par /api/moncash/webhook et /api/moncash/verify).
 */
export async function fulfillPaidOrderTransaction(params: {
  db: Firestore;
  paymentRef: DocumentReference;
  reference: string;
  amount: number | null;
  completedAt: string | number | null;
}): Promise<FulfillPaidOrderResult> {
  const { db, paymentRef, reference, amount, completedAt } = params;

  return runFulfillPaidOrderTransaction({
    db: {
      getEnrollmentRef: (uid, courseId) =>
        db.collection("enrollments").doc(`${uid}_${courseId}`),
      runTransaction: (fn) => db.runTransaction((tx) => fn(tx)),
    },
    paymentRef,
    reference,
    amount,
    paidAtValue: parseCompletedAtTimestamp(completedAt),
    serverTimestamp: FieldValue.serverTimestamp(),
  });
}

export async function markFailedOrderTransaction(params: {
  db: Firestore;
  paymentRef: DocumentReference;
  failureReason: string;
}): Promise<"failed" | "already_paid" | "already_failed" | "not_found"> {
  const { db, paymentRef, failureReason } = params;

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(paymentRef);
    if (!snap.exists) return "not_found" as const;

    const data = snap.data() as { status?: string };
    if (data.status === "paid") return "already_paid" as const;
    if (data.status === "failed") return "already_failed" as const;

    tx.update(paymentRef, {
      status: "failed",
      failureReason: failureReason.slice(0, 120),
    });

    return "failed" as const;
  });
}

export async function markExpiredOrderTransaction(params: {
  db: Firestore;
  paymentRef: DocumentReference;
  failureReason?: string;
}): Promise<"expired" | "already_paid" | "already_final" | "not_found"> {
  const { db, paymentRef, failureReason = "PAYMENT_EXPIRED_24H" } = params;

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(paymentRef);
    if (!snap.exists) return "not_found" as const;

    const data = snap.data() as { status?: string };
    if (data.status === "paid") return "already_paid" as const;
    if (data.status === "failed" || data.status === "expired") {
      return "already_final" as const;
    }

    tx.update(paymentRef, {
      status: "expired",
      failureReason: failureReason.slice(0, 120),
    });

    return "expired" as const;
  });
}
