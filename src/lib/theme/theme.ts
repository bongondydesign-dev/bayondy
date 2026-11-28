export type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";

export const THEME_STORAGE_KEY = "bayondy-theme";
export const DEFAULT_THEME: ThemeMode = "dark";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export function normalizeTheme(value: unknown): ThemeMode | null {
  if (value === "light" || value === "dark") {
    return value;
  }
  return null;
}

export function normalizeThemePreference(value: unknown): ThemePreference | null {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return null;
}

export function resolveThemePreference(
  storedValue: unknown,
  fallback: ThemePreference = DEFAULT_THEME_PREFERENCE
): ThemePreference {
  return normalizeThemePreference(storedValue) ?? fallback;
}

export function detectSystemThemeFromFlags(
  matchesDark: boolean,
  matchesLight: boolean,
  fallback: ThemeMode = DEFAULT_THEME
): ThemeMode {
  if (matchesLight && !matchesDark) return "light";
  if (matchesDark && !matchesLight) return "dark";
  if (matchesLight) return "light";
  if (matchesDark) return "dark";
  return fallback;
}

export function getBrowserSystemTheme(fallback: ThemeMode = DEFAULT_THEME): ThemeMode {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return fallback;
  }
  try {
    const matchesDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const matchesLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    return detectSystemThemeFromFlags(matchesDark, matchesLight, fallback);
  } catch {
    return fallback;
  }
}

export function resolveTheme(
  storedValue: unknown,
  fallback: ThemeMode = DEFAULT_THEME
): ThemeMode {
  return normalizeTheme(storedValue) ?? fallback;
}

export function getNextTheme(current: ThemeMode): ThemeMode {
  return current === "dark" ? "light" : "dark";
}

export const THEME_INIT_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var v=localStorage.getItem(k);var t;if(v==='light'||v==='dark'){t=v;}else{var mm=window.matchMedia;var l=mm&&mm('(prefers-color-scheme: light)').matches;var d=mm&&mm('(prefers-color-scheme: dark)').matches;t=(l&&!d)?'light':(d&&!l)?'dark':l?'light':d?'dark':'${DEFAULT_THEME}';}var r=document.documentElement;if(t==='light'){r.classList.remove('dark');r.classList.add('light');r.style.colorScheme='light';}else{r.classList.remove('light');r.classList.add('dark');r.style.colorScheme='dark';}}catch(e){}})();`;
