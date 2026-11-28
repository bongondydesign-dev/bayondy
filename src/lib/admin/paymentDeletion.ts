export { chunkArray } from "./courseDeletion";

export function isPaymentsClearAllowed(
  paymentsCount: number,
  loading: boolean,
  deleting: boolean
): boolean {
  return !loading && !deleting && Number.isFinite(paymentsCount) && paymentsCount > 0;
}

export function validateClearPaymentsBody(
  body: unknown
): { ok: true } | { ok: false; error: string; status: number } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      error: "Konfimasyon obligatwa pou efase istwa peman yo.",
      status: 400,
    };
  }

  const record = body as Record<string, unknown>;
  if (record.confirm !== true) {
    return {
      ok: false,
      error: "Konfimasyon obligatwa pou efase istwa peman yo.",
      status: 400,
    };
  }

  return { ok: true };
}

export function buildClearedPaymentsState(): {
  payments: never[];
  nextCursor: null;
  search: string;
  statusFilter: "all";
} {
  return {
    payments: [],
    nextCursor: null,
    search: "",
    statusFilter: "all",
  };
}
