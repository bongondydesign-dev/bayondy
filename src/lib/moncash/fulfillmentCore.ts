import { amountsMatch } from "./status";

export interface TransactionDocSnapshotLike {
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}

export interface TransactionDocRefLike {
  id: string;
}

export interface FirestoreTransactionLike {
  get(ref: TransactionDocRefLike): Promise<TransactionDocSnapshotLike>;
  update(ref: TransactionDocRefLike, data: Record<string, unknown>): unknown;
  set(ref: TransactionDocRefLike, data: Record<string, unknown>): unknown;
}

export interface FulfillmentDbAdapter {
  getEnrollmentRef(uid: string, courseId: string): TransactionDocRefLike;
  runTransaction<T>(fn: (tx: FirestoreTransactionLike) => Promise<T>): Promise<T>;
}

export interface FulfillPaidOrderResult {
  outcome: "paid" | "already_paid" | "not_found" | "amount_mismatch";
  uid?: string;
  courseId?: string;
}

/**
 * Exécute la transaction Firestore de validation du paiement et d'activation
 * de l'inscription en respectant strictement l'ordre Firestore :
 * TOUTES les lectures (`tx.get`) avant TOUTE écriture (`tx.update` / `tx.set`).
 */
export async function runFulfillPaidOrderTransaction(params: {
  db: FulfillmentDbAdapter;
  paymentRef: TransactionDocRefLike;
  reference: string;
  amount: number | null;
  paidAtValue: unknown;
  serverTimestamp: unknown;
}): Promise<FulfillPaidOrderResult> {
  const { db, paymentRef, reference, amount, paidAtValue, serverTimestamp } =
    params;

  return db.runTransaction(async (tx) => {
    // 1. Toutes les lectures Firestore AVANT toute écriture
    const snap = await tx.get(paymentRef);
    if (!snap.exists) {
      return { outcome: "not_found" as const };
    }

    const data = (snap.data() ?? {}) as {
      uid?: string;
      courseId?: string;
      amount?: number;
      status?: string;
    };

    const alreadyPaid = data.status === "paid";

    if (
      !amountsMatch(data.amount, amount, {
        requireActual: !alreadyPaid,
      })
    ) {
      return { outcome: "amount_mismatch" as const };
    }

    const enrollmentRef =
      data.uid && data.courseId
        ? db.getEnrollmentRef(data.uid, data.courseId)
        : null;
    const enrollmentSnap = enrollmentRef ? await tx.get(enrollmentRef) : null;

    // 2. Toutes les écritures Firestore APRÈS la fin de toutes les lectures
    if (!alreadyPaid) {
      tx.update(paymentRef, {
        status: "paid",
        paidAt: paidAtValue ?? serverTimestamp,
        providerReference: reference,
        failureReason: null,
      });
    }

    // Toujours vérifier/activer l'inscription même si le paiement était déjà marqué paid
    if (enrollmentRef && enrollmentSnap) {
      if (enrollmentSnap.exists) {
        if (enrollmentSnap.data()?.status !== "active") {
          tx.update(enrollmentRef, {
            status: "active",
            source: "payment",
            paymentId: paymentRef.id,
            grantedAt: serverTimestamp,
          });
        }
      } else {
        tx.set(enrollmentRef, {
          uid: data.uid,
          courseId: data.courseId,
          status: "active",
          source: "payment",
          paymentId: paymentRef.id,
          grantedAt: serverTimestamp,
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
