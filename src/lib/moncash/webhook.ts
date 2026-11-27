import crypto from "crypto";

export const MAX_WEBHOOK_TIMESTAMP_SKEW_SECONDS = 300;
const SIGNATURE_HEADER_REGEX = /^sha256=([0-9a-fA-F]{64})$/;
const TIMESTAMP_HEADER_REGEX = /^\d{1,13}$/;

export type MonCashWebhookEventType = "payment.completed" | "payment.failed";

export interface ParsedMonCashWebhookPayload {
  event: string;
  reference: string;
  amount: number | null;
  status: string | null;
  completedAt: string | number | null;
}

export type TimestampVerificationResult =
  | { ok: true; timestamp: number }
  | { ok: false; code: "MISSING_TIMESTAMP" | "INVALID_TIMESTAMP" | "TIMESTAMP_EXPIRED" };

/**
 * Vérifie que `x-mcc-timestamp` est un epoch en secondes valide
 * et que |now - timestamp| <= 300 secondes.
 */
export function verifyMonCashWebhookTimestamp(
  timestampHeader: string | null | undefined,
  nowEpochSeconds: number = Math.floor(Date.now() / 1000),
  maxSkewSeconds: number = MAX_WEBHOOK_TIMESTAMP_SKEW_SECONDS
): TimestampVerificationResult {
  const raw = typeof timestampHeader === "string" ? timestampHeader.trim() : "";
  if (!raw) {
    return { ok: false, code: "MISSING_TIMESTAMP" };
  }

  if (!TIMESTAMP_HEADER_REGEX.test(raw)) {
    return { ok: false, code: "INVALID_TIMESTAMP" };
  }

  const timestamp = Number(raw);
  if (!Number.isSafeInteger(timestamp) || timestamp <= 0) {
    return { ok: false, code: "INVALID_TIMESTAMP" };
  }

  if (Math.abs(nowEpochSeconds - timestamp) > maxSkewSeconds) {
    return { ok: false, code: "TIMESTAMP_EXPIRED" };
  }

  return { ok: true, timestamp };
}

/**
 * Calcule la signature attendue au format "sha256=<hex>" sur le corps brut.
 */
export function signMonCashWebhookPayload(rawBody: string, secret: string): string {
  const hex = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  return `sha256=${hex}`;
}

/**
 * Vérifie la signature HMAC-SHA256 (`x-mcc-signature: sha256=<hex>`)
 * en temps constant (`crypto.timingSafeEqual`) sur le corps brut.
 */
export function verifyMonCashWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string
): boolean {
  if (!secret || typeof rawBody !== "string") return false;

  const trimmedSig = typeof signatureHeader === "string" ? signatureHeader.trim() : "";
  const match = SIGNATURE_HEADER_REGEX.exec(trimmedSig);
  if (!match) return false;

  const providedHex = match[1].toLowerCase();
  const expectedHex = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const providedBuf = Buffer.from(providedHex, "hex");
  const expectedBuf = Buffer.from(expectedHex, "hex");

  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Désérialise et valide la structure du webhook MonCashConnect
 * (à appeler uniquement APRÈS vérification signature + timestamp).
 */
export function parseMonCashWebhookEvent(
  rawBody: string
): { ok: true; data: ParsedMonCashWebhookPayload } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, error: "Invalid JSON payload" };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "Webhook payload must be a JSON object" };
  }

  const obj = parsed as Record<string, unknown>;
  const nestedData =
    obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)
      ? (obj.data as Record<string, unknown>)
      : null;

  const eventRaw =
    typeof obj.event === "string"
      ? obj.event
      : typeof obj.type === "string"
        ? obj.type
        : "";
  const event = eventRaw.trim();

  const refCandidate =
    typeof obj.reference === "string"
      ? obj.reference
      : typeof obj.referenceId === "string"
        ? obj.referenceId
        : typeof obj.orderId === "string"
          ? obj.orderId
          : nestedData && typeof nestedData.reference === "string"
            ? nestedData.reference
            : nestedData && typeof nestedData.referenceId === "string"
              ? nestedData.referenceId
              : nestedData && typeof nestedData.orderId === "string"
                ? nestedData.orderId
                : "";
  const reference = refCandidate.trim();

  if (!event) {
    return { ok: false, error: "Missing event field" };
  }
  if (!reference || reference.length > 128) {
    return { ok: false, error: "Missing or invalid reference field" };
  }

  const rawAmount = obj.amount ?? nestedData?.amount;
  const amount =
    typeof rawAmount === "number" && Number.isFinite(rawAmount)
      ? rawAmount
      : null;
  const rawStatus = obj.status ?? nestedData?.status;
  const status = typeof rawStatus === "string" ? rawStatus.trim() : null;
  const rawCompletedAt = obj.completedAt ?? nestedData?.completedAt;
  const completedAt =
    typeof rawCompletedAt === "string" || typeof rawCompletedAt === "number"
      ? rawCompletedAt
      : null;

  return {
    ok: true,
    data: {
      event,
      reference,
      amount,
      status,
      completedAt,
    },
  };
}
