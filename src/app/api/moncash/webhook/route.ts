import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  parseMonCashWebhookEvent,
  verifyMonCashWebhookSignature,
  verifyMonCashWebhookTimestamp,
} from "@/lib/moncash/webhook";

function parseCompletedAtTimestamp(
  value: string | number | null
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

export async function POST(req: NextRequest) {
  // 1. Lire le corps brut (raw body) AVANT toute désérialisation JSON
  const rawBody = await req.text();

  // 2. Récupérer le secret webhook uniquement depuis process.env
  const webhookSecret = process.env.MCC_WEBHOOK_SECRET
    ?.trim()
    .replace(/^(['"])([\s\S]*)\1$/, "$2")
    .trim();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured", code: "MCC_WEBHOOK_SECRET_MISSING" },
      { status: 503 }
    );
  }

  // 3. Récupérer les headers MonCashConnect
  const signatureHeader = req.headers.get("x-mcc-signature");
  const timestampHeader = req.headers.get("x-mcc-timestamp");

  // 4. Vérifier la fenêtre anti-rejeu (<= 300 secondes)
  const timestampCheck = verifyMonCashWebhookTimestamp(timestampHeader);
  if (!timestampCheck.ok) {
    return NextResponse.json(
      { error: "Invalid or expired webhook timestamp", code: timestampCheck.code },
      { status: 401 }
    );
  }

  // 5. Vérifier la signature HMAC-SHA256 sur le corps brut
  const signatureValid = verifyMonCashWebhookSignature(
    rawBody,
    signatureHeader,
    webhookSecret
  );
  if (!signatureValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature", code: "INVALID_SIGNATURE" },
      { status: 401 }
    );
  }

  // 6. Désérialiser le JSON uniquement après validation cryptographique
  const parsed = parseMonCashWebhookEvent(rawBody);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, code: "INVALID_PAYLOAD" },
      { status: 400 }
    );
  }

  const { event, reference, amount, status, completedAt } = parsed.data;

  if (!hasAdminCredentials()) {
    return NextResponse.json(
      { error: "Server database is not configured", code: "SERVER_CONFIG_MISSING" },
      { status: 503 }
    );
  }

  // Ignorer proprement en 200 les événements non gérés (retries MCC idempotents)
  if (
    event !== "payment.completed" &&
    event !== "payment.failed" &&
    event !== "payment.cancelled"
  ) {
    return NextResponse.json({ ok: true, ignored: true, event }, { status: 200 });
  }

  try {
    const db = getAdminDb();

    // 7. Retrouver la commande par reference === orderId (doc ID puis fallback orderId)
    const isSafeDocId =
      !reference.includes("/") && reference !== "." && reference !== "..";
    let paymentRef = isSafeDocId ? db.collection("payments").doc(reference) : null;
    const directSnap = paymentRef ? await paymentRef.get() : null;

    if (!directSnap || !directSnap.exists) {
      const byOrderId = await db
        .collection("payments")
        .where("orderId", "==", reference)
        .limit(1)
        .get();

      if (byOrderId.empty) {
        // Toujours répondre 200 pour éviter des retries infinis si référence inconnue
        return NextResponse.json(
          { ok: true, found: false, reference },
          { status: 200 }
        );
      }

      paymentRef = byOrderId.docs[0].ref;
    }

    if (!paymentRef) {
      return NextResponse.json(
        { ok: true, found: false, reference },
        { status: 200 }
      );
    }

    // 8. Mise à jour transactionnelle & idempotente de la commande (et accès cours si payée)
    const result = await db.runTransaction(async (tx) => {
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

      if (event === "payment.completed") {
        // Vérification de cohérence du montant si fourni
        if (
          typeof amount === "number" &&
          typeof data.amount === "number" &&
          Math.round(amount) !== Math.round(data.amount)
        ) {
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

        // Attribuer l'accès au cours de manière idempotente
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

        return { outcome: alreadyPaid ? ("already_paid" as const) : ("paid" as const) };
      }

      // event === "payment.failed" | "payment.cancelled"
      // Ne jamais rétrograder une commande déjà payée
      if (data.status === "paid") {
        return { outcome: "already_paid" as const };
      }
      if (data.status === "failed") {
        return { outcome: "already_failed" as const };
      }

      tx.update(paymentRef, {
        status: "failed",
        failureReason: status || event,
      });

      return { outcome: "failed" as const };
    });

    // 9. Répondre 200 toujours pour garantir l'idempotence des retries MCC
    return NextResponse.json(
      {
        ok: true,
        event,
        reference,
        outcome: result.outcome,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[moncash/webhook] Server error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Webhook processing failed", code: "WEBHOOK_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
