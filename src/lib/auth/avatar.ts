import { matchesImageMagicBytes, type CoverMimeType } from "@/lib/admin/cover";

export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AvatarMimeType = CoverMimeType;

/** Taille maximale stockée côté Firestore après recadrage & compression client (350 Ko). */
export const MAX_AVATAR_UPLOAD_BYTES = 350 * 1024;

/** Taille maximale du fichier brut accepté dans le sélecteur (10 Mo). */
export const MAX_RAW_AVATAR_FILE_BYTES = 10 * 1024 * 1024;

/** Plafond JSON reçu par /api/profile/avatar (~550 Ko pour 350 Ko base64). */
export const MAX_AVATAR_JSON_BODY_BYTES = 550 * 1024;

const AVATAR_ID_RE = /^[A-Za-z0-9_-]{6,128}$/;
const INTERNAL_AVATAR_PATH_RE = /^\/api\/avatars\/([A-Za-z0-9_-]{6,128})$/;
const EXTERNAL_HTTPS_AVATAR_RE =
  /^(?:https:\/\/|http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?)[^\s]{1,1000}$/i;
const AVATAR_DATA_URL_RE =
  /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

export const TRUSTED_EXTERNAL_AVATAR_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "res.cloudinary.com",
  "images.unsplash.com",
  "images.pexels.com",
  "picsum.photos",
]);

export function isValidAvatarId(id: unknown): id is string {
  return typeof id === "string" && AVATAR_ID_RE.test(id.trim());
}

export function isInternalAvatarPath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return INTERNAL_AVATAR_PATH_RE.test(value.trim());
}

/**
 * Vérifie si une URL/chemin d'avatar peut être stocké(e) ou affiché(e) en toute sécurité
 * (chemin interne `/api/avatars/<id>` ou URL `https://` valide <= 1000 chars).
 */
export function isSafeAvatarUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 1000) return false;
  return isInternalAvatarPath(trimmed) || EXTERNAL_HTTPS_AVATAR_RE.test(trimmed);
}

/**
 * Vérifie si un avatar peut être rendu directement par next/image sans erreur de domaine :
 * - Chemin interne `/api/avatars/<id>`
 * - URL HTTPS issue d'un hôte de confiance enregistré dans next.config.ts
 */
export function isRenderableAvatarSrc(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 1000) return false;
  if (isInternalAvatarPath(trimmed)) return true;

  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === "https:" &&
      TRUSTED_EXTERNAL_AVATAR_HOSTS.has(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function validateAvatarFileMeta(meta: {
  type: string;
  size: number;
}): { ok: true } | { ok: false; code: "invalid_type" | "too_large" } {
  const mime = meta.type.toLowerCase().trim();
  const isAllowed = (ALLOWED_AVATAR_MIME_TYPES as readonly string[]).includes(
    mime
  );
  if (!isAllowed) {
    return { ok: false, code: "invalid_type" };
  }
  if (
    !Number.isFinite(meta.size) ||
    meta.size <= 0 ||
    meta.size > MAX_RAW_AVATAR_FILE_BYTES
  ) {
    return { ok: false, code: "too_large" };
  }
  return { ok: true };
}

export function parseAvatarDataUrl(
  dataUrl: unknown
):
  | { ok: true; mimeType: AvatarMimeType; buffer: Buffer }
  | { ok: false; error: string } {
  if (typeof dataUrl !== "string") {
    return { ok: false, error: "Image requise." };
  }

  const trimmed = dataUrl.trim();
  const match = AVATAR_DATA_URL_RE.exec(trimmed);
  if (!match) {
    return {
      ok: false,
      error: "Format d'image invalide. Utilisez JPG, PNG ou WebP.",
    };
  }

  const mimeType = match[1] as AvatarMimeType;
  const base64Body = match[2];

  const approxBytes = Math.floor((base64Body.length * 3) / 4);
  if (approxBytes > MAX_AVATAR_UPLOAD_BYTES + 1024) {
    return {
      ok: false,
      error: "Image trop volumineuse (max 350 Ko après optimisation).",
    };
  }

  const buffer = Buffer.from(base64Body, "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_AVATAR_UPLOAD_BYTES) {
    return {
      ok: false,
      error: "Image vide ou trop volumineuse (max 350 Ko).",
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
