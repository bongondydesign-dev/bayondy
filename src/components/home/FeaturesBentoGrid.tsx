"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Clock,
  LockOpen,
  Pause,
  Play,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import {
  computeMilestoneProgressPct,
  computeOrbitalAngle,
  computeProgressArcOffset,
  formatStreamClock,
} from "@/lib/home/featuresBento";

const RING_CIRCUMFERENCE = 251.33;
const MOBILE_WAVEFORM_HEIGHTS = [35, 78, 52, 90, 62, 84, 48, 70];
const DIAL_TICKS = Array.from({ length: 24 }, (_, idx) => idx * 15);

export function FeaturesBentoGrid() {
  const milestones = [
    {
      num: t("etapes.aprann.numero"),
      label: t("etapes.aprann.titre"),
      desc: t("etapes.aprann.description"),
      lessonTitle: t("hero.apercu.lecon1").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon1Duree"),
      svgX: 56,
      svgY: 98,
    },
    {
      num: t("etapes.kreye.numero"),
      label: t("etapes.kreye.titre"),
      desc: t("etapes.kreye.description"),
      lessonTitle: t("hero.apercu.lecon2").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon2Duree"),
      svgX: 284,
      svgY: 62,
    },
    {
      num: t("etapes.avanse.numero"),
      label: t("etapes.avanse.titre"),
      desc: t("etapes.avanse.description"),
      lessonTitle: t("hero.apercu.lecon3").replace(/^\d+\.\s*/, ""),
      duration: t("hero.apercu.lecon3Duree"),
      svgX: 512,
      svgY: 24,
    },
  ];

  // Interactive states per bento showcase card
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState(2);
  const [activeUnlockedIdx, setActiveUnlockedIdx] = useState(0);
  const [progressCheckpointIdx, setProgressCheckpointIdx] = useState(2);
  const [mobilePlaying, setMobilePlaying] = useState(false);
  const [mobileElapsedSec, setMobileElapsedSec] = useState(258); // 04:18
  const [mobileQuality, setMobileQuality] = useState<"1080p" | "480p">("1080p");
  const [replayIdx, setReplayIdx] = useState(0);
  const [currency, setCurrency] = useState<"HTG" | "USD">("HTG");

  useEffect(() => {
    if (!mobilePlaying) return;
    const timer = window.setInterval(() => {
      setMobileElapsedSec((prev) => (prev + 1 >= 765 ? 0 : prev + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mobilePlaying]);

  const activeMilestone = milestones[activeMilestoneIdx];
  const progressPct = computeMilestoneProgressPct(
    progressCheckpointIdx,
    milestones.length
  );
  const progressArcOffset = computeProgressArcOffset(
    progressPct,
    RING_CIRCUMFERENCE
  );
  const orbitalAngle = computeOrbitalAngle(replayIdx, milestones.length);
  const activeReplayLesson = milestones[replayIdx];

  return (
    <RevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* ── Carte 1 (col-span-2) : Leson an kreyòl — Parcours & Courbe interactive ── */}
      <RevealItem className="md:col-span-2 flex">
        <article className="group w-full rounded-[24px] p-1.5 bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-900/[0.11] dark:border-white/[0.10] hover:border-[var(--home-orange-vivid)]/55 transition-colors duration-200 flex min-w-0">
          <div className="w-full rounded-[18px] surface-glass border border-[var(--border-subtle)] p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden min-w-0">
            <div
              className="absolute -top-24 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-45 dark:opacity-55 group-hover:opacity-80 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle, var(--home-orange-glow-soft) 0%, transparent 68%)",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 pb-5 mb-5 border-b border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <div>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/60 block mb-1">
                    {t("fonctionnalites.creole.titre")}
                  </span>
                  <span className="font-display font-bold text-3xl sm:text-4xl text-ice-white tracking-tight tabular-nums">
                    {t("bento.badgeCreole")}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-slate-700 dark:text-ice-white/70">
                  <span className="text-[var(--home-orange-light)] font-semibold">
                    {t("catalogue.langues.ht")}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">01 — 03</span>
                </div>
              </div>

              {/* Courbe ascendante avec nœud actif piloté par l'étape sélectionnée */}
              <div className="relative">
                <svg
                  viewBox="0 0 560 120"
                  className="w-full h-24 sm:h-28 overflow-visible"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="bento-curve-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--home-orange-vivid)"
                        stopOpacity="0.28"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--home-orange-vivid)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                    <linearGradient id="bento-curve-stroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--home-orange-dark)" />
                      <stop offset="55%" stopColor="var(--home-orange-vivid)" />
                      <stop offset="100%" stopColor="var(--home-orange-vivid)" />
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
                    y1="104"
                    x2="560"
                    y2="104"
                    stroke="var(--surface-grid-line)"
                  />

                  {milestones.map((m, idx) => (
                    <line
                      key={m.num}
                      x1={m.svgX}
                      y1={m.svgY}
                      x2={m.svgX}
                      y2="108"
                      stroke={
                        idx === activeMilestoneIdx
                          ? "var(--home-orange)"
                          : "var(--border-strong)"
                      }
                      strokeOpacity={idx === activeMilestoneIdx ? 0.65 : 0.45}
                      strokeWidth={idx === activeMilestoneIdx ? 1.5 : 1}
                    />
                  ))}

                  <path
                    d="M 16 102 C 30 101, 42 100, 56 98 C 130 88, 210 74, 284 62 C 365 49, 448 34, 512 24 L 512 104 L 16 104 Z"
                    fill="url(#bento-curve-fill)"
                  />

                  <path
                    d="M 16 102 C 30 101, 42 100, 56 98 C 130 88, 210 74, 284 62 C 365 49, 448 34, 512 24"
                    fill="none"
                    stroke="url(#bento-curve-stroke)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="bento-curve-draw"
                  />

                  {milestones.map((m, idx) => {
                    const isSelected = idx === activeMilestoneIdx;
                    return (
                      <g key={m.num}>
                        {isSelected && (
                          <circle
                            cx={m.svgX}
                            cy={m.svgY}
                            r="10"
                            fill="var(--home-orange-glow-soft)"
                            stroke="var(--home-orange-vivid)"
                            strokeWidth="1.25"
                          />
                        )}
                        <circle
                          cx={m.svgX}
                          cy={m.svgY}
                          r={isSelected ? "4.75" : "4"}
                          fill={
                            isSelected
                              ? "var(--home-orange-vivid)"
                              : "var(--deep-navy)"
                          }
                          stroke={
                            isSelected
                              ? "var(--home-orange-vivid)"
                              : "var(--border-strong)"
                          }
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Sélecteur interactif 3 étapes */}
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {milestones.map((m, idx) => {
                    const isSelected = idx === activeMilestoneIdx;
                    return (
                      <button
                        key={m.num}
                        type="button"
                        onClick={() => setActiveMilestoneIdx(idx)}
                        aria-pressed={isSelected}
                        className={`min-h-[40px] px-2.5 py-2 rounded-xl border text-left flex items-center justify-between gap-1.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] ${
                          isSelected
                            ? "bg-[var(--surface-active)] border-[var(--home-orange-vivid)]/55 text-ice-white shadow-[0_2px_10px_-4px_rgba(220,56,4,0.22)]"
                            : "bg-[var(--surface-well)]/75 border-[var(--border-subtle)] text-slate-700 dark:text-zinc-400 hover:border-[var(--border-strong)] hover:text-ice-white"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5 min-w-0 font-mono text-[11px]">
                          <span className="text-[var(--home-orange-light)] font-semibold tabular-nums shrink-0">
                            {m.num}
                          </span>
                          <span className="truncate font-medium">{m.label}</span>
                        </span>
                        <span className="hidden sm:inline font-mono text-[10px] text-slate-600 dark:text-zinc-400 tabular-nums shrink-0">
                          {m.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Aperçu contextuel de l'étape active */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMilestone.num}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-3 px-3.5 py-2.5 rounded-xl bg-[var(--surface-sidebar)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-semibold text-ice-white truncate">
                        {activeMilestone.num}. {activeMilestone.lessonTitle}
                      </p>
                      <p className="font-sans text-[11px] text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                        {activeMilestone.desc}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-[var(--home-orange-light)] tabular-nums whitespace-nowrap shrink-0">
                      {activeMilestone.duration}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-1.5">
                {t("fonctionnalites.creole.titre")}
              </h3>
              <p className="text-sm text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed max-w-xl">
                {t("fonctionnalites.creole.description")}
              </p>
            </div>
          </div>
        </article>
      </RevealItem>

      {/* ── Carte 2 (row-span-2) : Aksè otomatik — Ancre Studio Obsidienne ── */}
      <RevealItem className="md:col-span-1 md:row-span-2 flex">
        <article className="group w-full rounded-[24px] p-1.5 bg-slate-900/[0.04] dark:bg-white/[0.04] border border-slate-900/[0.13] dark:border-white/[0.11] hover:border-[#FF5B22]/55 transition-colors duration-200 flex min-w-0">
          <div className="w-full rounded-[18px] surface-contrast border border-white/[0.11] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden min-w-0">
            <div
              className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full pointer-events-none opacity-65 group-hover:opacity-90 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 91, 34, 0.24) 0%, transparent 68%)",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-white/10">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-300">
                  MonCash → {t("bento.badgeAcces")}
                </span>
                <LockOpen
                  className="w-4 h-4 text-[#FF885C] shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              {/* Pipeline de validation et déblocage immédiat */}
              <div className="relative pl-8 space-y-5">
                <span
                  className="absolute left-[11px] top-3 h-[108px] w-px bg-gradient-to-b from-emerald-400/70 via-[#FF5B22]/75 to-white/20"
                  aria-hidden="true"
                />

                <div className="relative">
                  <span
                    className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-[#1B1F2A] border border-emerald-400/55 text-emerald-400 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3" strokeWidth={2.6} />
                  </span>
                  <p className="font-sans text-sm font-semibold text-white leading-snug">
                    {t("paiement.reussi")}
                  </p>
                  <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                    MonCash · {t("tarifs.statutDisponible")}
                  </p>
                </div>

                <div className="relative">
                  <span
                    className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-[#FF5B22] text-white flex items-center justify-center shadow-[0_0_18px_rgba(255,91,34,0.55)]"
                    aria-hidden="true"
                  >
                    <LockOpen className="w-3 h-3" strokeWidth={2.4} />
                  </span>
                  <p className="font-sans text-sm font-semibold text-white leading-snug">
                    {t("fonctionnalites.acces.titre")}
                  </p>
                  <p className="font-mono text-[11px] text-[#FF885C] mt-0.5">
                    {t("bento.badgeAcces")}
                  </p>
                </div>

                <div className="relative">
                  <span
                    className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-[#1B1F2A] border border-white/20 text-[#FF885C] flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Play className="w-2.5 h-2.5 translate-x-[1px] fill-current" />
                  </span>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400 leading-6">
                    {t("hero.apercu.listeTitre")}
                  </p>
                </div>
              </div>

              {/* Liste interactive des 3 leçons débloquées */}
              <div className="mt-5 space-y-2">
                {milestones.map((lesson, idx) => {
                  const isActive = idx === activeUnlockedIdx;
                  return (
                    <button
                      key={lesson.num}
                      type="button"
                      onClick={() => setActiveUnlockedIdx(idx)}
                      aria-pressed={isActive}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] ${
                        isActive
                          ? "bg-[#FF5B22]/15 border-[#FF5B22]/55 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:bg-white/[0.06] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 tabular-nums ${
                            isActive
                              ? "bg-[#FF5B22] text-white"
                              : "bg-white/[0.07] text-[#FF885C]"
                          }`}
                        >
                          {lesson.num}
                        </span>
                        <span className="font-sans text-xs font-medium truncate">
                          {lesson.lessonTitle}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400 tabular-nums shrink-0">
                        {lesson.duration}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Barre de confirmation d'accès sur la leçon active */}
              <div className="mt-4 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.09] space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-300 truncate">
                    {milestones[activeUnlockedIdx].num}.{" "}
                    {milestones[activeUnlockedIdx].lessonTitle}
                  </span>
                  <span className="text-emerald-400 font-semibold whitespace-nowrap shrink-0">
                    {t("bento.badgeAcces")}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#E54813] to-[#FF885C]"
                    initial={false}
                    animate={{
                      width: `${computeMilestoneProgressPct(
                        activeUnlockedIdx,
                        milestones.length
                      )}%`,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="pt-2 border-t border-white/[0.07] flex items-center justify-between gap-2 font-mono text-[10px] text-zinc-400 tabular-nums">
                  <span>
                    {milestones.length} {t("catalogue.lecons")} · {t("bento.badgeCreole")}
                  </span>
                  <span className="text-[#FF885C]">{t("bento.badgeRevoir")}</span>
                </div>
              </div>

              {/* Atouts d'accès inclus */}
              <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-[#FF885C] shrink-0" strokeWidth={2.4} aria-hidden="true" />
                    <span>{t("bento.badgeMobile")}</span>
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 tabular-nums">1080p HD</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-zinc-300">
                    <Check className="w-3.5 h-3.5 text-[#FF885C] shrink-0" strokeWidth={2.4} aria-hidden="true" />
                    <span>{t("bento.badgeRevoir")}</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">{t("tarifs.statutDisponible")}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-5 mt-5 border-t border-white/10">
              <h3 className="font-display font-semibold text-lg sm:text-xl text-white mb-1.5">
                {t("fonctionnalites.acces.titre")}
              </h3>
              <p className="text-sm text-zinc-300 font-sans leading-relaxed">
                {t("fonctionnalites.acces.description")}
              </p>
            </div>
          </div>
        </article>
      </RevealItem>

      {/* ── Carte 3 : Swiv pwogrè w — Jauge de précision interactive ──────── */}
      <RevealItem className="md:col-span-1 flex">
        <article className="group w-full rounded-[24px] p-1.5 bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-900/[0.11] dark:border-white/[0.10] hover:border-[var(--home-orange-vivid)]/55 transition-colors duration-200 flex min-w-0">
          <div className="w-full rounded-[18px] surface-glass border border-[var(--border-subtle)] p-5 sm:p-6 flex flex-col justify-between min-w-0">
            <div className="py-1 flex flex-col items-center justify-center gap-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div
                  className="absolute inset-2 rounded-full pointer-events-none opacity-45 dark:opacity-65 group-hover:opacity-100 transition-opacity duration-300"
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
                    <linearGradient
                      id="bento-ring-gradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="var(--home-orange-dark)" />
                      <stop offset="55%" stopColor="var(--home-orange-vivid)" />
                      <stop offset="100%" stopColor="var(--home-orange-vivid)" />
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
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="40"
                    fill="none"
                    stroke="url(#bento-ring-gradient)"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    initial={false}
                    animate={{ strokeDashoffset: progressArcOffset }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-2xl text-ice-white tabular-nums tracking-tight">
                    {progressPct}%
                  </span>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--home-orange-light)] mt-0.5">
                    {t("bento.badgeProgression")}
                  </span>
                </div>
              </div>

              {/* Sélecteur d'étapes 01 · 02 · 03 */}
              <div className="w-full max-w-[224px] space-y-2">
                <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
                  {milestones.map((m, idx) => (
                    <span
                      key={m.num}
                      className={`h-1.5 rounded-full transition-colors duration-200 ${
                        idx <= progressCheckpointIdx
                          ? "bg-gradient-to-r from-[var(--home-orange)] to-[var(--home-orange-vivid)]"
                          : "bg-[var(--track-muted)]"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {milestones.map((m, idx) => {
                    const isSelected = idx === progressCheckpointIdx;
                    return (
                      <button
                        key={m.num}
                        type="button"
                        onClick={() => setProgressCheckpointIdx(idx)}
                        aria-pressed={isSelected}
                        aria-label={`${t("hero.apercu.progression")} ${m.num}`}
                        className={`min-h-[34px] py-1 rounded-lg font-mono text-[11px] tabular-nums transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] ${
                          isSelected
                            ? "bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/50 text-[var(--home-orange-light)] font-semibold"
                            : "bg-[var(--surface-well)]/70 border border-transparent text-slate-600 dark:text-zinc-400 hover:text-ice-white"
                        }`}
                      >
                        {m.num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
              <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                {t("fonctionnalites.progression.titre")}
              </h3>
              <p className="text-sm text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed">
                {t("fonctionnalites.progression.description")}
              </p>
            </div>
          </div>
        </article>
      </RevealItem>

      {/* ── Carte 4 : Fèt pou telefòn — Écran mobile interactif ───────────── */}
      <RevealItem className="md:col-span-1 flex">
        <article className="group w-full rounded-[24px] p-1.5 bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-900/[0.11] dark:border-white/[0.10] hover:border-[var(--home-orange-vivid)]/55 transition-colors duration-200 flex min-w-0">
          <div className="w-full rounded-[18px] surface-glass border border-[var(--border-subtle)] p-5 sm:p-6 flex flex-col justify-between min-w-0">
            <div className="py-1 flex justify-center">
              <div className="w-full max-w-[236px] rounded-[20px] bg-gradient-to-b from-[#171B26] to-[#0B0D13] border border-slate-900/25 dark:border-white/[0.14] p-3.5 text-white shadow-[0_16px_32px_-14px_rgba(17,19,24,0.5)] relative overflow-hidden">
                <div
                  className="absolute inset-0 pointer-events-none opacity-65"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 45%, rgba(255,91,34,0.2) 0%, transparent 64%)",
                  }}
                  aria-hidden="true"
                />

                {/* Top notch bar & network quality switch */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-zinc-300 mb-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Smartphone
                      className="w-3 h-3 text-[#FF885C]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    <span>{t("bento.badgeMobile")}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setMobileQuality((q) => (q === "1080p" ? "480p" : "1080p"))
                    }
                    aria-label={mobileQuality}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.09] hover:bg-white/[0.16] border border-white/10 text-[10px] font-mono text-zinc-100 cursor-pointer tabular-nums whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                  >
                    <span>{mobileQuality}</span>
                    <span className="inline-flex items-end gap-0.5 h-2.5" aria-hidden="true">
                      <span className="w-0.5 h-1 rounded-xs bg-[#FF885C]" />
                      <span className="w-0.5 h-1.5 rounded-xs bg-[#FF885C]" />
                      <span
                        className={`w-0.5 h-2.5 rounded-xs ${
                          mobileQuality === "1080p" ? "bg-[#FF885C]" : "bg-white/30"
                        }`}
                      />
                    </span>
                  </button>
                </div>

                {/* Lecture mobile interactive */}
                <div className="relative z-10 py-3.5 flex flex-col items-center justify-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span
                      className={`absolute w-14 h-14 rounded-full border border-[#FF5B22]/40 pointer-events-none transition-transform duration-300 ${
                        mobilePlaying ? "scale-110 opacity-85" : "scale-100 opacity-65"
                      }`}
                      aria-hidden="true"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setMobilePlaying((p) => !p)}
                      aria-label={
                        mobilePlaying
                          ? t("hero.apercu.lecon1")
                          : t("lecteur.lancerVideo")
                      }
                      className="relative w-11 h-11 rounded-full bg-gradient-to-b from-[#FF7847] to-[#FF5B22] text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_20px_rgba(255,91,34,0.48)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                    >
                      {mobilePlaying ? (
                        <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                      ) : (
                        <Play
                          className="w-4 h-4 translate-x-0.5 fill-current"
                          aria-hidden="true"
                        />
                      )}
                    </motion.button>
                  </div>

                  {/* Mini waveform */}
                  <div className="flex items-end gap-1 h-3" aria-hidden="true">
                    {MOBILE_WAVEFORM_HEIGHTS.map((h, i) => (
                      <motion.span
                        key={i}
                        className="w-0.5 rounded-full bg-gradient-to-t from-[#FF5B22] to-[#FFA07A]"
                        initial={false}
                        animate={
                          mobilePlaying
                            ? {
                                height: [
                                  `${Math.max(25, h * 0.45)}%`,
                                  `${h}%`,
                                  `${Math.max(30, h * 0.55)}%`,
                                ],
                                opacity: [0.6, 1, 0.65],
                              }
                            : { height: `${Math.max(24, h * 0.35)}%`, opacity: 0.4 }
                        }
                        transition={
                          mobilePlaying
                            ? {
                                duration: 0.8 + (i % 3) * 0.16,
                                repeat: Infinity,
                                repeatType: "reverse",
                              }
                            : { duration: 0.2 }
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative z-10 mt-1 space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E54813] to-[#FF885C] transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((mobileElapsedSec / 765) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-300 tabular-nums">
                    <span>{formatStreamClock(mobileElapsedSec)}</span>
                    <span className="text-zinc-400">
                      {t("hero.apercu.lecon1Duree")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
              <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                {t("fonctionnalites.mobile.titre")}
              </h3>
              <p className="text-sm text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed">
                {t("fonctionnalites.mobile.description")}
              </p>
            </div>
          </div>
        </article>
      </RevealItem>

      {/* ── Carte 5 : Gade yo tout tan — Cadran orbital interactif ──────────── */}
      <RevealItem className="md:col-span-1 flex">
        <article className="group w-full rounded-[24px] p-1.5 bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-900/[0.11] dark:border-white/[0.10] hover:border-[var(--home-orange-vivid)]/55 transition-colors duration-200 flex min-w-0">
          <div className="w-full rounded-[18px] surface-glass border border-[var(--border-subtle)] p-5 sm:p-6 flex flex-col justify-between min-w-0">
            <div className="py-1 flex flex-col items-center justify-center gap-3.5">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
                  <defs>
                    <linearGradient id="bento-orbit-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--home-orange-vivid)"
                        stopOpacity="0.95"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--home-orange-vivid)"
                        stopOpacity="0.22"
                      />
                    </linearGradient>
                  </defs>

                  {DIAL_TICKS.map((deg) => (
                    <line
                      key={deg}
                      x1="60"
                      y1="7"
                      x2="60"
                      y2={deg % 90 === 0 ? "12" : "10"}
                      stroke={
                        deg % 90 === 0
                          ? "var(--home-orange-light)"
                          : "var(--border-strong)"
                      }
                      strokeWidth={deg % 90 === 0 ? "1.5" : "1"}
                      transform={`rotate(${deg} 60 60)`}
                    />
                  ))}

                  <circle
                    cx="60"
                    cy="60"
                    r="38"
                    fill="none"
                    stroke="url(#bento-orbit-grad)"
                    strokeWidth="2.2"
                  />

                  <motion.g
                    initial={false}
                    animate={{ rotate: orbitalAngle }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    style={{ originX: "60px", originY: "60px" }}
                  >
                    <circle
                      cx="60"
                      cy="22"
                      r="4"
                      fill="var(--home-orange-vivid)"
                      stroke="var(--deep-navy)"
                      strokeWidth="1.5"
                    />
                  </motion.g>
                </svg>

                <button
                  type="button"
                  onClick={() =>
                    setReplayIdx((prev) => (prev + 1) % milestones.length)
                  }
                  aria-label={`${t("fonctionnalites.revoir.titre")} — ${activeReplayLesson.num}`}
                  className="absolute w-12 h-12 rounded-full bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/50 flex items-center justify-center text-[var(--home-orange-vivid)] dark:text-[var(--home-orange-light)] shadow-[0_6px_18px_-4px_var(--home-orange-glow)] hover:scale-105 transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)]"
                >
                  <RefreshCw
                    className="w-5 h-5 transition-transform duration-300"
                    style={{ transform: `rotate(${orbitalAngle}deg)` }}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div className="w-full max-w-[224px] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {milestones.map((m, idx) => {
                    const isSelected = idx === replayIdx;
                    return (
                      <button
                        key={m.num}
                        type="button"
                        onClick={() => setReplayIdx(idx)}
                        aria-pressed={isSelected}
                        className={`min-h-[32px] px-2 rounded-lg font-mono text-[11px] tabular-nums transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] ${
                          isSelected
                            ? "bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/50 text-[var(--home-orange-light)] font-semibold"
                            : "text-slate-600 dark:text-zinc-400 hover:text-ice-white"
                        }`}
                      >
                        {m.num}
                      </button>
                    );
                  })}
                </div>
                <span className="font-mono text-[11px] text-[var(--home-orange-light)] font-semibold tabular-nums whitespace-nowrap shrink-0">
                  {activeReplayLesson.duration} · {t("bento.badgeRevoir")}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
              <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                {t("fonctionnalites.revoir.titre")}
              </h3>
              <p className="text-sm text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed">
                {t("fonctionnalites.revoir.description")}
              </p>
            </div>
          </div>
        </article>
      </RevealItem>

      {/* ── Carte 6 (col-span-2) : Peman lokal fasil — Sélecteur HTG / USD ── */}
      <RevealItem className="md:col-span-2 flex">
        <article className="group w-full rounded-[24px] p-1.5 bg-slate-900/[0.03] dark:bg-white/[0.03] border border-slate-900/[0.11] dark:border-white/[0.10] hover:border-[var(--home-orange-vivid)]/55 transition-colors duration-200 flex min-w-0">
          <div className="w-full rounded-[18px] surface-glass border border-[var(--border-subtle)] p-5 sm:p-7 flex flex-col justify-between min-w-0">
            <div className="space-y-4 pb-5 mb-5 border-b border-[var(--border-subtle)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-ice-white/65">
                  <span className="uppercase tracking-[0.14em] font-medium">
                    {t("tarifs.moyensTitre").replace(/\s*:\s*$/, "")}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[var(--home-orange-light)] font-semibold">
                    {t("bento.badgePaiement")}
                  </span>
                </div>

                {/* Sélecteur segmenté réel HTG / USD */}
                <div
                  className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)]"
                  role="group"
                  aria-label="HTG / USD"
                >
                  {(["HTG", "USD"] as const).map((unit) => {
                    const isSelected = currency === unit;
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setCurrency(unit)}
                        aria-pressed={isSelected}
                        className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] ${
                          isSelected
                            ? "bg-white dark:bg-[#1A1F2B] text-ice-white shadow-xs border border-[var(--border-subtle)]"
                            : "text-slate-600 dark:text-zinc-400 hover:text-ice-white"
                        }`}
                      >
                        {unit}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MonCash — Disponible */}
                <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/55 shadow-[0_6px_18px_-8px_rgba(220,56,4,0.22),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-600/35 text-emerald-700 dark:text-emerald-400 inline-flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-base text-ice-white truncate">
                        MonCash
                      </p>
                      <p className="font-mono text-[11px] font-medium text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
                        {t("tarifs.statutDisponible")} · {t("bento.badgeAcces")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-semibold text-[var(--home-orange-light)] tabular-nums">
                      {currency}
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-[var(--home-orange-light)]"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* NatCash — À venir */}
                <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-white dark:bg-deep-navy border border-[var(--border-subtle)] text-slate-700 dark:text-zinc-400 shadow-2xs dark:shadow-none inline-flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-medium text-base text-ice-white truncate">
                        NatCash
                      </p>
                      <p className="font-mono text-[11px] text-slate-600 dark:text-zinc-400 truncate mt-0.5">
                        {t("tarifs.statutAvenir")}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-500 tabular-nums shrink-0">
                    {currency}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-600 dark:text-ice-white/60">
                <span>
                  {t("paiement.reussi")} → {t("fonctionnalites.acces.titre")}
                </span>
                <span className="text-ice-white font-semibold tabular-nums">
                  {currency} · {t("bento.badgeAcces")}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-1.5">
                {t("fonctionnalites.paiement.titre")}
              </h3>
              <p className="text-sm text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed max-w-xl">
                {t("fonctionnalites.paiement.description")}
              </p>
            </div>
          </div>
        </article>
      </RevealItem>
    </RevealStagger>
  );
}
