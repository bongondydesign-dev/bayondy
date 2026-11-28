import "server-only";
export { parsePositiveIntLimit } from "./pagination";

export const DEFAULT_MAX_JSON_BODY_BYTES = 32 * 1024; // 32 Ko
export const MAX_COVER_JSON_BODY_BYTES = 1_100 * 1024; // ~1.1 Mo pour base64 <= 750 Ko binaire

export async function readJsonBodyWithLimit(
  req: Request,
  maxBytes: number = DEFAULT_MAX_JSON_BODY_BYTES
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; status: number; code: string; error: string }
> {
  const contentLengthHeader = req.headers.get("content-length");
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return {
        ok: false,
        status: 413,
        code: "PAYLOAD_TOO_LARGE",
        error: "Corps de requête trop volumineux.",
      };
    }
  }

  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return {
      ok: false,
      status: 400,
      code: "INVALID_BODY",
      error: "Corps de requête illisible.",
    };
  }

  if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
    return {
      ok: false,
      status: 413,
      code: "PAYLOAD_TOO_LARGE",
      error: "Corps de requête trop volumineux.",
    };
  }

  if (!rawText.trim()) {
    return { ok: true, data: {} };
  }

  try {
    return { ok: true, data: JSON.parse(rawText) };
  } catch {
    return {
      ok: false,
      status: 400,
      code: "INVALID_JSON",
      error: "Corps JSON invalide.",
    };
  }
}

export async function readRawTextWithLimit(
  req: Request,
  maxBytes: number = 64 * 1024
): Promise<
  | { ok: true; rawText: string }
  | { ok: false; status: number; code: string; error: string }
> {
  const contentLengthHeader = req.headers.get("content-length");
  if (contentLengthHeader) {
    const declaredLength = Number(contentLengthHeader);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return {
        ok: false,
        status: 413,
        code: "PAYLOAD_TOO_LARGE",
        error: "Payload too large",
      };
    }
  }

  let rawText: string;
  try {
    rawText = await req.text();
  } catch {
    return {
      ok: false,
      status: 400,
      code: "INVALID_BODY",
      error: "Unreadable request body",
    };
  }

  if (Buffer.byteLength(rawText, "utf8") > maxBytes) {
    return {
      ok: false,
      status: 413,
      code: "PAYLOAD_TOO_LARGE",
      error: "Payload too large",
    };
  }

  return { ok: true, rawText };
}

/**
 * Garde-fou anti-abus serverless côté Firestore par utilisateur/bucket temporel.
 * Utilise une fenêtre fixe bornée pour limiter les coûts de lecture/écriture (1 lecture + 1 écriture).
 */
export async function checkFirestoreUidRateLimit(params: {
  db: FirebaseFirestore.Firestore;
  scope: string;
  uid: string;
  maxRequests: number;
  windowSeconds: number;
}): Promise<boolean> {
  const { db, scope, uid, maxRequests, windowSeconds } = params;
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const safeUid = uid.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 100);
  const docId = `${scope}_${safeUid}_${bucket}`;
  const ref = db.collection("rateLimits").doc(docId);

  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const count = snap.exists ? Number(snap.data()?.count ?? 0) : 0;
      if (count >= maxRequests) {
        return false;
      }
      tx.set(
        ref,
        {
          scope,
          uid: safeUid,
          count: count + 1,
          expiresAt: new Date(Date.now() + windowSeconds * 2000),
        },
        { merge: true }
      );
      return true;
    });
  } catch {
    // En cas d'indisponibilité transitoire du compteur, ne pas bloquer un élève légitime
    return true;
  }
}
