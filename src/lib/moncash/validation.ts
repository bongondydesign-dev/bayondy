export const MAX_MONCASH_AMOUNT_HTG = 10_000_000;
export const ORDER_ID_REGEX = /^[A-Za-z0-9_-]{3,128}$/;
const COURSE_ID_REGEX = /^[A-Za-z0-9_-]{1,128}$/;

export interface ValidatedMonCashCreateInput {
  amount: number;
  orderId: string;
  returnUrl: string;
  courseId?: string;
}

export type MonCashValidationResult =
  | { ok: true; data: ValidatedMonCashCreateInput }
  | { ok: false; status: number; code: string; error: string };

/**
 * Vérifie qu'une URL de redirection est une URL HTTP(S) sûre.
 * Bloque javascript:, data:, file:, etc. En production, privilégie https://
 * (http:// autorisé uniquement pour localhost/127.0.0.1 en développement).
 */
export function isSafePaymentRedirectUrl(rawUrl: unknown): rawUrl is string {
  if (typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:") {
      return Boolean(parsed.hostname);
    }
    if (parsed.protocol === "http:") {
      return (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1"
      );
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Génère un identifiant de commande unique compatible MonCashConnect.
 */
export function createMonCashOrderId(courseId?: string): string {
  const safePrefix = (courseId || "cmd")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 20);
  const ts = Date.now().toString(36);
  const rand =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `byd_${safePrefix || "cmd"}_${ts}_${rand}`.slice(0, 128);
}

/**
 * Valide strictement les paramètres reçus sur POST /api/moncash/create.
 */
export function validateMonCashCreateInput(
  rawBody: unknown,
  allowedOrigins: string[] = []
): MonCashValidationResult {
  if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_PAYLOAD",
      error: "Kò rekèt la pa valid.",
    };
  }

  const body = rawBody as Record<string, unknown>;

  // 1. Montant entier positif en HTG
  const amount = body.amount;
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    amount > MAX_MONCASH_AMOUNT_HTG
  ) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_AMOUNT",
      error: "Montan an dwe yon nonb antye pozitif an HTG.",
    };
  }

  // 2. Identifiant de commande (orderId)
  const rawOrderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!ORDER_ID_REGEX.test(rawOrderId)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_ORDER_ID",
      error: "orderId pa valid.",
    };
  }

  // 3. URL de retour (returnUrl)
  const rawReturnUrl =
    typeof body.returnUrl === "string" ? body.returnUrl.trim() : "";
  if (!isSafePaymentRedirectUrl(rawReturnUrl)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_RETURN_URL",
      error: "returnUrl pa valid.",
    };
  }

  if (allowedOrigins.length > 0) {
    const parsedOrigin = new URL(rawReturnUrl).origin;
    if (!allowedOrigins.includes(parsedOrigin)) {
      return {
        ok: false,
        status: 400,
        code: "UNTRUSTED_RETURN_URL",
        error: "Domèn returnUrl la pa otorize.",
      };
    }
  }

  // 4. courseId optionnel (vérifié côté serveur si fourni)
  let courseId: string | undefined;
  if (body.courseId !== undefined && body.courseId !== null && body.courseId !== "") {
    if (typeof body.courseId !== "string" || !COURSE_ID_REGEX.test(body.courseId.trim())) {
      return {
        ok: false,
        status: 400,
        code: "INVALID_COURSE_ID",
        error: "courseId pa valid.",
      };
    }
    courseId = body.courseId.trim();
  }

  return {
    ok: true,
    data: {
      amount,
      orderId: rawOrderId,
      returnUrl: rawReturnUrl,
      ...(courseId ? { courseId } : {}),
    },
  };
}

/**
 * Normalise une réponse d'erreur retournée par MonCashConnect.
 */
export function mapMonCashUpstreamError(
  status: number,
  upstreamBody: unknown
): { error: string; code: string } {
  if (upstreamBody && typeof upstreamBody === "object" && !Array.isArray(upstreamBody)) {
    const obj = upstreamBody as Record<string, unknown>;
    const rawCode =
      typeof obj.code === "string" && obj.code.trim()
        ? obj.code.trim()
        : `MONCASH_HTTP_${status}`;
    const rawMessage =
      typeof obj.error === "string" && obj.error.trim()
        ? obj.error.trim()
        : typeof obj.message === "string" && obj.message.trim()
        ? obj.message.trim()
        : "Erè pandan kreyasyon peman MonCash la.";

    return {
      error: rawMessage.slice(0, 300),
      code: rawCode.slice(0, 80),
    };
  }

  return {
    error: "Erè pandan kreyasyon peman MonCash la.",
    code: `MONCASH_HTTP_${status}`,
  };
}
