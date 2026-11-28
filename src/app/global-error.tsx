"use client";

import React from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="ht">
      <body className="min-h-screen bg-[#090B10] text-[#F4F6FA] flex items-center justify-center px-4 font-sans antialiased">
        <title>{t("erreurPage.titre")}</title>
        <main className="max-w-md w-full text-center space-y-5 p-8 rounded-2xl border border-white/10 bg-[#10131C]">
          <p className="text-xs uppercase tracking-widest text-[#FF7A48] font-mono">
            {t("erreurPage.badge")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("erreurPage.titre")}
          </h1>
          <p className="text-sm text-white/75 leading-relaxed">
            {t("erreurPage.description")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => retry()}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full bg-[#F04E18] hover:bg-[#FF652E] text-white font-semibold text-sm cursor-pointer transition-colors"
            >
              {t("erreurPage.reessayer")}
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-white font-medium text-sm inline-flex items-center justify-center transition-colors"
            >
              {t("erreurPage.retourAccueil")}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
