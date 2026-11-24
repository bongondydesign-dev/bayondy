import { NextRequest, NextResponse } from "next/server";
import { getTranzakConfig } from "@/lib/tranzak/config";
import { verifyWebhookSignature } from "@/lib/tranzak/crypto";
import { TranzakClient } from "@/lib/tranzak/client";
import {
  isEventAlreadyProcessed,
  recordProcessedEvent,
  fulfillPayment,
  markPaymentFailed,
} from "@/lib/tranzak/service";
import type { TranzakWebhookPayload } from "@/lib/tranzak/types";

/**
 * Endpoint de Webhook Tranzak (Section 7 du guide officiel).
 * Exclu de l'authentification et du CSRF — authentifié uniquement par la signature HMAC-SHA256.
 */
export async function POST(req: NextRequest) {
  let config;
  try {
    config = getTranzakConfig();
  } catch {
    return NextResponse.json(
      { error: "Konfigirasyon Tranzak pa disponib sou sèvè a." },
      { status: 500 }
    );
  }

  // 1. Récupération du corps brut (RAW request body bytes)
  const rawBody = await req.text();
  const signature = req.headers.get("x-tranzak-signature");

  // 2. Vérification STRICTE de la signature HMAC-SHA256 en temps constant (Section 7.1)
  const isSignatureValid = verifyWebhookSignature(
    rawBody,
    signature,
    config.webhookSecret
  );

  if (!isSignatureValid) {
    // Rejet 403 obligatoire si la signature ne correspond pas
    return NextResponse.json(
      { error: "Siyati webhook envalid oswa manke." },
      { status: 403 }
    );
  }

  // 3. Décodage du corps JSON
  let payload: TranzakWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as TranzakWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Fòma kò JSON la pa valid." },
      { status: 400 }
    );
  }

  const { event, data } = payload;
  if (!event || !data?.transaction_id) {
    return NextResponse.json(
      { error: "Done webhook enkonplè." },
      { status: 400 }
    );
  }

  // 4. Dédoublonnage d'événement (Section 7.2)
  const alreadyProcessed = await isEventAlreadyProcessed(
    data.transaction_id,
    event
  );
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, deduplicated: true }, { status: 200 });
  }

  try {
    if (event === "payment.success") {
      // 5. Preuve serveur obligatoire : Re-vérifier l'état auprès de Tranzak (Règle 3 & Section 11.4)
      const tranzak = new TranzakClient();
      const verified = await tranzak.getPayment(data.transaction_id);

      if (verified.data.status === "completed") {
        await fulfillPayment(data.transaction_id);
      }
    } else if (event === "payment.failed") {
      await markPaymentFailed(data.transaction_id, data.failure_reason);
    }

    // 6. Enregistrer l'événement comme traité
    await recordProcessedEvent(data.transaction_id, event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    // Si une erreur survient côté serveur, renvoyer 500 pour que Tranzak puisse retenter
    return NextResponse.json(
      { error: "Erè pandan tretman webhook la." },
      { status: 500 }
    );
  }
}
