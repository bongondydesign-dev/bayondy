"use client";

import React, { useState } from "react";
import { Lock, Play } from "lucide-react";
import { t } from "@/lib/i18n";

interface PreviewLesson {
  id: number;
  title: string;
  duration: string;
  progress: string;
  progressPct: number;
}

export function HeroPreview() {
  const lessons: PreviewLesson[] = [
    {
      id: 0,
      title: t("hero.apercu.lecon1"),
      duration: t("hero.apercu.lecon1Duree"),
      progress: "25%",
      progressPct: 25,
    },
    {
      id: 1,
      title: t("hero.apercu.lecon2"),
      duration: t("hero.apercu.lecon2Duree"),
      progress: "62%",
      progressPct: 62,
    },
    {
      id: 2,
      title: t("hero.apercu.lecon3"),
      duration: t("hero.apercu.lecon3Duree"),
      progress: "100%",
      progressPct: 100,
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const current = lessons[activeIdx];

  return (
    <div className="mt-12 sm:mt-16 w-full max-w-5xl relative animate-hero-4">
      <div
        className="absolute -inset-6 -z-10 pointer-events-none opacity-40 dark:opacity-95"
        style={{
          background:
            "radial-gradient(ellipse 72% 45% at 50% 10%, var(--home-orange-glow) 0%, var(--home-orange-glow-soft) 52%, transparent 78%)",
        }}
        aria-hidden="true"
      />

      <div className="rounded-2xl bg-[var(--surface-browser)] border border-[var(--border-strong)]/80 dark:border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors duration-300 shadow-[var(--card-shadow-hover)] dark:shadow-[var(--card-shadow)] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.04] overflow-hidden text-left">
        {/* Barre de fenêtre navigateur */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-sidebar)]">
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/15 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/15 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-white/15 inline-block" />
          </div>
          <div className="px-3 py-1 rounded-lg bg-deep-navy dark:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[11px] font-mono text-slate-600 dark:text-ice-white/75 inline-flex items-center gap-1.5 truncate max-w-[220px] sm:max-w-none shadow-[0_1px_1px_rgba(15,23,42,0.03)] dark:shadow-none">
            <Lock className="w-3 h-3 text-[var(--home-orange-light)] shrink-0" strokeWidth={2.2} aria-hidden="true" />
            <span className="truncate">bayondy.com / {t("hero.apercu.badge")}</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-ice-white/55 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--home-orange)]" aria-hidden="true" />
            HD
          </span>
        </div>

        {/* Corps de l'interface : Barre latérale + Espace leçon principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Barre latérale gauche */}
          <div className="hidden lg:flex lg:col-span-3 border-r border-[var(--border-subtle)] bg-[var(--surface-sidebar)] p-4 flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 px-2 py-2 mb-4">
                <span className="w-6 h-6 rounded-md bg-[var(--home-orange)] text-[var(--home-orange-fg)] inline-flex items-center justify-center font-display font-bold text-xs shrink-0">
                  B
                </span>
                <span className="font-display font-semibold text-sm text-ice-white">
                  {t("accueil.titre")}
                </span>
              </div>

              <p className="px-2 mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-ice-white/60">
                {t("hero.apercu.listeTitre")}
              </p>

              <div className="space-y-1.5">
                {lessons.map((lesson, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      aria-pressed={isActive}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] cursor-pointer ${
                        isActive
                          ? "bg-[var(--surface-active)] border border-[var(--home-orange)]/40 font-semibold text-ice-white shadow-2xs"
                          : "border border-transparent text-slate-600 dark:text-ice-white/70 hover:text-ice-white hover:bg-slate-900/[0.045] dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="truncate">{lesson.title}</span>
                      <span
                        className={`font-mono text-[11px] tabular-nums shrink-0 ${
                          isActive ? "text-[var(--home-orange-light)] font-semibold" : "text-slate-500 dark:text-ice-white/60"
                        }`}
                      >
                        {lesson.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Carte de progression en bas de barre latérale */}
            <div className="mt-6 p-3 rounded-xl bg-deep-navy border border-[var(--border-subtle)] shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:shadow-none">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-600 dark:text-ice-white/70 font-sans font-medium">
                  {t("hero.apercu.progression")}
                </span>
                <span className="font-mono font-semibold text-[var(--home-orange-light)] tabular-nums">
                  {current.progress}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--track-muted)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--home-orange-dark)] to-[var(--home-orange)] transition-all duration-300 ease-out"
                  style={{ width: `${current.progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Zone principale : En-tête + Lecteur vidéo + Liste des leçons */}
          <div className="lg:col-span-9 p-4 sm:p-6 bg-[var(--surface-browser)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-faint)]">
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm sm:text-base text-ice-white truncate">
                  {current.title}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-ice-white/75">
                <span className="px-2.5 py-1 rounded-md bg-[var(--surface-active)] dark:bg-[var(--surface-subtle)] border border-[var(--home-orange)]/25 dark:border-[var(--border-subtle)] text-[var(--home-orange-light)] font-medium">
                  {t("bento.badgeCreole")}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[var(--surface-well)] border border-[var(--border-subtle)] tabular-nums">
                  {current.duration}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Écran lecteur vidéo cinéma */}
              <div className="md:col-span-8 aspect-video rounded-xl bg-gradient-to-br from-[#131927] via-[#0D111C] to-[#080B12] border border-slate-900/15 dark:border-white/[0.08] shadow-inner flex flex-col items-center justify-center relative p-4 overflow-hidden group/player">
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-85 group-hover/player:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 45%, rgba(255, 91, 34, 0.2) 0%, transparent 62%)",
                  }}
                  aria-hidden="true"
                />

                {/* Trame discrète sur l'écran vidéo */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10 flex items-center justify-center">
                  <span
                    className="absolute w-20 h-20 rounded-full border border-[#FF5B22]/35 animate-ping-slow pointer-events-none"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveIdx((prev) => (prev + 1) % lessons.length)}
                    aria-label={current.title}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FF5B22] hover:bg-[#FF7342] text-white flex items-center justify-center shadow-[0_8px_28px_rgba(255,91,34,0.42)] group-hover/player:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] cursor-pointer"
                  >
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 translate-x-0.5 fill-current" aria-hidden="true" />
                  </button>
                </div>

                {/* Barre de contrôle vitrée en bas du lecteur */}
                <div className="absolute inset-x-3 bottom-3 rounded-lg bg-black/45 backdrop-blur-md border border-white/10 px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-100 truncate">
                      {current.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 shrink-0 tabular-nums">
                      {current.duration}
                    </span>
                  </div>
                  <div className="h-1 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#E54813] to-[#FF885C] rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${current.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Panneau droit interactif des leçons */}
              <div className="md:col-span-4 rounded-xl bg-[var(--surface-sidebar)] border border-[var(--border-subtle)] p-3.5 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border-faint)]">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-ice-white/65">
                      {t("hero.apercu.listeTitre")}
                    </span>
                    <span className="font-mono font-semibold text-xs text-[var(--home-orange-light)] tabular-nums">
                      {current.progress}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {lessons.map((lesson, idx) => {
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => setActiveIdx(idx)}
                          aria-pressed={isActive}
                          className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] cursor-pointer ${
                            isActive
                              ? "bg-[var(--surface-active)] border border-[var(--home-orange)]/40 text-ice-white font-semibold shadow-2xs"
                              : "bg-deep-navy border border-[var(--border-subtle)] text-slate-600 dark:text-ice-white/75 hover:border-[var(--border-strong)] hover:text-ice-white"
                          }`}
                        >
                          <span className="truncate">{lesson.title}</span>
                          <span
                            className={`font-mono text-[11px] shrink-0 tabular-nums ${
                              isActive ? "text-[var(--home-orange-light)]" : "text-slate-500 dark:text-ice-white/60"
                            }`}
                          >
                            {lesson.duration}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[var(--border-faint)] flex items-center justify-between text-xs text-slate-600 dark:text-ice-white/70">
                  <span>{t("hero.apercu.progression")}</span>
                  <span className="font-mono font-semibold text-[var(--home-orange-light)] tabular-nums">
                    {current.progress}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroPreview;
