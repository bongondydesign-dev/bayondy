export type AppLang = "fr" | "kr";
export type RouteLangSegment = "fr" | "ht";
export type DictionaryLang = AppLang | "en";

export const DEFAULT_APP_LANG: AppLang = "fr";
export const SUPPORTED_APP_LANGS: readonly AppLang[] = ["fr", "kr"] as const;
export const SUPPORTED_ROUTE_SEGMENTS: readonly RouteLangSegment[] = ["fr", "ht"] as const;

export const LANG_COOKIE_NAME = "bayondy_lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an

export function isAppLang(value: unknown): value is AppLang {
  return value === "fr" || value === "kr";
}

export function resolveAppLang(value: unknown): AppLang {
  if (value === "kr" || value === "ht") return "kr";
  return DEFAULT_APP_LANG;
}

export function routeLangToAppLang(segment: string): AppLang | null {
  if (segment === "fr") return "fr";
  if (segment === "ht") return "kr";
  return null;
}

export function appLangToRouteLang(lang: AppLang): RouteLangSegment {
  return lang === "kr" ? "ht" : "fr";
}

export function appLangToHtmlLang(lang: AppLang): "fr" | "ht" {
  return lang === "kr" ? "ht" : "fr";
}

export function appLangToOgLocale(lang: AppLang): "fr_FR" | "ht_HT" {
  return lang === "kr" ? "ht_HT" : "fr_FR";
}
