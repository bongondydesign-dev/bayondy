import {
  AppLang,
  DEFAULT_APP_LANG,
  LANG_COOKIE_MAX_AGE,
  LANG_COOKIE_NAME,
} from "./config";

const UNPREFIXED_PREFIXES = ["/admin", "/api"];

const BOT_UA_PATTERN =
  /bot\b|crawler|spider|slurp|googlebot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|twitterbot|linkedinbot|applebot|semrushbot|ahrefsbot|gptbot|claudebot|perplexitybot|oai-searchbot/i;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BOT_UA_PATTERN.test(userAgent);
}

export function shouldBypassLocalePrefix(pathname: string): boolean {
  return UNPREFIXED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function extractAppLangFromPathname(
  pathname: string | null | undefined
): AppLang {
  if (!pathname) return DEFAULT_APP_LANG;
  if (pathname === "/ht" || pathname.startsWith("/ht/")) {
    return "kr";
  }
  return "fr";
}

export function stripLocalePrefix(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (normalized === "/ht" || normalized === "/fr") {
    return "/";
  }
  if (normalized.startsWith("/ht/") || normalized.startsWith("/fr/")) {
    const rest = normalized.slice(3);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return normalized || "/";
}

function isSafeInternalPathInput(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;
  if (/[\u0000-\u001F\u007F\\]/.test(raw)) return false;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return false;
  return true;
}

function splitPathQueryHash(input: string): {
  pathname: string;
  search: string;
  hash: string;
} {
  const hashIndex = input.indexOf("#");
  const withoutHash = hashIndex >= 0 ? input.slice(0, hashIndex) : input;
  const hash = hashIndex >= 0 ? input.slice(hashIndex) : "";

  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";

  return {
    pathname: pathname.replace(/\/{2,}/g, "/") || "/",
    search,
    hash,
  };
}

export function localizePath(path: string, lang: AppLang): string {
  const fallback = lang === "kr" ? "/ht" : "/";
  if (!isSafeInternalPathInput(path)) {
    return fallback;
  }

  const { pathname, search, hash } = splitPathQueryHash(path.trim());
  const basePath = stripLocalePrefix(pathname);

  if (shouldBypassLocalePrefix(basePath)) {
    return `${basePath}${search}${hash}`;
  }

  const localizedBase =
    lang === "kr" ? (basePath === "/" ? "/ht" : `/ht${basePath}`) : basePath;

  return `${localizedBase}${search}${hash}`;
}

export function buildSwitchLanguageUrl(
  currentPathWithQueryAndHash: string,
  targetLang: AppLang
): string {
  return localizePath(currentPathWithQueryAndHash, targetLang);
}

export function getRedirectLocaleForIncomingRequest(options: {
  pathname: string;
  cookieLang?: string | null;
  userAgent?: string | null;
  method?: string;
}): { action: "next" | "redirect" | "rewrite"; destinationPathname?: string } {
  const { pathname, cookieLang, userAgent, method = "GET" } = options;

  if (shouldBypassLocalePrefix(pathname)) {
    return { action: "next" };
  }

  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    const clean = pathname === "/fr" ? "/" : pathname.slice(3) || "/";
    return { action: "redirect", destinationPathname: clean };
  }

  if (pathname === "/ht" || pathname.startsWith("/ht/")) {
    return { action: "next" };
  }

  if (
    (method === "GET" || method === "HEAD") &&
    cookieLang === "kr" &&
    !isBotUserAgent(userAgent)
  ) {
    return {
      action: "redirect",
      destinationPathname: pathname === "/" ? "/ht" : `/ht${pathname}`,
    };
  }

  return {
    action: "rewrite",
    destinationPathname: pathname === "/" ? "/fr" : `/fr${pathname}`,
  };
}

export function buildLanguageCookieString(
  lang: AppLang,
  isSecure: boolean
): string {
  const parts = [
    `${LANG_COOKIE_NAME}=${lang}`,
    "Path=/",
    `Max-Age=${LANG_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ];
  if (isSecure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}
