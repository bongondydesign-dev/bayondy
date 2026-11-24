// server-only — calculs cryptographiques et vérification de signature Tranzak
import "server-only";
import crypto from "crypto";

/**
 * Vérifie la signature HMAC-SHA256 d'un webhook Tranzak (Section 7.1 du guide).
 *
 * @param rawBody - Le corps brut de la requête (Buffer ou string reçu sans ré-encodage)
 * @param signatureHeader - La valeur de l'en-tête X-Tranzak-Signature
 * @param secret - La clé secrète du webhook (TRANZAK_WEBHOOK_SECRET)
 * @returns true si la signature est valide, false sinon
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  secret: string
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const cleanSignature = signatureHeader.trim().toLowerCase();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")
    .toLowerCase();

  if (cleanSignature.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf-8"),
    Buffer.from(cleanSignature, "utf-8")
  );
}

/**
 * Vérifie la signature de redirection de retour client (Section 8.2 du guide).
 *
 * Message signé = la chaîne de requête (query string) exacte sans le suffixe "&signature=<hex>".
 * Ordre d'origine des paramètres conservé (aucun tri).
 *
 * @param rawQueryString - Chaîne de requête brute (ex: "transaction_id=123&status=success...&signature=abc")
 * @param secret - La clé secrète du webhook (TRANZAK_WEBHOOK_SECRET)
 * @returns true si la signature est valide, false sinon
 */
export function verifyReturnSignature(
  rawQueryString: string,
  secret: string
): boolean {
  if (!rawQueryString || !secret) {
    return false;
  }

  // Retirer tout '?' initial éventuel
  const cleanQuery = rawQueryString.startsWith("?")
    ? rawQueryString.slice(1)
    : rawQueryString;

  const signaturePrefix = "&signature=";
  const signatureIndex = cleanQuery.indexOf(signaturePrefix);

  if (signatureIndex === -1) {
    return false;
  }

  const payload = cleanQuery.slice(0, signatureIndex);
  const signature = cleanQuery.slice(signatureIndex + signaturePrefix.length).trim().toLowerCase();

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
    .toLowerCase();

  if (signature.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}
