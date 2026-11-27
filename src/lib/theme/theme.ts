export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "bayondy-theme";
export const DEFAULT_THEME: ThemeMode = "dark";

export function normalizeTheme(value: unknown): ThemeMode | null {
  if (value === "light" || value === "dark") {
    return value;
  }
  return null;
}

export function resolveTheme(storedValue: unknown, fallback: ThemeMode = DEFAULT_THEME): ThemeMode {
  return normalizeTheme(storedValue) ?? fallback;
}

export function getNextTheme(current: ThemeMode): ThemeMode {
  return current === "dark" ? "light" : "dark";
}

export const THEME_INIT_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var v=localStorage.getItem(k);var t=(v==='light'||v==='dark')?v:'${DEFAULT_THEME}';var d=document.documentElement;if(t==='light'){d.classList.remove('dark');d.classList.add('light');d.style.colorScheme='light';}else{d.classList.remove('light');d.classList.add('dark');d.style.colorScheme='dark';}}catch(e){}})();`;
