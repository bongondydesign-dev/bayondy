"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Lock,
  Maximize2,
  Minimize2,
  MonitorPlay,
  Pause,
  Play,
  SkipForward,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import { t } from "@/lib/i18n";
import {
  clampSeekSeconds,
  computeCourseOverallPct,
  computeLessonProgressPct,
  formatSecondsToTime,
  getPlaybackSpeedMultiplier,
  parseTimeToSeconds,
} from "@/lib/home/heroPreview";

interface PreviewLesson {
  id: number;
  num: string;
  title: string;
  cleanTitle: string;
  duration: string;
  durationSec: number;
  initialElapsedSec: number;
  tag: string;
  slideSubtitle: string;
}

const SPEEDS = ["1x", "1.25x", "1.5x"] as const;
const WAVEFORM_HEIGHTS = [38, 72, 54, 92, 64, 84, 46, 76, 58, 88, 44, 68];

function LessonStageVisual({
  lesson,
  isPlaying,
  lessonProgressPct,
  centerControl,
}: {
  lesson: PreviewLesson;
  isPlaying: boolean;
  lessonProgressPct: number;
  centerControl: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto px-1 sm:px-3 grid grid-cols-1 sm:grid-cols-12 items-center gap-3 sm:gap-4">
      {/* Left editorial focal composition (5 cols on >=sm) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`left-${lesson.id}`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 6 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="sm:col-span-5 text-center sm:text-left space-y-1.5 sm:space-y-2.5 pointer-events-none select-none order-2 sm:order-1"
          aria-hidden="true"
        >
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="font-mono text-2xl lg:text-3xl font-semibold tracking-tight text-[#FF7A47] tabular-nums leading-none">
              {lesson.num}
            </span>
            <span className="h-px flex-1 max-w-[36px] bg-gradient-to-r from-[#FF5B22]/75 to-transparent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300/80">
              {lesson.tag}
            </span>
          </div>

          <p className="font-display font-bold text-sm sm:text-lg lg:text-xl text-white tracking-tight leading-snug line-clamp-2">
            {lesson.cleanTitle}
          </p>

          <p className="hidden sm:block font-sans text-xs text-zinc-300/80 leading-relaxed line-clamp-2">
            {lesson.slideSubtitle}
          </p>

          {/* Animated voice/audio bars — active only while playing */}
          <div className="hidden sm:flex items-end gap-1 h-4 pt-1">
            {WAVEFORM_HEIGHTS.map((heightPct, i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-[#FF5B22] to-[#FFA07A]"
                initial={false}
                animate={
                  isPlaying
                    ? {
                        height: [
                          `${Math.max(24, heightPct * 0.45)}%`,
                          `${heightPct}%`,
                          `${Math.max(28, heightPct * 0.55)}%`,
                        ],
                        opacity: [0.55, 0.95, 0.65],
                      }
                    : {
                        height: `${Math.max(22, heightPct * 0.36)}%`,
                        opacity: 0.38,
                      }
                }
                transition={
                  isPlaying
                    ? {
                        duration: 0.9 + (i % 4) * 0.16,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: i * 0.05,
                      }
                    : { duration: 0.25 }
                }
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dedicated Center Play/Pause Ring (2 cols on >=sm, zero overlap) */}
      <div className="sm:col-span-2 flex items-center justify-center order-1 sm:order-2 py-1">
        {centerControl}
      </div>

      {/* Right architectural lesson preview card (5 cols on >=sm) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`right-${lesson.id}`}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="sm:col-span-5 hidden sm:flex justify-end pointer-events-none select-none order-3"
          aria-hidden="true"
        >
          {lesson.id === 0 && (
            <div className="w-full max-w-[225px] rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.13] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_34px_rgba(0,0,0,0.48)] space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-200">
                <span>{t("etapes.aprann.titre")}</span>
                <span className="text-[#FF885C] font-semibold tabular-nums">
                  {lessonProgressPct}%
                </span>
              </div>
              <div className="space-y-1.5 text-[10px] font-mono">
                <div className="flex items-center justify-between px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-zinc-200">
                  <span>01 · {t("etapes.aprann.titre")}</span>
                  <span className="text-[#FF885C]">●</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded-md bg-white/[0.025] text-zinc-400">
                  <span>02 · {t("etapes.kreye.titre")}</span>
                  <span>{t("hero.apercu.lecon2Duree")}</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#FF5B22]/25 border border-[#FF5B22]/50 inline-flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[#FF885C]" strokeWidth={2.6} />
                  </span>
                  <span className="font-mono text-[10px] text-zinc-300">
                    {t("bento.badgeCreole")}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                  {lesson.duration}
                </span>
              </div>
            </div>
          )}

          {lesson.id === 1 && (
            <div className="w-full max-w-[225px] rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.13] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_34px_rgba(0,0,0,0.48)] space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-200">
                <span>{t("etapes.kreye.titre")}</span>
                <Smartphone className="w-3 h-3 text-[#FF885C]" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="h-11 rounded-lg bg-[#FF5B22]/22 border border-[#FF5B22]/50 flex items-center justify-center font-mono text-[10px] text-[#FFA07A]">
                  01
                </div>
                <div className="h-11 rounded-lg bg-white/[0.07] border border-white/15 flex items-center justify-center font-mono text-[10px] text-zinc-200">
                  02
                </div>
                <div className="h-11 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center font-mono text-[10px] text-zinc-400">
                  03
                </div>
              </div>
              <div className="pt-1 border-t border-white/[0.08] flex items-center justify-between font-mono text-[10px] text-zinc-300 tabular-nums">
                <span>{t("bento.badgeMobile")}</span>
                <span className="text-[#FF885C] font-semibold">{lessonProgressPct}%</span>
              </div>
            </div>
          )}

          {lesson.id === 2 && (
            <div className="w-full max-w-[225px] rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.13] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_34px_rgba(0,0,0,0.48)] space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-200">
                <span>{t("etapes.avanse.titre")}</span>
                <span className="text-emerald-400 font-semibold tabular-nums">
                  {lessonProgressPct}%
                </span>
              </div>
              <svg viewBox="0 0 160 44" className="w-full h-9 overflow-visible">
                <defs>
                  <linearGradient id="heroSlideCurve" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E54813" />
                    <stop offset="100%" stopColor="#FF966E" />
                  </linearGradient>
                </defs>
                <path
                  d="M4 36 C 42 34, 58 18, 92 16 C 122 14, 134 6, 156 4"
                  fill="none"
                  stroke="url(#heroSlideCurve)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="156" cy="4" r="3.5" fill="#FFFFFF" stroke="#FF5B22" strokeWidth="2" />
              </svg>
              <div className="pt-1 border-t border-white/[0.08] flex items-center justify-between font-mono text-[10px] text-zinc-300 tabular-nums">
                <span>{t("bento.badgeRevoir")}</span>
                <span className="text-[#FF885C]">{lesson.duration}</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function HeroPreview() {
  const lessons: PreviewLesson[] = [
    {
      id: 0,
      num: "01",
      title: t("hero.apercu.lecon1"),
      cleanTitle: t("hero.apercu.lecon1").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon1Duree"),
      durationSec: parseTimeToSeconds(t("hero.apercu.lecon1Duree")) || 765,
      initialElapsedSec: 192, // 03:12
      tag: t("etapes.aprann.titre"),
      slideSubtitle: t("fonctionnalites.creole.titre"),
    },
    {
      id: 1,
      num: "02",
      title: t("hero.apercu.lecon2"),
      cleanTitle: t("hero.apercu.lecon2").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon2Duree"),
      durationSec: parseTimeToSeconds(t("hero.apercu.lecon2Duree")) || 1100,
      initialElapsedSec: 684, // 11:24
      tag: t("etapes.kreye.titre"),
      slideSubtitle: t("catalogue.atoutMobile"),
    },
    {
      id: 2,
      num: "03",
      title: t("hero.apercu.lecon3"),
      cleanTitle: t("hero.apercu.lecon3").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon3Duree"),
      durationSec: parseTimeToSeconds(t("hero.apercu.lecon3Duree")) || 1450,
      initialElapsedSec: 1450, // 24:10
      tag: t("etapes.avanse.titre"),
      slideSubtitle: t("catalogue.atoutRythme"),
    },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [elapsedByLesson, setElapsedByLesson] = useState<number[]>(() =>
    lessons.map((l) => l.initialElapsedSec)
  );
  const scrubberRef = useRef<HTMLDivElement>(null);

  const current = lessons[activeIdx];
  const nextLesson = lessons[(activeIdx + 1) % lessons.length];
  const currentElapsedSec = elapsedByLesson[activeIdx] ?? current.initialElapsedSec;
  const lessonProgressPct = computeLessonProgressPct(currentElapsedSec, current.durationSec);
  const courseOverallPct = computeCourseOverallPct(
    activeIdx,
    currentElapsedSec,
    current.durationSec,
    lessons.length
  );
  const totalCourseMinutes = Math.round(
    lessons.reduce((sum, l) => sum + l.durationSec, 0) / 60
  );

  // Real playback ticker when playing
  useEffect(() => {
    if (!isPlaying) return;
    const speedMultiplier = getPlaybackSpeedMultiplier(SPEEDS[speedIdx]);
    const intervalMs = Math.max(250, Math.round(1000 / speedMultiplier));
    const timer = window.setInterval(() => {
      setElapsedByLesson((prev) => {
        const next = [...prev];
        const curr = next[activeIdx] ?? 0;
        const max = lessons[activeIdx]?.durationSec ?? 765;
        next[activeIdx] = curr + 1 >= max ? 0 : curr + 1;
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, activeIdx, speedIdx]);

  const handleSelectLesson = (idx: number) => {
    setActiveIdx(idx);
    setIsPlaying(true);
  };

  const handleScrub = (clientX: number) => {
    const track = scrubberRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    const seekSec = clampSeekSeconds(ratio, current.durationSec);
    setElapsedByLesson((prev) => {
      const next = [...prev];
      next[activeIdx] = seekSec;
      return next;
    });
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" ? 15 : -15;
    setElapsedByLesson((prev) => {
      const next = [...prev];
      const target = Math.max(0, Math.min(current.durationSec, (next[activeIdx] ?? 0) + delta));
      next[activeIdx] = target;
      return next;
    });
  };

  return (
    <div className="mt-12 sm:mt-16 w-full max-w-5xl relative animate-hero-4">
      {/* Halo ambiant sobre ancré en haut de la fenêtre */}
      <div
        className="absolute -inset-8 -z-10 pointer-events-none opacity-45 dark:opacity-65"
        style={{
          background:
            "radial-gradient(ellipse 70% 46% at 50% 6%, var(--home-orange-glow) 0%, var(--home-orange-glow-soft) 48%, transparent 76%)",
        }}
        aria-hidden="true"
      />

      {/* Double-bezel studio glass shell (nested radius: 26px outer -> 6px padding -> 20px inner) */}
      <div className="p-1.5 sm:p-2 rounded-[26px] bg-slate-900/[0.035] dark:bg-white/[0.045] backdrop-blur-xl border border-slate-900/[0.12] dark:border-white/[0.12] shadow-[0_28px_72px_-20px_rgba(15,23,42,0.20),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_32px_84px_-22px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.09)]">
        <div className="rounded-[20px] bg-[var(--surface-browser)] border border-[var(--border-subtle)] dark:border-white/[0.09] overflow-hidden text-left">
          {/* Barre supérieure navigateur */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--surface-sidebar)]">
            <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400/80 dark:bg-white/15 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400/80 dark:bg-white/15 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400/80 dark:bg-white/15 inline-block" />
            </div>

            <div className="px-3.5 py-1 rounded-lg bg-deep-navy dark:bg-[#13161F] border border-[var(--border-subtle)] text-[11px] font-mono text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1.5 truncate max-w-[230px] sm:max-w-none shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none">
              <Lock
                className="w-3 h-3 text-[var(--home-orange-light)] shrink-0"
                strokeWidth={2.2}
                aria-hidden="true"
              />
              <span className="truncate">
                bayondy.com / {t("hero.apercu.badge")}
              </span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] text-slate-600 dark:text-zinc-400 shrink-0 tabular-nums">
              <MonitorPlay className="w-3.5 h-3.5 text-[var(--home-orange-vivid)]" aria-hidden="true" />
              <span className="font-semibold text-slate-800 dark:text-zinc-200">1080p HD</span>
              <span aria-hidden="true">·</span>
              <span>{t("bento.badgeCreole")}</span>
            </div>
          </div>

          {/* Corps unifié : Barre latérale + Scène vidéo cinéma */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Barre latérale gauche */}
            {!isTheater && (
              <aside className="hidden md:flex md:col-span-4 border-r border-[var(--border-subtle)] bg-[var(--surface-sidebar)] p-4 lg:p-5 flex-col justify-between gap-4 min-w-0">
                <div className="space-y-3.5">
                  {/* En-tête formation */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#FF6E38] to-[var(--home-orange)] text-[var(--home-orange-fg)] inline-flex items-center justify-center font-display font-bold text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_4px_12px_rgba(220,56,4,0.28)] shrink-0">
                        B
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm text-ice-white leading-tight truncate">
                          {t("accueil.titre")}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                          {t("bento.badgeCreole")}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[var(--home-orange-light)] tabular-nums shrink-0">
                      {current.num}/{String(lessons.length).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Titre de liste + durée totale */}
                  <div className="flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 dark:text-zinc-400 font-medium">
                    <span>{t("hero.apercu.listeTitre")}</span>
                    <span className="tabular-nums normal-case tracking-normal">
                      {lessons.length} · {totalCourseMinutes}m
                    </span>
                  </div>

                  {/* Liste interactive des 3 leçons */}
                  <div className="space-y-2.5">
                    {lessons.map((lesson, idx) => {
                      const isActive = idx === activeIdx;
                      const isCompleted = idx < activeIdx;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => handleSelectLesson(idx)}
                          aria-pressed={isActive}
                          className={`relative w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] cursor-pointer ${
                            isActive
                              ? "text-ice-white"
                              : "bg-white/95 dark:bg-[#12151E]/85 border border-[var(--border-subtle)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none text-slate-700 dark:text-zinc-300 hover:border-[var(--border-strong)] hover:text-ice-white dark:hover:bg-[#171B26]"
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="hero-lesson-active"
                              transition={{ type: "spring", stiffness: 420, damping: 32 }}
                              className="absolute inset-0 rounded-xl bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/55 shadow-[0_6px_18px_-8px_rgba(220,56,4,0.25),inset_0_1px_0_rgba(255,255,255,0.65)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                              aria-hidden="true"
                            />
                          )}

                          <span
                            className={`relative z-10 w-6 h-6 rounded-lg font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 tabular-nums transition-colors ${
                              isActive
                                ? "bg-[var(--home-orange)] text-[var(--home-orange-fg)] shadow-xs"
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

                          {isActive && isPlaying && (
                            <span
                              className="relative z-10 flex items-end gap-0.5 h-3 shrink-0"
                              aria-hidden="true"
                            >
                              {[0.55, 1, 0.7].map((scale, bIdx) => (
                                <motion.span
                                  key={bIdx}
                                  className="w-0.5 rounded-full bg-[var(--home-orange)]"
                                  animate={{ height: ["35%", `${scale * 100}%`, "40%"] }}
                                  transition={{
                                    duration: 0.75 + bIdx * 0.15,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                  }}
                                />
                              ))}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Carte de progression globale segmentée */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#11141C] border border-[var(--border-subtle)] shadow-[0_2px_6px_rgba(15,23,42,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-zinc-300 font-sans font-semibold">
                      {t("hero.apercu.progression")}
                    </span>
                    <span className="font-mono font-semibold text-[var(--home-orange-light)] tabular-nums">
                      {courseOverallPct}%
                    </span>
                  </div>

                  {/* Barre segmentée par leçon */}
                  <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
                    {lessons.map((lesson, idx) => {
                      const fillPct =
                        idx < activeIdx
                          ? 100
                          : idx === activeIdx
                            ? lessonProgressPct
                            : 0;
                      return (
                        <div
                          key={lesson.id}
                          className="h-1.5 rounded-full bg-[var(--track-muted)] overflow-hidden"
                        >
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--home-orange)] to-[var(--home-orange-vivid)]"
                            initial={false}
                            animate={{ width: `${fillPct}%` }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-zinc-400 tabular-nums">
                    <span>
                      {activeIdx + 1}/{lessons.length} {t("catalogue.lecons")}
                    </span>
                    <span>
                      {formatSecondsToTime(currentElapsedSec)} / {current.duration}
                    </span>
                  </div>
                </div>
              </aside>
            )}

            {/* Scène principale du lecteur vidéo */}
            <div
              className={`${
                isTheater ? "md:col-span-12" : "md:col-span-8"
              } p-4 sm:p-5 lg:p-6 bg-transparent flex flex-col justify-between gap-4 min-w-0`}
            >
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
              <div className="min-h-[248px] sm:min-h-0 sm:aspect-video rounded-xl bg-gradient-to-br from-[#161B28] via-[#0D1018] to-[#07090D] border border-slate-900/20 dark:border-white/[0.11] shadow-[0_20px_48px_-14px_rgba(15,23,42,0.5)] flex flex-col justify-between relative p-3.5 sm:p-5 overflow-clip group/player">
                {/* Lueur orange focale et anneaux architecturaux */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-85 group-hover/player:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 48%, rgba(255, 91, 34, 0.24) 0%, rgba(255, 91, 34, 0.06) 38%, transparent 66%)",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-white/[0.045] pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-[#FF5B22]/10 pointer-events-none"
                  aria-hidden="true"
                />

                {/* Rangée supérieure du slide vidéo */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-zinc-200">
                    <MonitorPlay
                      className="w-3.5 h-3.5 text-[#FF885C]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>
                      {current.num} · {current.tag}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-zinc-300/85">
                    <Smartphone className="w-3 h-3 text-[#FF885C]" aria-hidden="true" />
                    <span>{t("bento.badgeMobile")}</span>
                  </div>
                </div>

                {/* Scène centrale : grille 3 zones sans superposition (5-2-5) */}
                <div className="relative z-10 flex-1 flex items-center justify-center my-2 sm:my-1">
                  <LessonStageVisual
                    lesson={current}
                    isPlaying={isPlaying}
                    lessonProgressPct={lessonProgressPct}
                    centerControl={
                      <div className="relative flex items-center justify-center">
                        <span
                          className={`absolute w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-full border border-[#FF5B22]/40 pointer-events-none transition-transform duration-300 ${
                            isPlaying ? "scale-105 opacity-75" : "scale-100 opacity-70"
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className="absolute w-14 h-14 sm:w-[70px] sm:h-[70px] rounded-full bg-white/[0.08] backdrop-blur-md border border-white/25 pointer-events-none shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
                          aria-hidden="true"
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setIsPlaying((prev) => !prev)}
                          aria-label={isPlaying ? current.title : t("lecteur.lancerVideo")}
                          className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#FF7847] to-[#FF5B22] text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.42),0_12px_30px_rgba(255,91,34,0.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] cursor-pointer"
                        >
                          {isPlaying ? (
                            <Pause
                              className="w-5 h-5 sm:w-6 sm:h-6 fill-current"
                              aria-hidden="true"
                            />
                          ) : (
                            <Play
                              className="w-5 h-5 sm:w-6 sm:h-6 translate-x-0.5 fill-current"
                              aria-hidden="true"
                            />
                          )}
                        </motion.button>
                      </div>
                    }
                  />
                </div>

                {/* Barre de transport verre dépoli interactive */}
                <div className="relative z-10 rounded-xl bg-black/65 backdrop-blur-xl border border-white/[0.13] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_28px_rgba(0,0,0,0.45)] px-3.5 py-2.5 space-y-2">
                  {/* Curseur interactif */}
                  <div
                    ref={scrubberRef}
                    role="slider"
                    tabIndex={0}
                    aria-label={t("hero.apercu.progression")}
                    aria-valuemin={0}
                    aria-valuemax={current.durationSec}
                    aria-valuenow={currentElapsedSec}
                    onClick={(e) => handleScrub(e.clientX)}
                    onKeyDown={handleSliderKeyDown}
                    className="group/scrub relative py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] rounded"
                  >
                    <div className="relative h-1.5 bg-white/15 rounded-full overflow-visible">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#E54813] via-[#FF5B22] to-[#FF9269] rounded-full relative"
                        initial={false}
                        animate={{ width: `${lessonProgressPct}%` }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 group-hover/scrub:scale-125 transition-transform rounded-full bg-white shadow-[0_0_10px_rgba(255,91,34,0.95)] ring-2 ring-[#FF5B22]"
                          aria-hidden="true"
                        />
                      </motion.div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-zinc-200">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setIsPlaying((prev) => !prev)}
                        aria-label={isPlaying ? current.title : t("lecteur.lancerVideo")}
                        className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-white hover:bg-white/10 hover:text-[#FF885C] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
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
                        className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                      >
                        <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMuted((prev) => !prev)}
                        aria-label={isMuted ? "Son active" : "Koupe son"}
                        aria-pressed={isMuted}
                        className="hidden sm:inline-flex w-7 h-7 rounded-lg items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                      >
                        {isMuted ? (
                          <VolumeX className="w-3.5 h-3.5 text-[#FF885C]" aria-hidden="true" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>

                      <span className="font-mono text-[11px] text-zinc-200 tabular-nums truncate">
                        {formatSecondsToTime(currentElapsedSec)}{" "}
                        <span className="text-zinc-500">/ {current.duration}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setSpeedIdx((prev) => (prev + 1) % SPEEDS.length)
                        }
                        aria-label={`Vitès lekti ${SPEEDS[speedIdx]}`}
                        className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/18 border border-white/12 font-mono text-[10px] font-medium text-zinc-100 transition-colors cursor-pointer tabular-nums whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                      >
                        {SPEEDS[speedIdx]}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsTheater((prev) => !prev)}
                        aria-label={isTheater ? "Afiche lis leson yo" : "Elaji lektè a"}
                        aria-pressed={isTheater}
                        className="hidden md:inline-flex w-7 h-7 rounded-lg items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                      >
                        {isTheater ? (
                          <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </button>
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
                      className={`p-2.5 rounded-xl text-left border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] ${
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
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[var(--border-subtle)] text-xs">
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
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--home-orange-light)] hover:underline cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded"
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
    </div>
  );
}

export default HeroPreview;
