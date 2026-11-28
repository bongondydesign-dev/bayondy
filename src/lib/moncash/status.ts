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
 * Analyse la réponse JSON de GET /v1/pay-status?referenceId=...
 */
export function parseMonCashPayStatusResponse(
  payload: unknown
): { ok: true; data: ParsedMonCashPayStatus } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Invalid pay-status response" };
  }

  const root = payload as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : null;

  const rawStatus = root.status ?? nested?.status;
  const normalized = normalizeMonCashStatus(rawStatus);
  if (normalized === "unknown") {
    return { ok: false, error: "Unknown pay-status value" };
  }

  const refCandidate =
    typeof root.reference === "string"
      ? root.reference
      : typeof root.referenceId === "string"
        ? root.referenceId
        : typeof nested?.reference === "string"
          ? nested.reference
          : typeof nested?.referenceId === "string"
            ? nested.referenceId
            : "";
  const reference = refCandidate.trim() || null;

  const rawAmount = root.amount ?? nested?.amount;
  const amount =
    typeof rawAmount === "number" && Number.isFinite(rawAmount) ? rawAmount : null;

  const rawCompletedAt = root.completedAt ?? nested?.completedAt;
  const completedAt =
    typeof rawCompletedAt === "string" || typeof rawCompletedAt === "number"
      ? rawCompletedAt
      : null;

  const rawFailureReason = root.failureReason ?? nested?.failureReason;
  const failureReason =
    typeof rawFailureReason === "string" && rawFailureReason.trim()
      ? rawFailureReason.trim()
      : null;

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
