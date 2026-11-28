"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { AppLang, DEFAULT_APP_LANG, appLangToHtmlLang } from "@/lib/i18n/config";
import { readLangCookieFromDocument } from "@/lib/i18n/I18nProvider";
import { extractAppLangFromPathname, localizePath } from "@/lib/i18n/routing";

const subscribeNoop = () => () => {};

function getGlobalErrorClientLang(): AppLang {
  if (typeof window === "undefined") return DEFAULT_APP_LANG;
  const fromPath = extractAppLangFromPathname(window.location.pathname);
  return fromPath === "kr" ? "kr" : readLangCookieFromDocument();
}

export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const lang = useSyncExternalStore(
    subscribeNoop,
    getGlobalErrorClientLang,
    () => DEFAULT_APP_LANG
  );

  useEffect(() => {
    document.documentElement.lang = appLangToHtmlLang(lang);
  }, [lang]);

  return (
    <html lang={appLangToHtmlLang(lang)}>
      <body className="min-h-screen bg-[#090B10] text-[#F4F6FA] flex items-center justify-center px-4 font-sans antialiased">
        <title>{t("erreurPage.titre", lang)}</title>
        <main className="max-w-md w-full text-center space-y-5 p-8 rounded-2xl border border-white/10 bg-[#10131C]">
          <p className="text-xs uppercase tracking-widest text-[#FF7A48] font-mono">
            {t("erreurPage.badge", lang)}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("erreurPage.titre", lang)}
          </h1>
          <p className="text-sm text-white/75 leading-relaxed">
            {t("erreurPage.description", lang)}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => retry()}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-[#F04E18] hover:bg-[#FF652E] text-white font-semibold text-sm cursor-pointer transition-colors"
            >
              {t("erreurPage.reessayer", lang)}
            </button>
            <Link
              href={localizePath("/", lang)}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-white font-medium text-sm inline-flex items-center justify-center transition-colors"
            >
              {t("erreurPage.retourAccueil", lang)}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
