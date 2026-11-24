import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { TranzakClient, TranzakApiError } from "@/lib/tranzak/client";
import type { TranzakPaymentMethod } from "@/lib/tranzak/types";
import type { CourseDoc, EnrollmentDoc } from "@/types/firestore";

export async function POST(req: NextRequest) {
  // 1. Authentification élève obligatoire
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Kò demann lan pa yon JSON valid." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Done demann lan envalid." }, { status: 400 });
  }

  const { courseId, paymentMethod } = body as {
    courseId?: string;
    paymentMethod?: TranzakPaymentMethod;
  };

  if (!courseId || typeof courseId !== "string") {
    return NextResponse.json({ error: "Idantifyan fòmasyon an obligatwa." }, { status: 400 });
  }

  const validMethods: TranzakPaymentMethod[] = ["moncash", "natcash", "card"];
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    return NextResponse.json(
      { error: "Mwayen peman an dwe: 'moncash', 'natcash' oswa 'card'." },
      { status: 400 }
    );
  }

  const db = getAdminDb();

  // 2. Vérifier l'existence et la publication du cours
  const courseDocRef = db.collection("courses").doc(courseId);
  const courseSnap = await courseDocRef.get();

  if (!courseSnap.exists) {
    return NextResponse.json({ error: "Fòmasyon sa a pa egziste." }, { status: 404 });
  }

  const course = courseSnap.data() as CourseDoc;
  if (course.status !== "published") {
    return NextResponse.json(
      { error: "Fòmasyon sa a pa disponib pou lavant kounye a." },
      { status: 400 }
    );
  }

  // 3. Vérifier si l'élève a déjà une inscription active (Règle anti-doublon)
  const enrollmentId = `${auth.user.uid}_${courseId}`;
  const enrollmentSnap = await db.collection("enrollments").doc(enrollmentId).get();
  if (enrollmentSnap.exists) {
    const enr = enrollmentSnap.data() as EnrollmentDoc;
    if (enr.status === "active") {
      return NextResponse.json(
        { error: "Ou deja enskri nan fòmasyon sa a." },
        { status: 400 }
      );
    }
  }

  // 4. Calcul du montant et de la devise STRICTEMENT CÔTÉ SERVEUR (Règle 4)
  // Jamais de montant envoyé par le client !
  let amount: number;
  let currency: "HTG" | "USD";

  if (paymentMethod === "moncash" || paymentMethod === "natcash") {
    if (course.priceHTG && course.priceHTG > 0) {
      amount = course.priceHTG;
      currency = "HTG";
    } else if (course.priceUSD && course.priceUSD > 0) {
      amount = course.priceUSD;
      currency = "USD"; // Tranzak convertira automatiquement en HTG selon le taux
    } else {
      return NextResponse.json(
        { error: "Pri fòmasyon sa a poko defini." },
        { status: 400 }
      );
    }
  } else {
    // Carte bancaire
    if (course.priceUSD && course.priceUSD > 0) {
      amount = course.priceUSD;
      currency = "USD";
    } else if (course.priceHTG && course.priceHTG > 0) {
      amount = course.priceHTG;
      currency = "HTG";
    } else {
      return NextResponse.json(
        { error: "Pri fòmasyon sa a poko defini." },
        { status: 400 }
      );
    }
  }

  // 5. Générer une référence unique marchand pour idempotence (Section 8.4)
  const merchantReference = `BYD-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  const customerName =
    auth.user.displayName?.trim() ||
    auth.user.email?.split("@")[0] ||
    "Elèv BAYONDY";
  const customerEmail = auth.user.email || undefined;

  // 6. Pré-création du document de paiement dans Firestore
  const paymentRef = db.collection("payments").doc();
  await paymentRef.set({
    uid: auth.user.uid,
    courseId,
    amount,
    currency,
    method: paymentMethod,
    merchantReference,
    tranzakReference: "", // Sera mis à jour avec transaction_id
    status: "pending",
    paymentUrl: null,
    failureReason: null,
    createdAt: FieldValue.serverTimestamp(),
    paidAt: null,
  });

  // 7. Appel vers Tranzak Gateway
  const tranzak = new TranzakClient();
  try {
    const tranzakRes = await tranzak.createPayment({
      amount,
      currency,
      payment_method: paymentMethod,
      customer_name: customerName,
      customer_email: customerEmail,
      reference: merchantReference,
      description: `Achte kou: ${course.title}`,
      metadata: {
        paymentDocId: paymentRef.id,
        courseId,
        uid: auth.user.uid,
        courseSlug: course.slug,
      },
    });

    // 8. Stocker le transaction_id Tranzak avant toute redirection (Règle Section 4.1)
    await paymentRef.update({
      tranzakReference: tranzakRes.transaction_id,
      paymentUrl: tranzakRes.payment_url || null,
    });

    return NextResponse.json({
      success: true,
      transactionId: tranzakRes.transaction_id,
      paymentUrl: tranzakRes.payment_url || null,
      clientSecret: tranzakRes.client_secret || null,
      publishableKey: tranzakRes.publishable_key || null,
      paymentIntentId: tranzakRes.payment_intent_id || null,
    });
  } catch (err) {
    // Si la création échoue chez le fournisseur, marquer le paiement en échec
    const message =
      err instanceof TranzakApiError
        ? err.message
        : "Erè pandan kreyasyon peman an.";

    await paymentRef.update({
      status: "failed",
      failureReason: message,
    });

    return NextResponse.json(
      { error: message },
      { status: err instanceof TranzakApiError ? err.statusCode : 500 }
    );
  }
}
