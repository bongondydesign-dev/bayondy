import React from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";

export function Features() {
  const paymentMethods = t("tarifs.moyens")
    .split(",")
    .map((m) => m.trim());

  const capabilityRows = [
    t("bento.badgeCreole"),
    t("bento.badgeMobile"),
    t("bento.badgeProgression"),
    t("bento.badgeRevoir"),
    t("bento.badgePaiement"),
  ];

  // Délais pour créer une vague diagonale sur la grille 3×3
  const matrixDelays = [
    "0ms",
    "240ms",
    "480ms",
    "240ms",
    "0ms",
    "720ms",
    "480ms",
    "720ms",
    "960ms",
  ];

  return (
    <section className="w-full py-24 sm:py-32 border-t border-[var(--border-faint)] bg-obsidian relative transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          {/* En-tête asymétrique */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 sm:mb-16">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
                {t("bento.badge")}
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight leading-[1.08] text-balance">
                {t("bento.titreSection")}
              </h2>
            </div>

            <div className="max-w-md space-y-3">
              <p className="text-sm sm:text-base text-ice-white/70 font-sans leading-relaxed text-balance">
                {t("bento.sousTitreSection")}
              </p>
              <Link
                href="/formations"
                className="group inline-flex items-center gap-2 text-sm font-medium text-ice-white hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md"
              >
                <span>{t("hero.cta")}</span>
                <span
                  className="w-5 h-5 rounded-full bg-slate-900/[0.07] dark:bg-white/[0.08] inline-flex items-center justify-center text-xs group-hover:translate-x-0.5 group-hover:bg-[var(--home-orange)]/20 group-hover:text-[var(--home-orange-light)] transition-all"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Grille Bento asymétrique */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Carte 1 (Large - col-span-2) : Leçons en créole avec courbe SVG animée */}
            <div className="group md:col-span-2 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 shadow-[var(--card-shadow)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-w-0">
              <div
                className="absolute inset-x-0 top-0 h-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(ellipse 65% 70% at 50% 0%, var(--home-orange-glow-soft) 0%, transparent 72%)",
                }}
                aria-hidden="true"
              />

              <div className="rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)] p-4 sm:p-5 mb-6 relative overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ice-white/60 block">
                      {t("fonctionnalites.creole.titre")}
                    </span>
                    <span className="font-display font-bold text-2xl sm:text-3xl text-ice-white tabular-nums">
                      {t("bento.badgeCreole")}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[var(--home-orange-light)] px-2.5 py-1 rounded-md bg-[var(--home-orange)]/10 border border-[var(--home-orange)]/30 whitespace-nowrap shrink-0">
                    {t("catalogue.langues.ht")}
                  </span>
                </div>

                {/* Courbe SVG de progression ascendante avec grille subtile et tracé animé */}
                <svg
                  viewBox="0 0 480 116"
                  className="w-full h-28 overflow-hidden"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="bento-curve-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--home-orange)" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="var(--home-orange)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="bento-curve-stroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--home-orange-dark)" />
                      <stop offset="55%" stopColor="var(--home-orange)" />
                      <stop offset="100%" stopColor="var(--home-orange-light)" />
                    </linearGradient>
                  </defs>

                  {/* Repères horizontaux légers */}
                  <line x1="0" y1="24" x2="480" y2="24" stroke="var(--surface-grid-line)" strokeDasharray="3 5" />
                  <line x1="0" y1="58" x2="480" y2="58" stroke="var(--surface-grid-line)" strokeDasharray="3 5" />
                  <line x1="0" y1="92" x2="480" y2="92" stroke="var(--surface-grid-line)" strokeDasharray="3 5" />

                  <path
                    d="M0 98 C 90 94, 160 74, 240 62 C 320 50, 390 28, 468 16 L 468 114 L 0 114 Z"
                    fill="url(#bento-curve-fill)"
                  />
                  <path
                    d="M0 98 C 90 94, 160 74, 240 62 C 320 50, 390 28, 468 16"
                    fill="none"
                    stroke="url(#bento-curve-stroke)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    className="bento-curve-draw"
                  />
                  {/* Point intermédiaire réactif au survol */}
                  <circle
                    cx="240"
                    cy="62"
                    r="4.5"
                    fill="var(--surface-well)"
                    stroke="var(--home-orange-light)"
                    strokeWidth="2"
                  />
                  {/* Halo animé du point final */}
                  <circle
                    cx="468"
                    cy="16"
                    r="9"
                    fill="none"
                    stroke="var(--home-orange)"
                    strokeWidth="1.5"
                    className="animate-ping-slow"
                  />
                  <circle cx="468" cy="16" r="4.5" fill="var(--home-orange)" />
                </svg>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-1.5">
                  {t("fonctionnalites.creole.titre")}
                </h3>
                <p className="text-sm text-ice-white/70 font-sans leading-relaxed max-w-xl">
                  {t("fonctionnalites.creole.description")}
                </p>
              </div>
            </div>

            {/* Carte 2 (Colonne verticale droite - row-span-2) : Étapes & validation d'accès équilibrée */}
            <div className="group md:col-span-1 md:row-span-2 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 shadow-[var(--card-shadow)] transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between min-w-0">
              <div className="space-y-4 mb-6">
                <div className="space-y-2.5">
                  {capabilityRows.map((label, idx) => (
                    <div
                      key={label}
                      style={{ transitionDelay: `${idx * 35}ms` }}
                      className="p-3 rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)] group-hover:border-[var(--border-subtle)] hover:!border-[var(--home-orange)]/40 group-hover:translate-x-0.5 transition-all duration-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-deep-navy border border-[var(--border-subtle)] text-[var(--home-orange-light)] font-mono text-xs flex items-center justify-center shrink-0 tabular-nums">
                          0{idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-ice-white truncate">
                          {label}
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-[var(--home-orange)] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ))}
                </div>

                {/* Connecteur visuel + confirmation d'accès instantané pour équilibrer la colonne */}
                <div className="flex flex-col items-center py-1" aria-hidden="true">
                  <span className="w-px h-5 bg-gradient-to-b from-slate-900/15 dark:from-white/15 to-[var(--home-orange)]/60" />
                  <span className="w-2 h-2 rounded-full bg-[var(--home-orange)] shadow-sm shadow-[var(--home-orange-glow)]" />
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-well)] border border-[var(--home-orange)]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-[var(--home-orange)]/15 border border-[var(--home-orange)]/35 text-[var(--home-orange-light)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ice-white truncate">
                        {t("paiement.reussi")}
                      </p>
                      <p className="font-mono text-[11px] text-[var(--home-orange-light)] truncate">
                        {t("bento.badgeAcces")}
                      </p>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-[var(--home-orange)] text-[var(--home-orange-fg)] inline-flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-1.5">
                  {t("fonctionnalites.acces.titre")}
                </h3>
                <p className="text-sm text-ice-white/70 font-sans leading-relaxed">
                  {t("fonctionnalites.acces.description")}
                </p>
              </div>
            </div>

            {/* Carte 3 : Jauge circulaire orange animée à 100% */}
            <div className="group md:col-span-1 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 shadow-[var(--card-shadow)] transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between min-w-0">
              <div className="py-4 flex items-center justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <div
                    className="absolute inset-2 rounded-full pointer-events-none opacity-65 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(circle, var(--home-orange-glow-soft) 0%, transparent 68%)",
                    }}
                    aria-hidden="true"
                  />
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
                    <defs>
                      <linearGradient id="bento-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--home-orange-dark)" />
                        <stop offset="50%" stopColor="var(--home-orange)" />
                        <stop offset="100%" stopColor="var(--home-orange-light)" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="var(--track-muted)"
                      strokeWidth="8.5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#bento-ring-gradient)"
                      strokeWidth="8.5"
                      strokeLinecap="round"
                      strokeDasharray="251.33"
                      className="bento-ring-draw"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-2xl text-ice-white tabular-nums">
                      {t("bento.progressionCent")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--home-orange-light)]">
                      {t("bento.badgeProgression")}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                  {t("fonctionnalites.progression.titre")}
                </h3>
                <p className="text-sm text-ice-white/70 font-sans leading-relaxed">
                  {t("fonctionnalites.progression.description")}
                </p>
              </div>
            </div>

            {/* Carte 4 : Matrice 3x3 animée centrée sur l'icône play orange */}
            <div className="group md:col-span-1 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 shadow-[var(--card-shadow)] transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between min-w-0">
              <div className="py-4 flex justify-center">
                <div className="relative grid grid-cols-3 gap-2.5" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cell) => {
                    const isCenter = cell === 4;
                    return (
                      <div
                        key={cell}
                        style={!isCenter ? { animationDelay: matrixDelays[cell] } : undefined}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                          isCenter
                            ? "relative bg-[var(--home-orange)] border-[var(--home-orange-light)] text-[var(--home-orange-fg)] shadow-lg shadow-[var(--home-orange-glow)] group-hover:scale-110"
                            : "bg-[var(--surface-well)] border-[var(--border-subtle)] group-hover:border-[var(--home-orange)]/30"
                        }`}
                      >
                        {isCenter ? (
                          <svg className="w-4 h-4 translate-x-0.5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <span
                            style={{ animationDelay: matrixDelays[cell] }}
                            className="w-2 h-2 rounded-sm bg-slate-400/55 dark:bg-white/25 group-hover:bg-[var(--home-orange-light)]/75 animate-matrix-tile transition-colors"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                  {t("fonctionnalites.mobile.titre")}
                </h3>
                <p className="text-sm text-ice-white/70 font-sans leading-relaxed">
                  {t("fonctionnalites.mobile.description")}
                </p>
              </div>
            </div>

            {/* Carte 5 : Cercles concentriques rotatifs avec icône orange */}
            <div className="group md:col-span-1 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 shadow-[var(--card-shadow)] transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between min-w-0">
              <div className="py-5 flex justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center" aria-hidden="true">
                  <div className="absolute inset-0 rounded-full border border-dashed border-[var(--border-strong)] group-hover:border-[var(--home-orange)]/40 group-hover:rotate-45 transition-all duration-700 ease-out" />
                  <div className="absolute inset-3 rounded-full border border-[var(--border-subtle)] group-hover:border-[var(--home-orange)]/25 group-hover:scale-105 transition-all duration-500" />
                  <div className="w-12 h-12 rounded-xl bg-[var(--home-orange)]/15 border border-[var(--home-orange)]/45 flex items-center justify-center text-[var(--home-orange-light)] shadow-lg shadow-[var(--home-orange-glow-soft)] group-hover:scale-105 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500 ease-out"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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

              <div>
                <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                  {t("fonctionnalites.revoir.titre")}
                </h3>
                <p className="text-sm text-ice-white/70 font-sans leading-relaxed">
                  {t("fonctionnalites.revoir.description")}
                </p>
              </div>
            </div>

            {/* Carte 6 (Large - col-span-2) : Paiement local structuré */}
            <div className="group md:col-span-2 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 shadow-[var(--card-shadow)] transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between min-w-0">
              <div className="rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)] p-4 sm:p-5 mb-6 space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-faint)]">
                  <span className="font-mono text-xs uppercase tracking-wider text-ice-white/70">
                    {t("tarifs.moyensTitre")}
                  </span>
                  <span className="font-mono text-xs text-[var(--home-orange-light)]">
                    {t("bento.badgePaiement")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {paymentMethods.map((method, idx) => (
                    <div
                      key={method}
                      style={{ transitionDelay: `${idx * 45}ms` }}
                      className="px-4 py-2.5 rounded-xl bg-deep-navy border border-[var(--border-subtle)] group-hover:border-[var(--home-orange)]/30 group-hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-ice-white"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-[var(--home-orange)] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-1.5">
                  {t("fonctionnalites.paiement.titre")}
                </h3>
                <p className="text-sm text-ice-white/70 font-sans leading-relaxed max-w-xl">
                  {t("fonctionnalites.paiement.description")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Features;
