// server-only — logique métier Firestore pour les paiements et inscriptions Tranzak
import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { PaymentDoc } from "@/types/firestore";

export interface FulfillResult {
  success: boolean;
  alreadyPaid: boolean;
  courseId: string;
  uid: string;
}

/**
 * Vérifie si un événement webhook Tranzak a déjà été traité (Dédoublonnage Section 7.2).
 */
export async function isEventAlreadyProcessed(
  transactionId: string,
  event: string
): Promise<boolean> {
  const db = getAdminDb();
  const eventDocId = `${transactionId}_${event}`.replace(/[/\\#?]/g, "_");
  const doc = await db.collection("tranzakEvents").doc(eventDocId).get();
  return doc.exists;
}

/**
 * Enregistre un événement webhook comme traité pour éviter toute double exécution.
 */
export async function recordProcessedEvent(
  transactionId: string,
  event: string
): Promise<void> {
  const db = getAdminDb();
  const eventDocId = `${transactionId}_${event}`.replace(/[/\\#?]/g, "_");
  await db.collection("tranzakEvents").doc(eventDocId).set({
    transactionId,
    event,
    processedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Recherche un paiement dans Firestore par transaction_id Tranzak ou par référence marchand.
 */
export async function findPaymentDoc(
  transactionIdOrRef: string
): Promise<{ id: string; data: PaymentDoc } | null> {
  const db = getAdminDb();

  // 1. Recherche par tranzakReference
  const snapByTranzak = await db
    .collection("payments")
    .where("tranzakReference", "==", transactionIdOrRef)
    .limit(1)
    .get();

  if (!snapByTranzak.empty) {
    const doc = snapByTranzak.docs[0];
    return { id: doc.id, data: doc.data() as PaymentDoc };
  }

  // 2. Recherche par merchantReference
  const snapByRef = await db
    .collection("payments")
    .where("merchantReference", "==", transactionIdOrRef)
    .limit(1)
    .get();

  if (!snapByRef.empty) {
    const doc = snapByRef.docs[0];
    return { id: doc.id, data: doc.data() as PaymentDoc };
  }

  // 3. Recherche directe par ID de document
  const directDoc = await db.collection("payments").doc(transactionIdOrRef).get();
  if (directDoc.exists) {
    return { id: directDoc.id, data: directDoc.data() as PaymentDoc };
  }

  return null;
}

/**
 * Confirme et valide un paiement de façon strictement IDEMPOTENTE (Section 6 & 11).
 * Active l'accès au cours (inscription élève) dès que le paiement est confirmé par le serveur.
 */
export async function fulfillPayment(
  transactionId: string
): Promise<FulfillResult> {
  const db = getAdminDb();
  const paymentEntry = await findPaymentDoc(transactionId);

  if (!paymentEntry) {
    throw new Error(`Paiement introuvable pour la référence/transaction : ${transactionId}`);
  }

  const { id: paymentId, data: payment } = paymentEntry;

  // Idempotence stricte : si déjà payé, ne rien réexécuter
  if (payment.status === "paid") {
    return {
      success: true,
      alreadyPaid: true,
      courseId: payment.courseId,
      uid: payment.uid,
    };
  }

  const enrollmentId = `${payment.uid}_${payment.courseId}`;
  const enrollmentRef = db.collection("enrollments").doc(enrollmentId);
  const paymentRef = db.collection("payments").doc(paymentId);

  // Exécution dans un batch atomique
  const batch = db.batch();

  // 1. Mise à jour du paiement
  batch.update(paymentRef, {
    status: "paid",
    paidAt: FieldValue.serverTimestamp(),
    tranzakReference: transactionId,
  });

  // 2. Création ou réactivation de l'inscription
  const existingEnrollment = await enrollmentRef.get();

  if (existingEnrollment.exists) {
    // Si l'inscription existait déjà (ex: révoquée ou en attente), on la réactive en conservant son progrès
    batch.update(enrollmentRef, {
      status: "active",
      source: "payment",
      paymentId: paymentId,
      grantedAt: FieldValue.serverTimestamp(),
    });
  } else {
    // Nouvelle inscription
    batch.set(enrollmentRef, {
      uid: payment.uid,
      courseId: payment.courseId,
      status: "active",
      source: "payment",
      paymentId: paymentId,
      grantedAt: FieldValue.serverTimestamp(),
      progress: {
        completedLessonIds: [],
        lastLessonId: "",
      },
    });
  }

  await batch.commit();

  return {
    success: true,
    alreadyPaid: false,
    courseId: payment.courseId,
    uid: payment.uid,
  };
}

/**
 * Marque un paiement comme échoué (ex: webhook payment.failed ou expiration).
 */
export async function markPaymentFailed(
  transactionId: string,
  failureReason?: string | null
): Promise<void> {
  const db = getAdminDb();
  const paymentEntry = await findPaymentDoc(transactionId);

  if (!paymentEntry) return;

  // Ne pas écraser un paiement déjà confirmé
  if (paymentEntry.data.status === "paid") return;

  await db.collection("payments").doc(paymentEntry.id).update({
    status: "failed",
    failureReason: failureReason || "Paiement échoué ou annulé.",
  });
}
