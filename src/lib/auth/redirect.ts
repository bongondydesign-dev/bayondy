const DEFAULT_REDIRECT = "/profil";

/**
 * Valide le paramètre `redirect` pour empêcher toute redirection ouverte.
 * Accepte uniquement un chemin relatif interne commençant par un seul "/".
 */
export function getSafeRedirectPath(raw: string | null | undefined): string {
  if (typeof raw !== "string") {
    return DEFAULT_REDIRECT;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return DEFAULT_REDIRECT;
  }

  // Doit commencer par un seul "/" (refuse "//", "///", etc.)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }

  // Refuse tout backslash et caractère de contrôle
  if (trimmed.includes("\\") || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    return DEFAULT_REDIRECT;
  }

  // Refuse explicitement http:, https: et tout schéma dans le chemin
  const lower = trimmed.toLowerCase();
  if (lower.includes("http:") || lower.includes("https:")) {
    return DEFAULT_REDIRECT;
  }

  const pathOnly = trimmed.split(/[?#]/)[0];
  if (pathOnly.includes(":")) {
    return DEFAULT_REDIRECT;
  }

  try {
    const parsed = new URL(trimmed, "https://bayondy.local");
    if (parsed.origin !== "https://bayondy.local") {
      return DEFAULT_REDIRECT;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_REDIRECT;
  }
}
