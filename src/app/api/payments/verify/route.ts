import { NextRequest, NextResponse } from "next/server";
import { TranzakClient, TranzakApiError } from "@/lib/tranzak/client";
import { findPaymentDoc, fulfillPayment, markPaymentFailed } from "@/lib/tranzak/service";
import { getAdminDb } from "@/lib/firebase-admin";
import type { CourseDoc } from "@/types/firestore";

/**
 * Endpoint de vérification côté serveur d'un paiement (Section 4.4 & 6.3).
 * Appelé par la page de retour client ou par le polling de réconciliation.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const transactionId = url.searchParams.get("transactionId")?.trim();
  const reference = url.searchParams.get("reference")?.trim();

  const lookupKey = transactionId || reference;
  if (!lookupKey) {
    return NextResponse.json(
      { error: "Paramèt transactionId oswa reference obligatwa." },
      { status: 400 }
    );
  }

  // 1. Trouver le document de paiement dans Firestore
  const paymentEntry = await findPaymentDoc(lookupKey);
  if (!paymentEntry) {
    return NextResponse.json(
      { error: "Peman sa a pa jwenn nan baz done a." },
      { status: 404 }
    );
  }

  const payment = paymentEntry.data;

  // Récupérer le slug du cours pour la redirection
  const db = getAdminDb();
  let courseSlug = "";
  const courseDoc = await db.collection("courses").doc(payment.courseId).get();
  if (courseDoc.exists) {
    courseSlug = (courseDoc.data() as CourseDoc).slug;
  }

  // 2. Si déjà marqué comme payé, renvoyer immédiatement le statut final
  if (payment.status === "paid") {
    return NextResponse.json({
      success: true,
      status: "completed",
      isPaid: true,
      courseId: payment.courseId,
      courseSlug,
    });
  }

  // 3. Si aucun tranzakReference n'est encore associé
  const tranzakId = payment.tranzakReference || transactionId;
  if (!tranzakId) {
    return NextResponse.json({
      success: true,
      status: payment.status,
      isPaid: false,
      courseId: payment.courseId,
      courseSlug,
    });
  }

  // 4. Appel actif de vérification auprès de la passerelle Tranzak (Section 4.4)
  try {
    const tranzak = new TranzakClient();
    const verifyRes = await tranzak.verifyPayment(tranzakId);
    const tranzakStatus = verifyRes.data.status;

    if (tranzakStatus === "completed") {
      await fulfillPayment(tranzakId);
      return NextResponse.json({
        success: true,
        status: "completed",
        isPaid: true,
        courseId: payment.courseId,
        courseSlug,
      });
    }

    if (tranzakStatus === "failed") {
      await markPaymentFailed(tranzakId, "Echèk konfime pa Tranzak.");
      return NextResponse.json({
        success: true,
        status: "failed",
        isPaid: false,
        courseId: payment.courseId,
        courseSlug,
      });
    }

    return NextResponse.json({
      success: true,
      status: tranzakStatus,
      isPaid: false,
      courseId: payment.courseId,
      courseSlug,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof TranzakApiError
            ? err.message
            : "Erè pandan verifikasyon peman an.",
        status: payment.status,
        isPaid: false,
      },
      { status: 500 }
    );
  }
}
