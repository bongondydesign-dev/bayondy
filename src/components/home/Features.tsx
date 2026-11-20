import React from "react";
import { t } from "@/lib/i18n";

export function Features() {
  const paymentMethods = t("tarifs.moyens")
    .split(",")
    .map((m) => m.trim());

  return (
    <section className="w-full py-20 sm:py-32 border-t border-white/5 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deep-navy border border-white/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora" />
            <span className="font-mono text-xs uppercase tracking-wider text-aurora">
              {t("bento.badge")}
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight">
            {t("bento.titreSection")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ice-white/70">
            {t("bento.sousTitreSection")}
          </p>
        </div>

        {/* Grille Bento : 6 cartes (2 larges, 4 petites, 1 colonne sur mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte 1 (Large - span 2) : Leçons en créole */}
          <div className="md:col-span-2 rounded-2xl sm:rounded-3xl bg-deep-navy border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-aurora/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-obsidian border border-white/10 text-aurora">
                  {t("bento.badgeCreole")}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ice-white mb-2">
                {t("fonctionnalites.creole.titre")}
              </h3>
              <p className="text-sm sm:text-base text-ice-white/75 font-sans leading-relaxed max-w-lg">
                {t("fonctionnalites.creole.description")}
              </p>
            </div>

            {/* Mini-illustration CSS/SVG : simulation de script de cours */}
            <div className="mt-8 rounded-xl bg-obsidian/70 border border-white/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-aurora" />
                <span className="font-mono text-xs text-ice-white/80">
                  {t("hero.apercu.lecon1")}
                </span>
              </div>
              <div className="h-1.5 w-4/5 bg-white/10 rounded-full" />
              <div className="h-1.5 w-3/5 bg-white/10 rounded-full" />
            </div>
          </div>

          {/* Carte 2 (Petite - span 1) : Fèt pou telefòn */}
          <div className="md:col-span-1 rounded-2xl sm:rounded-3xl bg-deep-navy border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-ion-blue/40 transition-colors">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-obsidian border border-white/10 text-ion-blue mb-4 inline-block">
                {t("bento.badgeMobile")}
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ice-white mb-2">
                {t("fonctionnalites.mobile.titre")}
              </h3>
              <p className="text-sm text-ice-white/75 font-sans leading-relaxed">
                {t("fonctionnalites.mobile.description")}
              </p>
            </div>

            {/* Mini-illustration CSS/SVG : cadre smartphone minimaliste */}
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-36 rounded-2xl border-2 border-white/20 bg-obsidian p-2 flex flex-col items-center justify-between">
                <div className="w-8 h-1 rounded-full bg-white/20" />
                <div className="w-8 h-8 rounded-full bg-ion-blue/20 flex items-center justify-center text-ion-blue">
                  <svg
                    className="w-4 h-4 translate-x-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="w-6 h-1 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* Carte 3 (Petite - span 1) : Suivi de progression */}
          <div className="md:col-span-1 rounded-2xl sm:rounded-3xl bg-deep-navy border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-aurora/40 transition-colors">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-obsidian border border-white/10 text-aurora mb-4 inline-block">
                {t("bento.badgeProgression")}
              </span>
              <h3 className="font-display font-bold text-xl text-ice-white mb-2">
                {t("fonctionnalites.progression.titre")}
              </h3>
              <p className="text-sm text-ice-white/75 font-sans leading-relaxed">
                {t("fonctionnalites.progression.description")}
              </p>
            </div>

            {/* Mini-illustration CSS : barre de progression à 3 paliers */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between font-mono text-xs text-ice-white/60">
                <span>{t("etapes.aprann.titre")}</span>
                <span className="text-aurora">{t("bento.progressionCent")}</span>
              </div>
              <div className="h-2 w-full bg-obsidian rounded-full overflow-hidden p-0.5 border border-white/5">
                <div className="h-full bg-aurora rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Carte 4 (Petite - span 1) : Revoir les leçons à tout moment */}
          <div className="md:col-span-1 rounded-2xl sm:rounded-3xl bg-deep-navy border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-ion-blue/40 transition-colors">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-obsidian border border-white/10 text-ion-blue mb-4 inline-block">
                {t("bento.badgeRevoir")}
              </span>
              <h3 className="font-display font-bold text-xl text-ice-white mb-2">
                {t("fonctionnalites.revoir.titre")}
              </h3>
              <p className="text-sm text-ice-white/75 font-sans leading-relaxed">
                {t("fonctionnalites.revoir.description")}
              </p>
            </div>

            {/* Mini-illustration SVG : replay / boucle */}
            <div className="mt-6 flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-obsidian border border-white/10 flex items-center justify-center text-ion-blue">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Carte 5 (Petite - span 1) : Accès automatique */}
          <div className="md:col-span-1 rounded-2xl sm:rounded-3xl bg-deep-navy border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-aurora/40 transition-colors">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-obsidian border border-white/10 text-aurora mb-4 inline-block">
                {t("bento.badgeAcces")}
              </span>
              <h3 className="font-display font-bold text-xl text-ice-white mb-2">
                {t("fonctionnalites.acces.titre")}
              </h3>
              <p className="text-sm text-ice-white/75 font-sans leading-relaxed">
                {t("fonctionnalites.acces.description")}
              </p>
            </div>

            {/* Mini-illustration SVG : cadenas déverrouillé / accès immédiat */}
            <div className="mt-6 flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-obsidian border border-white/10 flex items-center justify-center text-aurora">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Carte 6 (Large - span 3) : Paiement MonCash / NatCash / Carte en TEXTE */}
          <div className="md:col-span-3 rounded-2xl sm:rounded-3xl bg-deep-navy border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg hover:border-ion-blue/40 transition-colors">
            <div className="max-w-xl">
              <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-obsidian border border-white/10 text-ion-blue mb-4 inline-block">
                {t("bento.badgePaiement")}
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ice-white mb-2">
                {t("fonctionnalites.paiement.titre")}
              </h3>
              <p className="text-sm sm:text-base text-ice-white/75 font-sans leading-relaxed">
                {t("fonctionnalites.paiement.description")}
              </p>
            </div>

            {/* Logos MonCash / NatCash / Carte sous forme de BADGES TEXTUELS stricts sans logo officiel */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {paymentMethods.map((method) => (
                <div
                  key={method}
                  className="px-4 py-2.5 rounded-xl bg-obsidian border border-white/10 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-ice-white"
                >
                  <span className="w-2 h-2 rounded-full bg-aurora" />
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
