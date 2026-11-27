import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("merci.titre")} | BAYONDY`,
  description: t("merci.sousTitre"),
};

export default function MerciPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <div className="w-full max-w-xl rounded-3xl bg-deep-navy border border-[var(--border-subtle)] p-7 sm:p-10 shadow-[var(--card-shadow)] text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light">
              {t("merci.badge")}
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
              {t("merci.titre")}
            </h1>
            <p className="font-sans text-sm sm:text-base text-ice-white/75 leading-relaxed">
              {t("merci.sousTitre")}
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-4 text-xs sm:text-sm font-sans text-ice-white/70 leading-relaxed">
            {t("merci.noteWebhook")}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/mes-formations"
              className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center sm:whitespace-nowrap shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              {t("merci.boutonMesFormations")}
            </Link>
            <Link
              href="/formations"
              className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:border-brand/40 text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center sm:whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              {t("merci.boutonCatalogue")}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
