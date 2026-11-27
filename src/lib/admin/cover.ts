export const ALLOWED_COVER_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type CoverMimeType = (typeof ALLOWED_COVER_MIME_TYPES)[number];

/** Taille maximale stockée côté Firestore après optimisation client (750 Ko). */
export const MAX_COVER_UPLOAD_BYTES = 750 * 1024;

/** Taille maximale du fichier brut accepté dans le sélecteur (10 Mo). */
export const MAX_RAW_COVER_FILE_BYTES = 10 * 1024 * 1024;

const EXTERNAL_URL_RE = /^https?:\/\/[^\s]{1,2000}$/;
const INTERNAL_COVER_PATH_RE = /^\/api\/covers\/([A-Za-z0-9_-]{6,128})$/;
const COVER_ID_RE = /^[A-Za-z0-9_-]{6,128}$/;
const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

export function isValidCoverId(id: unknown): id is string {
  return typeof id === "string" && COVER_ID_RE.test(id.trim());
}

/**
 * Valide une URL de couverture :
 * - URL http(s) externe valide (<= 2000 chars)
 * - OU chemin interne `/api/covers/<id>`
 */
export function isValidCoverUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 2000) return false;
  return EXTERNAL_URL_RE.test(trimmed) || INTERNAL_COVER_PATH_RE.test(trimmed);
}

/**
 * Vérifie les métadonnées d'un fichier avant traitement client.
 */
export function validateCoverFileMeta(meta: {
  type: string;
  size: number;
}): { ok: true } | { ok: false; code: "invalid_type" | "too_large" } {
  const mime = meta.type.toLowerCase().trim();
  const isAllowed = (ALLOWED_COVER_MIME_TYPES as readonly string[]).includes(mime);
  if (!isAllowed) {
    return { ok: false, code: "invalid_type" };
  }
  if (!Number.isFinite(meta.size) || meta.size <= 0 || meta.size > MAX_RAW_COVER_FILE_BYTES) {
    return { ok: false, code: "too_large" };
  }
  return { ok: true };
}

/**
 * Vérifie les magic bytes réels d'une image JPEG, PNG ou WebP.
 */
export function matchesImageMagicBytes(
  buffer: Uint8Array,
  mimeType: CoverMimeType
): boolean {
  if (mimeType === "image/jpeg") {
    return (
      buffer.byteLength >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }
  if (mimeType === "image/png") {
    return (
      buffer.byteLength >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  if (mimeType === "image/webp") {
    return (
      buffer.byteLength >= 12 &&
      buffer[0] === 0x52 && // R
      buffer[1] === 0x49 && // I
      buffer[2] === 0x46 && // F
      buffer[3] === 0x46 && // F
      buffer[8] === 0x57 && // W
      buffer[9] === 0x45 && // E
      buffer[10] === 0x42 && // B
      buffer[11] === 0x50 // P
    );
  }
  return false;
}

/**
 * Décode et valide un data URL base64 côté serveur (MIME, taille, magic bytes).
 */
export function parseCoverDataUrl(
  dataUrl: unknown
):
  | { ok: true; mimeType: CoverMimeType; buffer: Buffer }
  | { ok: false; error: string } {
  if (typeof dataUrl !== "string") {
    return { ok: false, error: "Image requise." };
  }

  const trimmed = dataUrl.trim();
  const match = DATA_URL_RE.exec(trimmed);
  if (!match) {
    return {
      ok: false,
      error: "Format d'image invalide. Utilisez JPG, PNG ou WebP.",
    };
  }

  const mimeType = match[1] as CoverMimeType;
  const base64Body = match[2];

  // Estimation rapide avant décodage complet
  const approxBytes = Math.floor((base64Body.length * 3) / 4);
  if (approxBytes > MAX_COVER_UPLOAD_BYTES + 1024) {
    return {
      ok: false,
      error: "Image trop volumineuse après compression (max 750 Ko).",
    };
  }

  const buffer = Buffer.from(base64Body, "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_COVER_UPLOAD_BYTES) {
    return {
      ok: false,
      error: "Image vide ou trop volumineuse (max 750 Ko).",
    };
  }

  if (!matchesImageMagicBytes(buffer, mimeType)) {
    return {
      ok: false,
      error: "Le contenu du fichier ne correspond pas à une image valide.",
    };
  }

  return { ok: true, mimeType, buffer };
}
