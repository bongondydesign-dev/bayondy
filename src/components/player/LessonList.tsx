"use client";

import React, { useMemo, useState } from "react";
import { Check, Play, Search, X } from "lucide-react";
import type { LessonWithId } from "@/lib/learning/queries";
import { formatDuration } from "@/lib/courses/format";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface LessonListProps {
  lessons: LessonWithId[];
  currentLessonId: string;
  completedLessonIds: string[];
  onSelectLesson: (lessonId: string) => void;
  className?: string;
}

interface GroupedModule {
  title: string;
  lessons: LessonWithId[];
  completedCount: number;
}

export function LessonList({
  lessons,
  currentLessonId,
  completedLessonIds,
  onSelectLesson,
  className = "",
}: LessonListProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");

  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const modules = useMemo(() => {
    const grouped: GroupedModule[] = [];
    const moduleMap = new Map<string, GroupedModule>();

    for (const lesson of lessons) {
      const matches =
        !normalizedQuery ||
        lesson.title.toLowerCase().includes(normalizedQuery) ||
        (lesson.moduleTitle || "").toLowerCase().includes(normalizedQuery);
      if (!matches) continue;

      const key = lesson.moduleTitle || lesson.moduleId || t("catalogue.moduleLabel");
      let mod = moduleMap.get(key);
      if (!mod) {
        mod = { title: key, lessons: [], completedCount: 0 };
        moduleMap.set(key, mod);
        grouped.push(mod);
      }
      mod.lessons.push(lesson);
      if (completedSet.has(lesson.id)) {
        mod.completedCount += 1;
      }
    }

    return grouped;
  }, [lessons, normalizedQuery, completedSet, t]);

  return (
    <div className={`space-y-5 ${className}`}>
      <div className="space-y-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-sans font-semibold text-base sm:text-lg text-ice-white">
            {t("lecteur.listeLecons")}
          </h3>
          <span className="font-mono text-xs font-medium tabular-nums text-slate-600 dark:text-ice-white/60">
            {lessons.length}{" "}
            {lessons.length > 1
              ? t("catalogue.lecons")
              : t("catalogue.leconSingulier")}
          </span>
        </div>

        {lessons.length > 4 && (
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 dark:text-ice-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("lecteur.rechercherLecon")}
              aria-label={t("lecteur.rechercherLecon")}
              className="w-full min-h-[40px] pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-[var(--surface-well)] text-slate-900 dark:text-ice-white placeholder:text-slate-400 dark:placeholder:text-ice-white/40 border border-[var(--border-strong)] dark:border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={t("lecteur.commentaireAnnuler")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-ice-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      {modules.length === 0 ? (
        <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-ice-white/55 text-center py-6">
          {t("lecteur.aucuneLeconTrouvee")}
        </p>
      ) : (
        <div className="space-y-5">
          {modules.map((mod, modIdx) => (
            <div key={`mod-${modIdx}-${mod.title}`} className="space-y-2">
              {/* Titre du module + progression du module */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-light shrink-0">
                    {t("catalogue.moduleLabel")} {modIdx + 1}
                  </span>
                  <span className="text-slate-500 dark:text-ice-white/30" aria-hidden="true">
                    ·
                  </span>
                  <h4 className="font-sans font-medium text-xs sm:text-sm text-slate-700 dark:text-ice-white/80 truncate">
                    {mod.title}
                  </h4>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-ice-white/50 shrink-0">
                  {mod.completedCount}/{mod.lessons.length}
                </span>
              </div>

              {/* Liste des leçons du module */}
              <ul className="space-y-1.5" role="list">
                {mod.lessons.map((lesson, lessonIdx) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const isCompleted = completedSet.has(lesson.id);
                  const duration = formatDuration(lesson.durationMinutes);

                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => onSelectLesson(lesson.id)}
                        aria-current={isCurrent ? "true" : undefined}
                        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light cursor-pointer ${
                          isCurrent
                            ? "bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/55 text-ice-white shadow-sm shadow-[var(--brand-glow-soft)]"
                            : "bg-white dark:bg-[var(--surface-well)] hover:bg-[var(--surface-well)] dark:hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-2xs dark:shadow-none text-slate-800 dark:text-ice-white/80"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono tabular-nums transition-colors ${
                              isCompleted
                                ? "bg-[var(--surface-active)] text-brand-light border border-[var(--home-orange-vivid)]/45"
                                : isCurrent
                                ? "bg-brand text-[var(--brand-fg)] font-bold"
                                : "bg-[var(--surface-well)] dark:bg-deep-navy border border-[var(--border-subtle)] text-slate-700 dark:text-ice-white/60"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                            ) : isCurrent ? (
                              <Play className="w-3 h-3 fill-current translate-x-[0.5px]" aria-hidden="true" />
                            ) : (
                              lesson.order || lessonIdx + 1
                            )}
                          </span>

                          <span
                            className={`font-sans text-xs sm:text-sm truncate leading-snug ${
                              isCurrent
                                ? "font-semibold text-ice-white"
                                : isCompleted
                                ? "text-slate-900 dark:text-ice-white/90 font-medium"
                                : "text-slate-700 dark:text-ice-white/75"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>

                        {duration && (
                          <span className="font-mono text-[11px] tabular-nums text-slate-600 dark:text-ice-white/55 flex-shrink-0">
                            {duration}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
