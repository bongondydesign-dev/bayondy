export type NormalizedMonCashStatus = "completed" | "failed" | "pending" | "unknown";
export type NormalizedMonCashWebhookAction = "completed" | "failed" | "ignored";

export interface ParsedMonCashPayStatus {
  status: "completed" | "failed" | "pending";
  reference: string | null;
  amount: number | null;
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
 * Résout l'en-tête Origin à envoyer aux appels serveur vers MonCashConnect
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
  const candidates: Array<string | null | undefined> = [
    params.returnUrl,
    params.requestOriginHeader,
  ];

  const host = params.forwardedHost?.split(",")[0]?.trim();
  const rawProto = params.forwardedProto?.split(",")[0]?.trim().toLowerCase();
  const proto = rawProto === "http" ? "http" : "https";
  if (host && !/[\s/?#@]/.test(host)) {
    candidates.push(`${proto}://${host}`);
  }

  candidates.push(params.nextUrlOrigin, params.configuredSiteUrl);

  for (const candidate of candidates) {
    const safeOrigin = extractSafeHttpOrigin(candidate);
    if (safeOrigin) return safeOrigin;
  }

  return null;
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

/**
 * Vérifie la cohérence des montants (en HTG arrondis).
 * Si le montant du fournisseur est absent (null/undefined), n'échoue pas faussement.
 */
export function amountsMatch(expectedAmount: unknown, actualAmount: unknown): boolean {
  if (actualAmount === null || actualAmount === undefined) return true;
  if (typeof actualAmount !== "number" || !Number.isFinite(actualAmount)) return false;
  if (typeof expectedAmount !== "number" || !Number.isFinite(expectedAmount)) return true;
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
    asRecord(nestedData?.transaction),
    asRecord(nestedData?.payment),
  ].filter((obj): obj is Record<string, unknown> => obj !== null);

  let rawStatus: unknown;
  for (const obj of candidates) {
    const candidateStatus =
      obj.status ?? obj.paymentStatus ?? obj.transactionStatus ?? obj.state;
    if (candidateStatus !== undefined && candidateStatus !== null && candidateStatus !== "") {
      rawStatus = candidateStatus;
      break;
    }
  }

  const normalized = normalizeMonCashStatus(rawStatus);
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
      completedAt,
      failureReason,
    },
  };
}
