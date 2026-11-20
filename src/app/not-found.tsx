import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white selection:bg-ion-blue/30 selection:text-aurora overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 py-16 text-center">
        {/* Symbole cinématique */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-deep-navy border border-white/10 flex items-center justify-center shadow-2xl shadow-ion-blue/20">
            <PortalSymbol size={48} className="opacity-75" />
          </div>
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-ion-blue text-white font-mono text-[11px] font-semibold tracking-wider">
            404
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-white/10 text-aurora font-mono text-xs uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora animate-pulse" />
          {t("erreur404.badge")}
        </div>

        {/* Titre unique H1 */}
        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4 max-w-xl">
          {t("erreur404.titre")}
        </h1>

        {/* Description */}
        <p className="font-sans text-base sm:text-lg text-ice-white/70 max-w-md mx-auto mb-8 leading-relaxed">
          {t("erreur404.description")}
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/formations"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-ion-blue hover:bg-ion-blue/90 text-white font-sans font-medium text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-ion-blue/25 transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span>{t("erreur404.voirFormations")}</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-deep-navy hover:bg-white/5 border border-white/10 text-ice-white font-sans font-medium text-sm sm:text-base inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
          >
            <span>{t("erreur404.retourAccueil")}</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
