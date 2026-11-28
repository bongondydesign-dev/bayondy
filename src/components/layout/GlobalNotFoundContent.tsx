"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { t } from "@/lib/i18n";
import { AppLang, DEFAULT_APP_LANG, appLangToHtmlLang } from "@/lib/i18n/config";
import { readLangCookieFromDocument } from "@/lib/i18n/I18nProvider";
import {
  extractAppLangFromPathname,
  localizePath,
  shouldBypassLocalePrefix,
} from "@/lib/i18n/routing";

const subscribeNoop = () => () => {};

function getGlobalNotFoundClientLang(): AppLang {
  if (typeof window === "undefined") return DEFAULT_APP_LANG;
  const pathname = window.location.pathname;
  const fromPath = extractAppLangFromPathname(pathname);
  if (fromPath === "kr") return "kr";
  if (shouldBypassLocalePrefix(pathname)) {
    return readLangCookieFromDocument();
  }
  return DEFAULT_APP_LANG;
}

export function GlobalNotFoundContent() {
  const lang = useSyncExternalStore(
    subscribeNoop,
    getGlobalNotFoundClientLang,
    () => DEFAULT_APP_LANG
  );

  useEffect(() => {
    document.documentElement.lang = appLangToHtmlLang(lang);
    document.title = t("erreur404.titre", lang);
  }, [lang]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl surface-glass border border-[var(--border-subtle)] flex items-center justify-center">
          <PortalSymbol size={48} className="opacity-85" />
        </div>
        <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-brand text-[var(--brand-fg)] font-mono text-[11px] font-bold tracking-wider">
          404
        </div>
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light mb-4">
        {t("erreur404.badge", lang)}
      </p>

      <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ice-white mb-4 max-w-xl">
        {t("erreur404.titre", lang)}
      </h1>

      <p className="font-sans text-base sm:text-lg text-slate-700 dark:text-ice-white/70 max-w-md mx-auto mb-8 leading-relaxed">
        {t("erreur404.description", lang)}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Link
          href={localizePath("/formations", lang)}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t("erreur404.voirFormations", lang)}</span>
        </Link>

        <Link
          href={localizePath("/", lang)}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-[var(--surface-elevated)] hover:border-brand/50 border border-[var(--border-strong)] text-ice-white font-sans font-medium text-sm sm:text-base inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          <span>{t("erreur404.retourAccueil", lang)}</span>
        </Link>
      </div>
    </main>
  );
}
