export type NormalizedMonCashStatus = "completed" | "failed" | "pending" | "unknown";
export type NormalizedMonCashWebhookAction = "completed" | "failed" | "ignored";

export interface ParsedMonCashPayStatus {
  status: "completed" | "failed" | "pending";
  reference: string | null;
  amount: number | null;
  currency: string | null;
  completedAt: string | number | null;
  failureReason: string | null;
}

const COMPLETED_STATUSES = new Set([
  "completed",
  "complete",
  "complété",
  "completee",
  "confirmed",
  "paid",
  "success",
  "succeeded",
]);

const FAILED_STATUSES = new Set([
  "failed",
  "cancelled",
  "canceled",
  "expired",
  "rejected",
]);

const PENDING_STATUSES = new Set([
  "pending",
  "awaiting_payment",
  "processing",
  "created",
]);

const SAFE_ORIGIN_REGEX = /^https?:\/\/[^/\s]+$/i;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function parseNumericAmount(rawAmount: unknown): number | null {
  if (typeof rawAmount === "number" && Number.isFinite(rawAmount)) {
    return rawAmount;
  }
  if (typeof rawAmount === "string") {
    const trimmed = rawAmount.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

/**
 * Extrait une origine HTTP(S) stricte (sans chemin, requête ou fragment).
 */
export function extractSafeHttpOrigin(rawUrlOrOrigin: unknown): string | null {
  if (typeof rawUrlOrOrigin !== "string") return null;
  const trimmed = rawUrlOrOrigin.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    if (!parsed.hostname || !SAFE_ORIGIN_REGEX.test(parsed.origin)) {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Lit la clé secrète MonCashConnect côté serveur (MCC_SECRET_KEY ou alias MCC_SECRET).
 */
export function resolveMonCashSecretKey(env: Record<string, string | undefined>): string {
  const raw = env.MCC_SECRET_KEY || env.MCC_SECRET || "";
  return raw
    .trim()
    .replace(/^(['"])([\s\S]*)\1$/, "$2")
    .trim();
}

export type MonCashKeyEnvValidation =
  | { ok: true; key: string; mode: "live" | "sandbox" }
  | { ok: false; code: "MCC_SECRET_MISSING" | "MCC_KEY_ENV_MISMATCH" };

/**
 * Empêche d'utiliser une clé de test (sk_test_proj_*) en production
 * et une clé live (sk_proj_*) en environnement sandbox/preview/dev.
 */
export function validateMonCashSecretKeyForEnv(
  secretKey: string,
  env: Record<string, string | undefined>
): MonCashKeyEnvValidation {
  const trimmed = secretKey.trim();
  if (!trimmed) {
    return { ok: false, code: "MCC_SECRET_MISSING" };
  }

  const isProduction =
    env.VERCEL_ENV === "production" ||
    (!env.VERCEL_ENV && env.NODE_ENV === "production");

  const isTestKey = trimmed.startsWith("sk_test_");
  const isLiveKey = trimmed.startsWith("sk_proj_") || trimmed.startsWith("sk_live_");

  if (isProduction && isTestKey) {
    return { ok: false, code: "MCC_KEY_ENV_MISMATCH" };
  }
  if (!isProduction && isLiveKey) {
    return { ok: false, code: "MCC_KEY_ENV_MISMATCH" };
  }

  return {
    ok: true,
    key: trimmed,
    mode: isTestKey ? "sandbox" : "live",
  };
}

/**
 * Retourne uniquement les origines de site épinglées par configuration serveur
 * (jamais d'en-têtes Host / X-Forwarded-Host / Origin arbitraires en production).
 */
export function resolvePinnedSiteOrigins(
  env: Record<string, string | undefined>,
  fallbackRequestOrigin?: string | null
): string[] {
  const unique: string[] = [];
  const candidates: Array<string | undefined> = [
    env.NEXT_PUBLIC_SITE_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined,
    env.APP_URL,
  ];

  for (const candidate of candidates) {
    const safe = extractSafeHttpOrigin(candidate);
    if (safe && !unique.includes(safe)) {
      unique.push(safe);
    }
  }

  const fallbackSafe = extractSafeHttpOrigin(fallbackRequestOrigin);
  if (fallbackSafe) {
    const parsed = new URL(fallbackSafe);
    const isLocalhost =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1";
    const isProduction =
      env.VERCEL_ENV === "production" ||
      (!env.VERCEL_ENV && env.NODE_ENV === "production");

    if ((unique.length === 0 && !isProduction) || (isLocalhost && !isProduction)) {
      if (!unique.includes(fallbackSafe)) {
        unique.push(fallbackSafe);
      }
    }
  }

  return unique;
}

/**
 * Retourne la liste ordonnée et dédupliquée des origines HTTP(S) candidates
 * pour les appels serveur vers MonCashConnect.
 */
export function resolveMonCashCandidateOrigins(params: {
  returnUrl?: string | null;
  requestOriginHeader?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  nextUrlOrigin?: string | null;
  configuredSiteUrl?: string | null;
}): string[] {
  const rawCandidates: Array<string | null | undefined> = [
    params.returnUrl,
    params.requestOriginHeader,
  ];

  const host = params.forwardedHost?.split(",")[0]?.trim();
  const rawProto = params.forwardedProto?.split(",")[0]?.trim().toLowerCase();
  const proto = rawProto === "http" ? "http" : "https";
  if (host && !/[\s/?#@]/.test(host)) {
    rawCandidates.push(`${proto}://${host}`);
  }

  rawCandidates.push(params.nextUrlOrigin, params.configuredSiteUrl);

  const unique: string[] = [];
  for (const candidate of rawCandidates) {
    const safeOrigin = extractSafeHttpOrigin(candidate);
    if (safeOrigin && !unique.includes(safeOrigin)) {
      unique.push(safeOrigin);
    }
  }
  return unique;
}

/**
 * Résout l'en-tête Origin principal à envoyer aux appels serveur vers MonCashConnect
 * (ex: GET /v1/pay-status), en priorité depuis returnUrl puis les en-têtes HTTP.
 */
export function resolveMonCashRequestOrigin(params: {
  returnUrl?: string | null;
  requestOriginHeader?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  nextUrlOrigin?: string | null;
  configuredSiteUrl?: string | null;
}): string | null {
  return resolveMonCashCandidateOrigins(params)[0] ?? null;
}

/**
 * Extrait un code et un message diagnostique sûrs depuis une réponse d'erreur JSON MCC.
 */
export function extractSafeUpstreamError(payload: unknown): {
  code: string | null;
  message: string | null;
} {
  const obj = asRecord(payload);
  if (!obj) return { code: null, message: null };
  const nested = asRecord(obj.data);
  const rawCode = obj.code ?? nested?.code;
  const rawMessage = obj.error ?? obj.message ?? nested?.error ?? nested?.message;

  const code =
    typeof rawCode === "string" && rawCode.trim()
      ? rawCode.trim().slice(0, 80)
      : null;
  const message =
    typeof rawMessage === "string" && rawMessage.trim()
      ? rawMessage.trim().slice(0, 220)
      : null;

  return { code, message };
}

/**
 * Construit les en-têtes requis pour GET /v1/pay-status côté serveur.
 */
export function buildMonCashPayStatusHeaders(
  secretKey: string,
  origin?: string | null
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    Accept: "application/json",
  };

  const safeOrigin = extractSafeHttpOrigin(origin);
  if (safeOrigin) {
    headers.Origin = safeOrigin;
  }

  return headers;
}

/**
 * Construit la liste ordonnée et dédupliquée d'URLs à tester sur /v1/pay-status
 * (?referenceId=... puis fallback ?reference=...).
 */
export function buildMonCashPayStatusLookupUrls(
  baseUrl: string,
  references: Array<string | null | undefined>
): string[] {
  const uniqueRefs: string[] = [];
  for (const ref of references) {
    if (typeof ref !== "string") continue;
    const trimmed = ref.trim();
    if (!trimmed || uniqueRefs.includes(trimmed)) continue;
    uniqueRefs.push(trimmed);
  }

  const urls: string[] = [];
  for (const ref of uniqueRefs) {
    const encoded = encodeURIComponent(ref);
    urls.push(`${baseUrl}?referenceId=${encoded}`);
    urls.push(`${baseUrl}?reference=${encoded}`);
  }

  return urls;
}

/**
 * Normalise un statut MonCashConnect brut vers un état canonique.
 */
export function normalizeMonCashStatus(rawStatus: unknown): NormalizedMonCashStatus {
  if (typeof rawStatus !== "string") return "unknown";
  const normalized = rawStatus.trim().toLowerCase();
  if (COMPLETED_STATUSES.has(normalized)) return "completed";
  if (FAILED_STATUSES.has(normalized)) return "failed";
  if (PENDING_STATUSES.has(normalized)) return "pending";
  return "unknown";
}

/**
 * Détermine l'action à exécuter pour un événement webhook MonCashConnect.
 */
export function normalizeMonCashWebhookEvent(
  rawEvent: unknown,
  rawStatus: unknown
): NormalizedMonCashWebhookAction {
  const event = typeof rawEvent === "string" ? rawEvent.trim().toLowerCase() : "";
  const status = normalizeMonCashStatus(rawStatus);

  if (
    event === "payment.completed" ||
    event === "payment.succeeded" ||
    event === "payment.paid" ||
    (event === "payment.updated" && status === "completed")
  ) {
    return "completed";
  }

  if (
    event === "payment.failed" ||
    event === "payment.cancelled" ||
    event === "payment.canceled" ||
    event === "payment.expired" ||
    (event === "payment.updated" && status === "failed")
  ) {
    return "failed";
  }

  return "ignored";
}

export const PAYMENT_EXPIRATION_MS = 24 * 60 * 60 * 1000;
export const RECENT_CHECKOUT_REUSE_MS = 15 * 60 * 1000;

export function isPaymentExpired24h(
  createdAtMs: number | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (typeof createdAtMs !== "number" || !Number.isFinite(createdAtMs) || createdAtMs <= 0) {
    return false;
  }
  return nowMs - createdAtMs >= PAYMENT_EXPIRATION_MS;
}

export function isCheckoutSessionReusable(
  createdAtMs: number | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (typeof createdAtMs !== "number" || !Number.isFinite(createdAtMs) || createdAtMs <= 0) {
    return false;
  }
  const age = nowMs - createdAtMs;
  return age >= 0 && age < RECENT_CHECKOUT_REUSE_MS;
}

export function isAllowedMonCashCurrency(rawCurrency: unknown): boolean {
  if (rawCurrency === null || rawCurrency === undefined || rawCurrency === "") {
    return true;
  }
  return typeof rawCurrency === "string" && rawCurrency.trim().toUpperCase() === "HTG";
}

/**
 * Vérifie la cohérence des montants (en HTG arrondis).
 * Lorsque `requireActual` est true (nouveau paiement complété), un montant absent est refusé.
 */
export function amountsMatch(
  expectedAmount: unknown,
  actualAmount: unknown,
  options: { requireActual?: boolean } = {}
): boolean {
  if (actualAmount === null || actualAmount === undefined) {
    return options.requireActual ? false : true;
  }
  if (typeof actualAmount !== "number" || !Number.isFinite(actualAmount) || actualAmount <= 0) {
    return false;
  }
  if (typeof expectedAmount !== "number" || !Number.isFinite(expectedAmount) || expectedAmount <= 0) {
    return false;
  }
  return Math.round(expectedAmount) === Math.round(actualAmount);
}

/**
 * Analyse la réponse JSON de GET /v1/pay-status?referenceId=... ou ?reference=...
 */
export function parseMonCashPayStatusResponse(
  payload: unknown
): { ok: true; data: ParsedMonCashPayStatus } | { ok: false; error: string } {
  const root = asRecord(payload);
  if (!root) {
    return { ok: false, error: "Invalid pay-status response" };
  }

  const nestedData = asRecord(root.data);
  const candidates = [
    root,
    nestedData,
    asRecord(root.transaction),
    asRecord(root.payment),
    asRecord(root.result),
    asRecord(root.payload),
    asRecord(nestedData?.transaction),
    asRecord(nestedData?.payment),
  ].filter((obj): obj is Record<string, unknown> => obj !== null);

  let rawStatus: unknown;
  for (const obj of candidates) {
    const candidateStatus =
      obj.status ??
      obj.paymentStatus ??
      obj.transactionStatus ??
      obj.txStatus ??
      obj.state;
    if (candidateStatus !== undefined && candidateStatus !== null && candidateStatus !== "") {
      rawStatus = candidateStatus;
      break;
    }
  }

  let normalized = normalizeMonCashStatus(rawStatus);
  if (normalized === "unknown") {
    for (const obj of candidates) {
      if (obj.paid === true || obj.isPaid === true || obj.completed === true) {
        normalized = "completed";
        break;
      }
    }
  }
  if (normalized === "unknown") {
    return { ok: false, error: "Unknown pay-status value" };
  }

  let reference: string | null = null;
  for (const obj of candidates) {
    for (const key of ["reference", "referenceId", "orderId", "transactionId"] as const) {
      const value = obj[key];
      if (typeof value === "string" && value.trim()) {
        reference = value.trim();
        break;
      }
    }
    if (reference) break;
  }

  let amount: number | null = null;
  for (const obj of candidates) {
    const parsedAmount = parseNumericAmount(obj.amount);
    if (parsedAmount !== null) {
      amount = parsedAmount;
      break;
    }
  }

  let currency: string | null = null;
  for (const obj of candidates) {
    if (typeof obj.currency === "string" && obj.currency.trim()) {
      currency = obj.currency.trim().toUpperCase();
      break;
    }
  }

  let completedAt: string | number | null = null;
  for (const obj of candidates) {
    const value = obj.completedAt ?? obj.paidAt ?? obj.updatedAt;
    if (typeof value === "string" && value.trim()) {
      completedAt = value.trim();
      break;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      completedAt = value;
      break;
    }
  }

  let failureReason: string | null = null;
  for (const obj of candidates) {
    const value = obj.failureReason ?? obj.reason ?? obj.error;
    if (typeof value === "string" && value.trim()) {
      failureReason = value.trim();
      break;
    }
  }

  return {
    ok: true,
    data: {
      status: normalized,
      reference,
      amount,
      currency,
      completedAt,
      failureReason,
    },
  };
}
