import { getSiteUrl, SITE_NAME } from "@/lib/site";

const ALLOWED_OG_COVER_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "res.cloudinary.com",
  "images.unsplash.com",
  "images.pexels.com",
]);

function getConfiguredHost(): string | null {
  try {
    const parsed = new URL(getSiteUrl());
    return parsed.protocol === "https:" ? parsed.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Vérifie strictement si coverUrl provient d'un domaine externe autorisé et sûr.
 * Exclut tout domaine vidéo (YouTube, TikTok) et toute URL non HTTPS.
 */
export function isAllowedOgCoverUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2000) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host.includes("youtube") ||
      host.includes("ytimg") ||
      host.includes("youtu.be") ||
      host.includes("tiktok")
    ) {
      return false;
    }
    const configuredHost = getConfiguredHost();
    if (configuredHost && host === configuredHost) {
      return true;
    }
    return ALLOWED_OG_COVER_HOSTS.has(host);
  } catch {
    return false;
  }
}

/**
 * Coupe proprement le titre sur au plus 2 lignes pour l'image Open Graph.
 */
export function truncateOgTitle(title: string, maxChars = 72): string {
  const normalized = title.replace(/\s+/g, " ").trim();
  if (!normalized) return SITE_NAME;
  if (normalized.length <= maxChars) return normalized;

  const sliced = normalized.slice(0, maxChars - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > Math.floor(maxChars * 0.5) ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.trimEnd()}…`;
}
