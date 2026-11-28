import "server-only";
import {
  FieldValue,
  Timestamp,
  type DocumentReference,
  type Firestore,
} from "firebase-admin/firestore";
import { amountsMatch } from "./status";

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

  return null;
}

export interface FulfillPaidOrderResult {
  outcome: "paid" | "already_paid" | "not_found" | "amount_mismatch";
  uid?: string;
  courseId?: string;
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

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(paymentRef);
    if (!snap.exists) {
      return { outcome: "not_found" as const };
    }

    const data = snap.data() as {
      uid?: string;
      courseId?: string;
      amount?: number;
      status?: string;
    };

    if (!amountsMatch(data.amount, amount)) {
      return { outcome: "amount_mismatch" as const };
    }

    const alreadyPaid = data.status === "paid";

    if (!alreadyPaid) {
      const paidAtValue =
        parseCompletedAtTimestamp(completedAt) ?? FieldValue.serverTimestamp();
      tx.update(paymentRef, {
        status: "paid",
        paidAt: paidAtValue,
        providerReference: reference,
        failureReason: null,
      });
    }

    // Toujours vérifier/activer l'inscription même si le paiement était déjà marqué paid
    if (data.uid && data.courseId) {
      const enrollmentRef = db
        .collection("enrollments")
        .doc(`${data.uid}_${data.courseId}`);
      const enrollmentSnap = await tx.get(enrollmentRef);

      if (enrollmentSnap.exists) {
        if (enrollmentSnap.data()?.status !== "active") {
          tx.update(enrollmentRef, {
            status: "active",
            source: "payment",
            paymentId: paymentRef.id,
            grantedAt: FieldValue.serverTimestamp(),
          });
        }
      } else {
        tx.set(enrollmentRef, {
          uid: data.uid,
          courseId: data.courseId,
          status: "active",
          source: "payment",
          paymentId: paymentRef.id,
          grantedAt: FieldValue.serverTimestamp(),
          progress: {
            completedLessonIds: [],
            lastLessonId: "",
          },
        });
      }
    }

    return {
      outcome: alreadyPaid ? ("already_paid" as const) : ("paid" as const),
      uid: data.uid,
      courseId: data.courseId,
    };
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
