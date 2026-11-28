"use client";

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  getBrowserSystemTheme,
  getNextTheme,
  resolveTheme,
  resolveThemePreference,
  type ThemeMode,
  type ThemePreference,
} from "./theme";

interface ThemeContextValue {
  theme: ThemeMode;
  preference: ThemePreference;
  setTheme: (next: ThemeMode) => void;
  setPreference: (next: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  preference: DEFAULT_THEME_PREFERENCE,
  setTheme: () => {},
  setPreference: () => {},
  toggleTheme: () => {},
});

const listeners = new Set<() => void>();

function notifyThemeListeners() {
  listeners.forEach((listener) => listener());
}

function applyThemeToDocument(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  }
}

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return DEFAULT_THEME_PREFERENCE;
  try {
    return resolveThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

function readDocumentTheme(): ThemeMode {
  if (typeof document === "undefined") return DEFAULT_THEME;
  if (document.documentElement.classList.contains("light")) return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  const pref = readStoredPreference();
  return resolveTheme(pref, getBrowserSystemTheme());
}

function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const syncSystemIfAuto = () => {
    const pref = readStoredPreference();
    if (pref === "system") {
      applyThemeToDocument(getBrowserSystemTheme());
      notifyThemeListeners();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    const pref = resolveThemePreference(event.newValue);
    const resolved = resolveTheme(pref, getBrowserSystemTheme());
    applyThemeToDocument(resolved);
    notifyThemeListeners();
  };

  window.addEventListener("storage", handleStorage);

  const darkMedia =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  const lightMedia =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: light)")
      : null;

  const attachMedia = (mq: MediaQueryList | null) => {
    if (!mq) return () => {};
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", syncSystemIfAuto);
      return () => mq.removeEventListener("change", syncSystemIfAuto);
    }
    if (typeof mq.addListener === "function") {
      mq.addListener(syncSystemIfAuto);
      return () => mq.removeListener(syncSystemIfAuto);
    }
    return () => {};
  };

  const detachDark = attachMedia(darkMedia);
  const detachLight = attachMedia(lightMedia);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
    detachDark();
    detachLight();
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<ThemeMode>(
    subscribeTheme,
    readDocumentTheme,
    () => DEFAULT_THEME
  );
  const preference = useSyncExternalStore<ThemePreference>(
    subscribeTheme,
    readStoredPreference,
    () => DEFAULT_THEME_PREFERENCE
  );

  useEffect(() => {
    const pref = readStoredPreference();
    const resolved = resolveTheme(pref, getBrowserSystemTheme());
    applyThemeToDocument(resolved);
    notifyThemeListeners();
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    const resolved = resolveTheme(next, getBrowserSystemTheme());
    applyThemeToDocument(resolved);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignorer si le stockage local est bloqué
    }
    notifyThemeListeners();
  }, []);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setPreference(next);
    },
    [setPreference]
  );

  const toggleTheme = useCallback(() => {
    const next = getNextTheme(readDocumentTheme());
    setPreference(next);
  }, [setPreference]);

  return (
    <ThemeContext.Provider
      value={{ theme, preference, setTheme, setPreference, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
