"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Lock,
  Maximize2,
  MonitorPlay,
  Pause,
  Play,
  SkipForward,
  Smartphone,
  Volume2,
} from "lucide-react";
import { t } from "@/lib/i18n";

interface PreviewLesson {
  id: number;
  num: string;
  title: string;
  cleanTitle: string;
  duration: string;
  elapsed: string;
  progress: string;
  progressPct: number;
  tag: string;
  slideSubtitle: string;
}

const SPEEDS = ["1x", "1.25x", "1.5x"] as const;

export function HeroPreview() {
  const lessons: PreviewLesson[] = [
    {
      id: 0,
      num: "01",
      title: t("hero.apercu.lecon1"),
      cleanTitle: t("hero.apercu.lecon1").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon1Duree"),
      elapsed: "03:12",
      progress: "33%",
      progressPct: 33,
      tag: t("etapes.aprann.titre"),
      slideSubtitle: t("fonctionnalites.creole.titre"),
    },
    {
      id: 1,
      num: "02",
      title: t("hero.apercu.lecon2"),
      cleanTitle: t("hero.apercu.lecon2").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon2Duree"),
      elapsed: "11:24",
      progress: "67%",
      progressPct: 67,
      tag: t("etapes.kreye.titre"),
      slideSubtitle: t("catalogue.atoutMobile"),
    },
    {
      id: 2,
      num: "03",
      title: t("hero.apercu.lecon3"),
      cleanTitle: t("hero.apercu.lecon3").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon3Duree"),
      elapsed: "24:10",
      progress: "100%",
      progressPct: 100,
      tag: t("etapes.avanse.titre"),
      slideSubtitle: t("catalogue.atoutRythme"),
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);

  const current = lessons[activeIdx];
  const nextLesson = lessons[(activeIdx + 1) % lessons.length];

  const handleSelectLesson = (idx: number) => {
    setActiveIdx(idx);
    setIsPlaying(true);
  };

  return (
    <div className="mt-12 sm:mt-16 w-full max-w-5xl relative animate-hero-4">
      {/* Halo ambiant sobre ancré en haut de la fenêtre */}
      <div
        className="absolute -inset-6 -z-10 pointer-events-none opacity-40 dark:opacity-55"
        style={{
          background:
            "radial-gradient(ellipse 68% 42% at 50% 8%, var(--home-orange-glow) 0%, var(--home-orange-glow-soft) 50%, transparent 76%)",
        }}
        aria-hidden="true"
      />

      <div className="rounded-2xl bg-[var(--surface-browser)] dark:backdrop-blur-xl border border-[var(--border-strong)] dark:border-white/[0.11] hover:border-slate-900/35 dark:hover:border-white/[0.18] transition-colors duration-300 shadow-[var(--card-shadow-hover)] dark:shadow-[0_28px_72px_-20px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden text-left">
        {/* Barre supérieure navigateur */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--surface-sidebar)]">
          <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400/90 dark:bg-white/15 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400/90 dark:bg-white/15 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400/90 dark:bg-white/15 inline-block" />
          </div>

          <div className="px-3 py-1 rounded-lg bg-deep-navy dark:bg-[#13161F] border border-[var(--border-subtle)] text-[11px] font-mono text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1.5 truncate max-w-[230px] sm:max-w-none shadow-[0_1px_1px_rgba(15,23,42,0.04)] dark:shadow-none">
            <Lock
              className="w-3 h-3 text-[var(--home-orange-light)] shrink-0"
              strokeWidth={2.2}
              aria-hidden="true"
            />
            <span className="truncate">
              bayondy.com / {t("hero.apercu.badge")}
            </span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-deep-navy dark:bg-[#141720] border border-[var(--border-subtle)] text-slate-700 dark:text-zinc-300 font-medium">
              <MonitorPlay className="w-3 h-3 text-[var(--home-orange-vivid)]" aria-hidden="true" />
              HD
            </span>
          </div>
        </div>

        {/* Corps unifié : Barre latérale + Scène vidéo cinéma */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Barre latérale gauche */}
          <aside className="hidden md:flex md:col-span-4 border-r border-[var(--border-subtle)] bg-[var(--surface-sidebar)] p-4 lg:p-5 flex-col justify-between min-w-0">
            <div>
              {/* En-tête formation */}
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#FF652E] to-[var(--home-orange)] text-[var(--home-orange-fg)] inline-flex items-center justify-center font-display font-bold text-xs shadow-xs shrink-0">
                    B
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm text-ice-white leading-tight truncate">
                      {t("accueil.titre")}
                    </p>
                    <p className="font-mono text-[10px] text-slate-600 dark:text-zinc-400 truncate">
                      {t("bento.badgeCreole")}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-semibold text-[var(--home-orange-light)] bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/40 px-2 py-0.5 rounded-md tabular-nums shrink-0">
                  {current.num}/{String(lessons.length).padStart(2, "0")}
                </span>
              </div>

              <p className="px-1 mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 dark:text-zinc-400 font-medium">
                {t("hero.apercu.listeTitre")}
              </p>

              {/* Liste interactive des 3 leçons avec layoutId animé */}
              <div className="space-y-2">
                {lessons.map((lesson, idx) => {
                  const isActive = idx === activeIdx;
                  const isCompleted = idx < activeIdx;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => handleSelectLesson(idx)}
                      aria-pressed={isActive}
                      className={`relative w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] cursor-pointer ${
                        isActive
                          ? "text-ice-white"
                          : "bg-white dark:bg-[#12151E]/85 border border-[var(--border-subtle)] shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:shadow-none text-slate-700 dark:text-zinc-300 hover:border-[var(--border-strong)] hover:text-ice-white dark:hover:bg-[#171B26]"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="hero-lesson-active"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-xl bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/55 shadow-2xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                          aria-hidden="true"
                        />
                      )}

                      <span
                        className={`relative z-10 w-6 h-6 rounded-lg font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 tabular-nums transition-colors ${
                          isActive
                            ? "bg-[var(--home-orange)] text-[var(--home-orange-fg)]"
                            : isCompleted
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-[var(--surface-well)] text-slate-600 dark:text-zinc-400 border border-[var(--border-subtle)]"
                        }`}
                        aria-hidden="true"
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        ) : (
                          lesson.num
                        )}
                      </span>

                      <div className="relative z-10 flex-1 min-w-0">
                        <p
                          className={`text-xs leading-snug truncate ${
                            isActive ? "font-semibold text-ice-white" : "font-medium"
                          }`}
                        >
                          {lesson.cleanTitle}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                          <span>{lesson.tag}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{lesson.duration}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Carte de progression globale */}
            <div className="mt-5 p-3.5 rounded-xl bg-white dark:bg-[#11141C] border border-[var(--border-subtle)] shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-700 dark:text-zinc-300 font-sans font-medium">
                  {t("hero.apercu.progression")}
                </span>
                <span className="font-mono font-semibold text-[var(--home-orange-light)] tabular-nums">
                  {current.progress}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--track-muted)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--home-orange)] to-[var(--home-orange-vivid)]"
                  initial={false}
                  animate={{ width: `${current.progressPct}%` }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </aside>

          {/* Scène principale du lecteur vidéo */}
          <div className="md:col-span-8 p-4 sm:p-5 lg:p-6 bg-transparent flex flex-col justify-between gap-4 min-w-0">
            {/* En-tête de la leçon active */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--home-orange-light)] mb-0.5">
                  {t("hero.apercu.badge")} · {current.num}
                </p>
                <p className="font-display font-semibold text-sm sm:text-base text-ice-white truncate">
                  {current.title}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                <span className="text-[var(--home-orange-light)] font-semibold">
                  {t("bento.badgeCreole")}
                </span>
                <span className="text-slate-600 dark:text-zinc-500" aria-hidden="true">
                  ·
                </span>
                <span className="text-slate-700 dark:text-zinc-300 tabular-nums font-medium">
                  {current.duration}
                </span>
              </div>
            </div>

            {/* Écran vidéo cinéma avec contraste sombre élégant */}
            <div className="aspect-video rounded-xl bg-gradient-to-br from-[#161A25] via-[#0F121A] to-[#080A0F] border border-slate-900/20 dark:border-white/[0.1] shadow-[0_18px_42px_-14px_rgba(17,19,24,0.45)] flex flex-col justify-between relative p-3.5 sm:p-5 overflow-hidden group/player">
              {/* Lueur orange focale discrète */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-80 group-hover/player:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle at 50% 44%, rgba(255, 91, 34, 0.24) 0%, rgba(255, 91, 34, 0.06) 36%, transparent 64%)",
                }}
                aria-hidden="true"
              />

              {/* Grille architecturale subtile du slide vidéo */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
                aria-hidden="true"
              />

              {/* Rangée supérieure du slide vidéo */}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.07] border border-white/[0.12] backdrop-blur-sm">
                  <MonitorPlay
                    className="w-3.5 h-3.5 text-[#FF885C]"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-200">
                    {current.num} · {current.tag}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/[0.08] font-mono text-[10px] text-zinc-300">
                  <Smartphone className="w-3 h-3 text-[#FF885C]" aria-hidden="true" />
                  <span>{t("bento.badgeMobile")}</span>
                </div>
              </div>

              {/* Bouton central Lecture / Pause + diapositive animée */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-2">
                <div className="relative flex items-center justify-center mb-3">
                  <span
                    className={`absolute w-20 h-20 rounded-full border border-[#FF5B22]/35 pointer-events-none ${
                      isPlaying ? "animate-ping-slow" : "opacity-60"
                    }`}
                    aria-hidden="true"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setIsPlaying((prev) => !prev)}
                    aria-label={isPlaying ? current.title : t("lecteur.lancerVideo")}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#FF7342] to-[#FF5B22] text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_32px_rgba(255,91,34,0.48)] ring-4 ring-[#FF5B22]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause
                        className="w-6 h-6 sm:w-7 sm:h-7 fill-current"
                        aria-hidden="true"
                      />
                    ) : (
                      <Play
                        className="w-6 h-6 sm:w-7 sm:h-7 translate-x-0.5 fill-current"
                        aria-hidden="true"
                      />
                    )}
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden sm:block"
                  >
                    <p className="font-display font-semibold text-sm text-white/95 tracking-tight max-w-sm truncate">
                      {current.cleanTitle}
                    </p>
                    <p className="font-sans text-xs text-zinc-400 mt-0.5 max-w-xs truncate">
                      {current.slideSubtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Barre de transport vidéo */}
              <div className="relative z-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 px-3 py-2.5 space-y-2">
                <div className="relative h-1.5 bg-white/15 rounded-full overflow-visible">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#E54813] to-[#FF885C] rounded-full relative"
                    initial={false}
                    animate={{ width: `${current.progressPct}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,91,34,0.9)] ring-2 ring-[#FF5B22]"
                      aria-hidden="true"
                    />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between gap-2 text-zinc-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((prev) => !prev)}
                      aria-label={isPlaying ? current.title : t("lecteur.lancerVideo")}
                      className="text-white hover:text-[#FF885C] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] rounded"
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSelectLesson((activeIdx + 1) % lessons.length)
                      }
                      aria-label={nextLesson.title}
                      className="text-zinc-300 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] rounded"
                    >
                      <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <Volume2
                      className="w-3.5 h-3.5 text-zinc-400 hidden sm:block shrink-0"
                      aria-hidden="true"
                    />

                    <span className="font-mono text-[11px] text-zinc-300 tabular-nums truncate">
                      {current.elapsed}{" "}
                      <span className="text-zinc-500">/ {current.duration}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setSpeedIdx((prev) => (prev + 1) % SPEEDS.length)
                      }
                      className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/15 border border-white/10 font-mono text-[10px] text-zinc-200 transition-colors cursor-pointer tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                    >
                      {SPEEDS[speedIdx]}
                    </button>
                    <Maximize2
                      className="w-3.5 h-3.5 text-zinc-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sélecteur compact mobile (<md) */}
            <div className="md:hidden grid grid-cols-3 gap-2">
              {lessons.map((lesson, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => handleSelectLesson(idx)}
                    aria-pressed={isActive}
                    className={`p-2 rounded-lg text-left border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] ${
                      isActive
                        ? "bg-[var(--surface-active)] border-[var(--home-orange-vivid)]/55 text-ice-white"
                        : "bg-[var(--surface-sidebar)] border-[var(--border-subtle)] text-slate-700 dark:text-zinc-400"
                    }`}
                  >
                    <span className="block font-mono text-[10px] font-semibold text-[var(--home-orange-light)] tabular-nums">
                      {lesson.num} · {lesson.duration}
                    </span>
                    <span className="block text-[11px] font-medium truncate mt-0.5">
                      {lesson.cleanTitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pied du lecteur */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)] text-xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-700 dark:text-zinc-400 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Check
                    className="w-3.5 h-3.5 text-[var(--home-orange-vivid)]"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <span>{t("bento.badgeCreole")}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check
                    className="w-3.5 h-3.5 text-[var(--home-orange-vivid)]"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <span>{t("bento.badgeMobile")}</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  <Check
                    className="w-3.5 h-3.5 text-[var(--home-orange-vivid)]"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <span>{t("bento.badgeRevoir")}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSelectLesson((activeIdx + 1) % lessons.length)
                }
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--home-orange-light)] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded"
              >
                <span>
                  {nextLesson.num}. {nextLesson.cleanTitle}
                </span>
                <SkipForward className="w-3 h-3 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroPreview;
