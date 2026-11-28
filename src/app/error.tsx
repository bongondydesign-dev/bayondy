"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { t } from "@/lib/i18n";

export default function RootError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-4 sm:px-6 py-16 text-center text-ice-white">
      <div className="w-20 h-20 rounded-2xl surface-glass border border-[var(--border-subtle)] flex items-center justify-center mb-6">
        <PortalSymbol size={40} className="opacity-85" />
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light mb-3">
        {t("erreurPage.badge")}
      </p>

      <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-ice-white mb-4">
        {t("erreurPage.titre")}
      </h1>

      <p className="font-sans text-base text-slate-700 dark:text-ice-white/70 max-w-md mx-auto mb-8 leading-relaxed">
        {t("erreurPage.description")}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => retry()}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t("erreurPage.reessayer")}</span>
        </button>

        <Link
          href="/"
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-[var(--surface-elevated)] hover:border-brand/50 border border-[var(--border-strong)] text-ice-white font-sans font-medium text-sm sm:text-base inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          <span>{t("erreurPage.retourAccueil")}</span>
        </Link>
      </div>
    </main>
  );
}
