const DEFAULT_REDIRECT = "/mes-formations";

/**
 * Valide le paramètre `redirect` pour empêcher toute redirection ouverte.
 * Accepte uniquement un chemin relatif interne commençant par un seul "/".
 */
export function getSafeRedirectPath(
  raw: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT
): string {
  if (typeof raw !== "string") {
    return fallback;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return fallback;
  }

  // Doit commencer par un seul "/" (refuse "//", "///", etc.)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  // Refuse tout backslash et caractère de contrôle
  if (trimmed.includes("\\") || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    return fallback;
  }

  // Refuse explicitement http:, https: et tout schéma dans le chemin
  const lower = trimmed.toLowerCase();
  if (lower.includes("http:") || lower.includes("https:")) {
    return fallback;
  }

  const pathOnly = trimmed.split(/[?#]/)[0];
  if (pathOnly.includes(":")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "https://bayondy.local");
    if (parsed.origin !== "https://bayondy.local") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
