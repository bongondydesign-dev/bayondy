export const MAX_MONCASH_AMOUNT_HTG = 100_000;
export const MAX_MONCASH_ORDER_ID_LENGTH = 100;
export const ORDER_ID_REGEX = /^[A-Za-z0-9_-]{3,100}$/;
const COURSE_ID_REGEX = /^[A-Za-z0-9_-]{1,128}$/;

export interface ValidatedMonCashCreateInput {
  amount: number;
  orderId: string;
  returnUrl: string;
  courseId?: string;
}

export interface ValidateMonCashCreateOptions {
  requireCourseId?: boolean;
}

export type MonCashValidationResult =
  | { ok: true; data: ValidatedMonCashCreateInput }
  | { ok: false; status: number; code: string; error: string };

/**
 * Vérifie si le statut HTTP retourné par MonCashConnect /v1/pay-create
 * correspond à une création réussie (200 OK selon la doc officielle, ou 201).
 */
export function isMonCashSuccessStatus(status: number): boolean {
  return status === 200 || status === 201;
}

/**
 * Construit les en-têtes requis pour l'appel serveur POST /v1/pay-create,
 * incluant Origin (requis si des domaines autorisés sont configurés dans MCC)
 * et Idempotency-Key (recommandé pour éviter les doublons).
 */
export function buildMonCashCreateHeaders(
  secretKey: string,
  origin: string,
  idempotencyKey: string
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
    "Idempotency-Key": idempotencyKey.slice(0, 200),
  };

  if (origin && /^https?:\/\/[^/\s]+$/i.test(origin)) {
    headers.Origin = origin;
  }

  return headers;
}

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
 * Génère un identifiant de commande unique compatible MonCashConnect (<= 100 caractères).
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

  return `byd_${safePrefix || "cmd"}_${ts}_${rand}`.slice(0, MAX_MONCASH_ORDER_ID_LENGTH);
}

/**
 * Valide strictement les paramètres reçus sur POST /api/moncash/create.
 */
export function validateMonCashCreateInput(
  rawBody: unknown,
  allowedOrigins: string[] = [],
  options: ValidateMonCashCreateOptions = {}
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

  // 1. Montant entier positif en HTG (plafonné à 100 000 HTG selon MonCashConnect)
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

  // 4. courseId (obligatoire en mode strict serveur)
  let courseId: string | undefined;
  const hasCourseId =
    body.courseId !== undefined && body.courseId !== null && body.courseId !== "";
  if (!hasCourseId && options.requireCourseId) {
    return {
      ok: false,
      status: 400,
      code: "COURSE_REQUIRED",
      error: "Fòmasyon an obligatwa pou peman sa a.",
    };
  }
  if (hasCourseId) {
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
 * Normalise une réponse d'erreur retournée par MonCashConnect sans exposer
 * de détails internes ou de messages bruts du fournisseur au client.
 */
export function mapMonCashUpstreamError(
  status: number,
  upstreamBody: unknown
): { error: string; code: string } {
  let code = `MONCASH_HTTP_${status}`;
  if (upstreamBody && typeof upstreamBody === "object" && !Array.isArray(upstreamBody)) {
    const obj = upstreamBody as Record<string, unknown>;
    if (typeof obj.code === "string" && obj.code.trim()) {
      code = obj.code.trim().replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80);
    }
  }

  return {
    error: "Erè pandan kreyasyon peman MonCash la.",
    code,
  };
}
