"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Play, PlayCircle } from "lucide-react";
import type { PublicPreviewLesson } from "@/types/firestore";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { formatDuration } from "@/lib/courses/format";
import { SITE_NAME } from "@/lib/site";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface CoursePreviewPlayerProps {
  courseTitle: string;
  coverUrl: string | null;
  previewLessons: PublicPreviewLesson[];
}

export function CoursePreviewPlayer({
  courseTitle,
  coverUrl,
  previewLessons,
}: CoursePreviewPlayerProps) {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState<string>(
    previewLessons[0]?.id ?? ""
  );

  const activeIndex = useMemo(() => {
    if (previewLessons.length === 0) return -1;
    const idx = previewLessons.findIndex((l) => l.id === activeId);
    return idx >= 0 ? idx : 0;
  }, [previewLessons, activeId]);

  const activeLesson =
    activeIndex >= 0 ? previewLessons[activeIndex] : undefined;
  const nextLesson =
    activeIndex >= 0 && activeIndex < previewLessons.length - 1
      ? previewLessons[activeIndex + 1]
      : undefined;

  if (!activeLesson) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[var(--surface-well)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={courseTitle}
            fill
            priority
            referrerPolicy="no-referrer"
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-well)]">
            <div
              className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-85"
              style={{
                background:
                  "radial-gradient(circle at 80% 20%, var(--brand-glow) 0%, var(--brand-glow-soft) 45%, transparent 72%)",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-noise opacity-35 dark:opacity-50"
              aria-hidden="true"
            />
            <PortalSymbol size={80} className="relative z-10 opacity-90" />
            <span className="relative z-10 mt-4 font-mono text-xs tracking-wider text-slate-600 dark:text-slate-300/60">
              {SITE_NAME}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <VideoPlayer
        key={activeLesson.id}
        lessonTitle={activeLesson.title}
        youtubeVideoId={activeLesson.youtubeVideoId}
        videoProvider={activeLesson.videoProvider}
        videoId={activeLesson.videoId}
        videoUrl={activeLesson.videoUrl}
        durationMinutes={activeLesson.durationMinutes}
        posterImageUrl={coverUrl}
        badgeLabel={t("lecteur.apercuGratuitBadge")}
        nextLessonTitle={nextLesson?.title}
        onNextLesson={
          nextLesson ? () => setActiveId(nextLesson.id) : undefined
        }
      />

      {/* Sélecteur des leçons en aperçu gratuit */}
      <div className="p-4 sm:p-5 rounded-2xl surface-glass border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <PlayCircle className="w-4 h-4 text-brand-light shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs uppercase tracking-wider text-brand-light font-semibold truncate">
              {t("lecteur.apercuLeconsTitre")}
            </span>
          </div>
          <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-ice-white/60 shrink-0">
            {activeIndex + 1} / {previewLessons.length}
          </span>
        </div>

        <ul className="space-y-1.5" role="list">
          {previewLessons.map((lesson, idx) => {
            const isSelected = lesson.id === activeLesson.id;
            const dur = formatDuration(lesson.durationMinutes);
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(lesson.id)}
                  aria-current={isSelected ? "true" : undefined}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                    isSelected
                      ? "bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/50 text-ice-white"
                      : "bg-white dark:bg-[var(--surface-well)] hover:bg-[var(--surface-well)] dark:hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-slate-800 dark:text-ice-white/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono tabular-nums ${
                        isSelected
                          ? "bg-brand text-[var(--brand-fg)] font-bold"
                          : "bg-[var(--surface-well)] dark:bg-deep-navy border border-[var(--border-subtle)] text-slate-700 dark:text-ice-white/60"
                      }`}
                    >
                      {isSelected ? (
                        <Play className="w-3 h-3 fill-current translate-x-[0.5px]" aria-hidden="true" />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className="font-sans text-xs sm:text-sm font-medium truncate">
                      {lesson.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {dur && (
                      <span className="font-mono text-[11px] tabular-nums text-slate-600 dark:text-ice-white/55">
                        {dur}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-brand-light hidden sm:inline">
                      {t("lecteur.apercuGratuitBadge")}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
