import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  findPaymentRefByReference,
  fulfillPaidOrderTransaction,
  markFailedOrderTransaction,
} from "@/lib/moncash/fulfillment";
import {
  isAllowedMonCashCurrency,
  normalizeMonCashWebhookEvent,
} from "@/lib/moncash/status";
import {
  parseMonCashWebhookEvent,
  verifyMonCashWebhookSignature,
  verifyMonCashWebhookSignatureV2,
  verifyMonCashWebhookTimestamp,
} from "@/lib/moncash/webhook";
import { readRawTextWithLimit } from "@/lib/server/requestGuards";

export async function POST(req: NextRequest) {
  // 1. Lire le corps brut (raw body) borné (<= 64 Ko) AVANT toute désérialisation JSON
  const rawResult = await readRawTextWithLimit(req, 64 * 1024);
  if (!rawResult.ok) {
    return NextResponse.json(
      { error: rawResult.error, code: rawResult.code },
      { status: rawResult.status }
    );
  }
  const rawBody = rawResult.rawText;

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

  // 3. Récupérer les headers MonCashConnect (V2 recommandé + horodatage)
  const signatureV2Header = req.headers.get("x-mcc-signature-v2");
  const signatureV1Header =
    req.headers.get("x-mcc-signature") ??
    req.headers.get("x-moncashconnect-signature");
  const timestampHeader = req.headers.get("x-mcc-timestamp");

  // 4. Vérifier la fenêtre anti-rejeu (<= 300 secondes)
  const timestampCheck = verifyMonCashWebhookTimestamp(timestampHeader);
  if (!timestampCheck.ok) {
    return NextResponse.json(
      { error: "Invalid or expired webhook timestamp", code: timestampCheck.code },
      { status: 401 }
    );
  }

  // 5. Vérifier la signature HMAC-SHA256 en temps constant :
  //    - Si X-MCC-Signature-V2 est présent, exiger strictement V2 (`${timestamp}.${rawBody}`).
  //    - Sinon, autoriser V1 uniquement si MCC_WEBHOOK_ALLOW_V1 === "true" (évite le downgrade anti-rejeu).
  let signatureValid = false;
  if (signatureV2Header) {
    signatureValid = verifyMonCashWebhookSignatureV2(
      rawBody,
      timestampHeader,
      signatureV2Header,
      webhookSecret
    );
  } else if (process.env.MCC_WEBHOOK_ALLOW_V1 === "true") {
    signatureValid = verifyMonCashWebhookSignature(
      rawBody,
      signatureV1Header,
      webhookSecret
    );
  }

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

  const { event, reference, amount, currency, status, completedAt } = parsed.data;

  if (!hasAdminCredentials()) {
    return NextResponse.json(
      { error: "Server database is not configured", code: "SERVER_CONFIG_MISSING" },
      { status: 503 }
    );
  }

  const action = normalizeMonCashWebhookEvent(event, status);

  // Ignorer proprement en 200 les événements non gérés (retries MCC idempotents)
  if (action === "ignored") {
    return NextResponse.json({ ok: true, ignored: true, event }, { status: 200 });
  }

  if (action === "completed" && !isAllowedMonCashCurrency(currency)) {
    console.warn("[moncash/webhook] Currency mismatch rejected", {
      event,
      reference,
    });
    return NextResponse.json(
      { ok: true, event, reference, outcome: "currency_mismatch" },
      { status: 200 }
    );
  }

  try {
    const db = getAdminDb();

    // 7. Retrouver la commande par reference === orderId (doc ID puis fallback orderId)
    const paymentRef = await findPaymentRefByReference(db, reference);
    if (!paymentRef) {
      // Toujours répondre 200 pour éviter des retries infinis si référence inconnue
      return NextResponse.json(
        { ok: true, found: false, reference },
        { status: 200 }
      );
    }

    // 8. Mise à jour transactionnelle & idempotente de la commande (et accès cours si payée)
    const outcome =
      action === "completed"
        ? (
            await fulfillPaidOrderTransaction({
              db,
              paymentRef,
              reference,
              amount,
              completedAt,
            })
          ).outcome
        : await markFailedOrderTransaction({
            db,
            paymentRef,
            failureReason: status || event,
          });

    if (outcome === "amount_mismatch") {
      console.warn("[moncash/webhook] Amount mismatch detected — access withheld", {
        event,
        reference,
      });
    }

    // 9. Répondre 200 toujours pour garantir l'idempotence des retries MCC
    return NextResponse.json(
      {
        ok: true,
        event,
        reference,
        outcome,
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
