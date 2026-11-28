"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { t as translateKey } from "./index";
import {
  AppLang,
  DEFAULT_APP_LANG,
  LANG_COOKIE_NAME,
  appLangToHtmlLang,
  resolveAppLang,
} from "./config";
import { buildLanguageCookieString, localizePath } from "./routing";

interface I18nContextValue {
  lang: AppLang;
  htmlLang: "fr" | "ht";
  setLangCookie: (nextLang: AppLang) => void;
  setActiveLang: (nextLang: AppLang) => void;
  t: (key: string) => string;
  localize: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: DEFAULT_APP_LANG,
  htmlLang: "fr",
  setLangCookie: () => {},
  setActiveLang: () => {},
  t: (key: string) => translateKey(key, DEFAULT_APP_LANG),
  localize: (path: string) => localizePath(path, DEFAULT_APP_LANG),
});

const langCookieListeners = new Set<() => void>();

function subscribeLangCookie(listener: () => void): () => void {
  langCookieListeners.add(listener);
  return () => {
    langCookieListeners.delete(listener);
  };
}

function notifyLangCookieListeners(): void {
  for (const listener of langCookieListeners) {
    listener();
  }
}

export function readLangCookieFromDocument(): AppLang {
  if (typeof document === "undefined") return DEFAULT_APP_LANG;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LANG_COOKIE_NAME}=`));
  if (!match) return DEFAULT_APP_LANG;
  const raw = match.slice(LANG_COOKIE_NAME.length + 1);
  return resolveAppLang(decodeURIComponent(raw));
}

export function writeLangCookieToDocument(nextLang: AppLang): void {
  if (typeof document === "undefined") return;
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = buildLanguageCookieString(nextLang, isSecure);
  notifyLangCookieListeners();
}

export function I18nProvider({
  lang: initialLang,
  syncFromCookie = false,
  children,
}: {
  lang: AppLang;
  syncFromCookie?: boolean;
  children: React.ReactNode;
}) {
  const cookieLang = useSyncExternalStore(
    subscribeLangCookie,
    readLangCookieFromDocument,
    () => initialLang
  );

  const activeLang = syncFromCookie ? cookieLang : initialLang;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = appLangToHtmlLang(activeLang);
    }
  }, [activeLang]);

  const setLangCookie = useCallback((nextLang: AppLang) => {
    writeLangCookieToDocument(nextLang);
  }, []);

  const setActiveLang = useCallback((nextLang: AppLang) => {
    writeLangCookieToDocument(nextLang);
  }, []);

  const translate = useCallback(
    (key: string) => translateKey(key, activeLang),
    [activeLang]
  );

  const localize = useCallback(
    (path: string) => localizePath(path, activeLang),
    [activeLang]
  );

  return (
    <I18nContext.Provider
      value={{
        lang: activeLang,
        htmlLang: appLangToHtmlLang(activeLang),
        setLangCookie,
        setActiveLang,
        t: translate,
        localize,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
