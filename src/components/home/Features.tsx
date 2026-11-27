import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  LockOpen,
  Play,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";

export function Features() {
  const milestones = [
    { num: t("etapes.aprann.numero"), label: t("etapes.aprann.titre") },
    { num: t("etapes.kreye.numero"), label: t("etapes.kreye.titre") },
    { num: t("etapes.avanse.numero"), label: t("etapes.avanse.titre") },
  ];

  const unlockedLessons = [
    {
      num: "01",
      title: t("hero.apercu.lecon1").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon1Duree"),
    },
    {
      num: "02",
      title: t("hero.apercu.lecon2").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon2Duree"),
    },
    {
      num: "03",
      title: t("hero.apercu.lecon3").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon3Duree"),
    },
  ];

  return (
    <section className="w-full py-24 sm:py-32 bg-transparent relative transition-colors duration-200">
      <div
        className="section-hairline absolute top-0 inset-x-0 h-px"
        aria-hidden="true"
      />

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
              <p className="text-sm sm:text-base text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed text-balance">
                {t("bento.sousTitreSection")}
              </p>
              <Link
                href="/formations"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-ice-white hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md"
              >
                <span>{t("hero.cta")}</span>
                <span
                  className="w-6 h-6 rounded-full bg-slate-900/[0.06] dark:bg-white/[0.08] inline-flex items-center justify-center group-hover:translate-x-0.5 group-hover:bg-[var(--home-orange)]/15 group-hover:text-[var(--home-orange-light)] transition-all duration-200"
                  aria-hidden="true"
                >
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
                </span>
              </Link>
            </div>
          </div>

          {/* Grille Bento asymétrique */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* ── Carte 1 (col-span-2) : Leçons en créole ─────────────────────── */}
            <article className="group md:col-span-2 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-w-0">
              <div
                className="absolute -top-24 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-35 dark:opacity-55 group-hover:opacity-75 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(circle, var(--home-orange-glow-soft) 0%, transparent 68%)",
                }}
                aria-hidden="true"
              />

              <div className="relative z-10 pb-6 mb-6 border-b border-[var(--border-faint)]">
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-ice-white/55 block mb-1">
                      {t("fonctionnalites.creole.titre")}
                    </span>
                    <span className="font-display font-bold text-3xl sm:text-4xl text-ice-white tracking-tight tabular-nums">
                      {t("bento.badgeCreole")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-ice-white/65">
                    <span className="text-[var(--home-orange-light)] font-medium">
                      {t("catalogue.langues.ht")}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">01 — 03</span>
                  </div>
                </div>

                {/* Courbe ascendante avec points exacts sur les nœuds du tracé */}
                <div className="relative">
                  <svg
                    viewBox="0 0 560 124"
                    className="w-full h-28 sm:h-32 overflow-visible"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="bento-curve-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--home-orange)" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="var(--home-orange)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="bento-curve-stroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--home-orange-dark)" />
                        <stop offset="55%" stopColor="var(--home-orange)" />
                        <stop offset="100%" stopColor="var(--home-orange-light)" />
                      </linearGradient>
                    </defs>

                    <line
                      x1="0"
                      y1="24"
                      x2="560"
                      y2="24"
                      stroke="var(--surface-grid-line)"
                      strokeDasharray="2 6"
                    />
                    <line
                      x1="0"
                      y1="62"
                      x2="560"
                      y2="62"
                      stroke="var(--surface-grid-line)"
                      strokeDasharray="2 6"
                    />
                    <line
                      x1="0"
                      y1="106"
                      x2="560"
                      y2="106"
                      stroke="var(--surface-grid-line)"
                    />

                    {/* Repères verticaux exacts sous les 3 jalons */}
                    <line x1="56" y1="98" x2="56" y2="112" stroke="var(--border-strong)" />
                    <line x1="284" y1="62" x2="284" y2="112" stroke="var(--border-strong)" />
                    <line
                      x1="528"
                      y1="22"
                      x2="528"
                      y2="112"
                      stroke="var(--home-orange)"
                      strokeOpacity="0.45"
                    />

                    {/* Aire sous courbe */}
                    <path
                      d="M 16 104 C 30 102, 42 100, 56 98 C 130 88, 210 74, 284 62 C 365 49, 448 34, 528 22 L 528 106 L 16 106 Z"
                      fill="url(#bento-curve-fill)"
                    />

                    {/* Tracé animé passant exactement par (56,98), (284,62) et (528,22) */}
                    <path
                      d="M 16 104 C 30 102, 42 100, 56 98 C 130 88, 210 74, 284 62 C 365 49, 448 34, 528 22"
                      fill="none"
                      stroke="url(#bento-curve-stroke)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="bento-curve-draw"
                    />

                    <circle
                      cx="56"
                      cy="98"
                      r="4"
                      fill="var(--deep-navy)"
                      stroke="var(--home-orange-dark)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="284"
                      cy="62"
                      r="4.5"
                      fill="var(--deep-navy)"
                      stroke="var(--home-orange)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="528"
                      cy="22"
                      r="10"
                      fill="none"
                      stroke="var(--home-orange)"
                      strokeWidth="1.25"
                      className="animate-ping-slow"
                    />
                    <circle cx="528" cy="22" r="4.5" fill="var(--home-orange)" />
                  </svg>

                  <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-600 dark:text-ice-white/65">
                    {milestones.map((m, i) => (
                      <div
                        key={m.num}
                        className={`flex items-center gap-1.5 ${
                          i === 1
                            ? "justify-center"
                            : i === 2
                              ? "justify-end text-ice-white font-medium"
                              : "justify-start"
                        }`}
                      >
                        <span className="text-[var(--home-orange-light)] tabular-nums">
                          {m.num}
                        </span>
                        <span className="truncate">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-1.5">
                  {t("fonctionnalites.creole.titre")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed max-w-xl">
                  {t("fonctionnalites.creole.description")}
                </p>
              </div>
            </article>

            {/* ── Carte 2 (row-span-2) : Aksè otomatik ───────────────────────── */}
            <article className="group md:col-span-1 md:row-span-2 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden min-w-0">
              <div
                className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full pointer-events-none opacity-25 dark:opacity-45 group-hover:opacity-70 transition-opacity duration-300"
                style={{
                  background:
                    "radial-gradient(circle, var(--home-orange-glow-soft) 0%, transparent 68%)",
                }}
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col">
                {/* En-tête de séquence */}
                <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-[var(--border-faint)]">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-ice-white/60">
                    MonCash → {t("bento.badgeAcces")}
                  </span>
                  <LockOpen
                    className="w-4 h-4 text-[var(--home-orange-light)] shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                {/* Timeline 2 nœuds + connecteur net vers la liste de leçons */}
                <div className="relative pl-8 space-y-6">
                  {/* Ligne verticale qui relie exactement les 3 pastilles (top 12px -> bottom de la 3e pastille) */}
                  <span
                    className="absolute left-[11px] top-3 h-[116px] w-px bg-gradient-to-b from-emerald-500/60 via-[var(--home-orange)]/70 to-[var(--border-strong)]"
                    aria-hidden="true"
                  />

                  {/* Étape 1 : Paiement confirmé */}
                  <div className="relative">
                    <span
                      className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-deep-navy border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <Check className="w-3 h-3" strokeWidth={2.6} />
                    </span>
                    <p className="font-sans text-sm font-semibold text-ice-white leading-snug">
                      {t("paiement.reussi")}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-ice-white/55 mt-0.5">
                      MonCash · {t("tarifs.statutDisponible")}
                    </p>
                  </div>

                  {/* Étape 2 : Déblocage automatique */}
                  <div className="relative">
                    <span
                      className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-[var(--home-orange)] text-[var(--home-orange-fg)] flex items-center justify-center shadow-[0_0_16px_var(--home-orange-glow)] group-hover:scale-105 transition-transform duration-200"
                      aria-hidden="true"
                    >
                      <LockOpen className="w-3 h-3" strokeWidth={2.4} />
                    </span>
                    <p className="font-sans text-sm font-semibold text-ice-white leading-snug">
                      {t("fonctionnalites.acces.titre")}
                    </p>
                    <p className="font-mono text-[11px] text-[var(--home-orange-light)] mt-0.5">
                      {t("bento.badgeAcces")}
                    </p>
                  </div>

                  {/* Étape 3 : En-tête de la liste débloquée */}
                  <div className="relative">
                    <span
                      className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-deep-navy border border-[var(--border-strong)] text-[var(--home-orange-light)] flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <Play className="w-2.5 h-2.5 translate-x-[1px] fill-current" />
                    </span>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 dark:text-ice-white/60 leading-6">
                      {t("hero.apercu.listeTitre")}
                    </p>
                  </div>
                </div>

                {/* Liste épurée des 3 leçons débloquées alignée pleine largeur */}
                <div className="mt-5 divide-y divide-[var(--border-faint)] border-t border-b border-[var(--border-faint)]">
                  {unlockedLessons.map((lesson) => (
                    <div
                      key={lesson.num}
                      className="py-3 flex items-center justify-between gap-3 text-xs group-hover:translate-x-0.5 transition-transform duration-200"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[11px] font-semibold text-[var(--home-orange-light)] tabular-nums shrink-0">
                          {lesson.num}
                        </span>
                        <span className="font-sans text-ice-white/90 truncate">
                          {lesson.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 dark:text-ice-white/50 tabular-nums shrink-0">
                        {lesson.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-[var(--border-faint)]">
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-1.5">
                  {t("fonctionnalites.acces.titre")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed">
                  {t("fonctionnalites.acces.description")}
                </p>
              </div>
            </article>

            {/* ── Carte 3 : Swiv pwogrè w ────────────────────────────────────── */}
            <article className="group md:col-span-1 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between min-w-0">
              <div className="py-2 flex flex-col items-center justify-center gap-4">
                <div className="relative w-32 h-32 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-200">
                  <div
                    className="absolute inset-2 rounded-full pointer-events-none opacity-45 dark:opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(circle, var(--home-orange-glow-soft) 0%, transparent 68%)",
                    }}
                    aria-hidden="true"
                  />
                  <svg
                    viewBox="0 0 112 112"
                    className="w-full h-full -rotate-90"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="bento-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--home-orange-dark)" />
                        <stop offset="55%" stopColor="var(--home-orange)" />
                        <stop offset="100%" stopColor="var(--home-orange-light)" />
                      </linearGradient>
                    </defs>

                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      fill="none"
                      stroke="var(--border-subtle)"
                      strokeWidth="1"
                      strokeDasharray="2 6"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="40"
                      fill="none"
                      stroke="var(--track-muted)"
                      strokeWidth="5.5"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="40"
                      fill="none"
                      stroke="url(#bento-ring-gradient)"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeDasharray="251.33"
                      className="bento-ring-draw"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-2xl text-ice-white tabular-nums tracking-tight">
                      {t("bento.progressionCent")}
                    </span>
                    <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--home-orange-light)] mt-0.5">
                      {t("bento.badgeProgression")}
                    </span>
                  </div>
                </div>

                {/* Repères de progression par chapitre */}
                <div className="w-full max-w-[196px] space-y-1.5" aria-hidden="true">
                  <div className="grid grid-cols-3 gap-1.5">
                    <span className="h-1 rounded-full bg-[var(--home-orange)]" />
                    <span className="h-1 rounded-full bg-[var(--home-orange)]" />
                    <span className="h-1 rounded-full bg-[var(--home-orange-light)]" />
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-ice-white/50 tabular-nums">
                    <span>01</span>
                    <span>02</span>
                    <span className="text-[var(--home-orange-light)]">03</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border-faint)]">
                <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                  {t("fonctionnalites.progression.titre")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed">
                  {t("fonctionnalites.progression.description")}
                </p>
              </div>
            </article>

            {/* ── Carte 4 : Fèt pou telefòn ──────────────────────────────────── */}
            <article className="group md:col-span-1 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between min-w-0">
              <div className="py-2 flex justify-center">
                <div className="w-full max-w-[208px] rounded-2xl bg-gradient-to-b from-[#171B26] to-[#0B0D13] border border-slate-900/20 dark:border-white/[0.12] p-3.5 text-white shadow-[0_14px_30px_-14px_rgba(15,23,42,0.45)] group-hover:-translate-y-0.5 transition-transform duration-200 relative overflow-hidden">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 48%, rgba(255,91,34,0.16) 0%, transparent 62%)",
                    }}
                    aria-hidden="true"
                  />

                  <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-zinc-300 mb-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Smartphone
                        className="w-3 h-3 text-[#FF885C]"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span>{t("bento.badgeMobile")}</span>
                    </span>
                    <span className="inline-flex items-end gap-0.5 h-2.5" aria-hidden="true">
                      <span className="w-0.5 h-1 rounded-xs bg-[#FF885C]" />
                      <span className="w-0.5 h-1.5 rounded-xs bg-[#FF885C]" />
                      <span className="w-0.5 h-2.5 rounded-xs bg-white/40 group-hover:bg-[#FF885C] transition-colors" />
                    </span>
                  </div>

                  <div className="relative z-10 py-5 flex items-center justify-center">
                    <span
                      className="absolute w-14 h-14 rounded-full border border-[#FF5B22]/35 group-hover:scale-110 transition-transform duration-300"
                      aria-hidden="true"
                    />
                    <span className="w-10 h-10 rounded-full bg-[#FF5B22] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(255,91,34,0.45)] group-hover:scale-105 transition-transform duration-200">
                      <Play className="w-4 h-4 translate-x-0.5 fill-current" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="relative z-10 mt-2 space-y-1.5">
                    <div className="h-1 w-full rounded-full bg-white/15 overflow-hidden">
                      <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#E54813] to-[#FF885C]" />
                    </div>
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 tabular-nums">
                      <span>04:18</span>
                      <span>12:45</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border-faint)]">
                <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                  {t("fonctionnalites.mobile.titre")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed">
                  {t("fonctionnalites.mobile.description")}
                </p>
              </div>
            </article>

            {/* ── Carte 5 : Gade yo tout tan ─────────────────────────────────── */}
            <article className="group md:col-span-1 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between min-w-0">
              <div className="py-2 flex flex-col items-center justify-center gap-4">
                <div
                  className="relative w-32 h-32 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <defs>
                      <linearGradient id="bento-orbit-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--home-orange)" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="var(--home-orange-light)" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>

                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="var(--border-strong)"
                      strokeWidth="1"
                      strokeDasharray="3 6"
                      className="origin-center group-hover:rotate-45 transition-transform duration-700 ease-out"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="38"
                      fill="none"
                      stroke="url(#bento-orbit-grad)"
                      strokeWidth="2"
                    />
                    <circle cx="98" cy="60" r="3.5" fill="var(--home-orange)" />
                  </svg>

                  <div className="absolute w-12 h-12 rounded-full bg-[var(--surface-active)] border border-[var(--home-orange)]/35 flex items-center justify-center text-[var(--home-orange)] dark:text-[var(--home-orange-light)] shadow-[0_6px_18px_-4px_var(--home-orange-glow)] group-hover:scale-105 transition-transform duration-200">
                    <RefreshCw
                      className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ease-out"
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* Cadence chapitres complète + San limit */}
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-ice-white/65 tabular-nums">
                  <span>01</span>
                  <span className="text-slate-400 dark:text-ice-white/30" aria-hidden="true">·</span>
                  <span>02</span>
                  <span className="text-slate-400 dark:text-ice-white/30" aria-hidden="true">·</span>
                  <span>03</span>
                  <span className="text-slate-400 dark:text-ice-white/30" aria-hidden="true">·</span>
                  <span className="text-[var(--home-orange-light)] font-medium">
                    {t("bento.badgeRevoir")}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border-faint)]">
                <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                  {t("fonctionnalites.revoir.titre")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed">
                  {t("fonctionnalites.revoir.description")}
                </p>
              </div>
            </article>

            {/* ── Carte 6 (col-span-2) : Peman lokal fasil ───────────────────── */}
            <article className="group md:col-span-2 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-200 p-6 sm:p-8 flex flex-col justify-between min-w-0">
              <div className="space-y-4 pb-6 mb-6 border-b border-[var(--border-faint)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-ice-white/65">
                    {t("tarifs.moyensTitre")}
                  </span>
                  <span className="font-mono text-xs font-medium text-[var(--home-orange-light)]">
                    {t("bento.badgePaiement")} · HTG / USD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MonCash — Disponible */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-active)] border border-[var(--home-orange)]/40 flex items-center justify-between gap-3 group-hover:-translate-y-0.5 transition-transform duration-200">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-base text-ice-white truncate">
                          MonCash
                        </p>
                        <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
                          {t("tarifs.statutDisponible")} · {t("bento.badgeAcces")}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-[var(--home-orange-light)] shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                      aria-hidden="true"
                    />
                  </div>

                  {/* NatCash — À venir */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-well)] border border-dashed border-[var(--border-strong)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-10 h-10 rounded-lg bg-deep-navy border border-[var(--border-subtle)] text-slate-500 dark:text-zinc-400 inline-flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-medium text-base text-ice-white/85 truncate">
                          NatCash
                        </p>
                        <p className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {t("tarifs.statutAvenir")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ligne de synthèse transactionnelle discrète */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-500 dark:text-ice-white/55">
                  <span>{t("paiement.reussi")} → {t("fonctionnalites.acces.titre")}</span>
                  <span className="text-ice-white/75 tabular-nums">HTG · USD</span>
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-1.5">
                  {t("fonctionnalites.paiement.titre")}
                </h3>
                <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed max-w-xl">
                  {t("fonctionnalites.paiement.description")}
                </p>
              </div>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Features;
