"use client";

import React from "react";
import type { LessonWithId } from "@/lib/learning/queries";
import { formatDuration } from "@/lib/courses/format";
import { t } from "@/lib/i18n";

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
}

export function LessonList({
  lessons,
  currentLessonId,
  completedLessonIds,
  onSelectLesson,
  className = "",
}: LessonListProps) {
  // Groupement des leçons par module tout en conservant l'ordre
  const modules: GroupedModule[] = [];
  const moduleMap = new Map<string, GroupedModule>();

  for (const lesson of lessons) {
    const key = lesson.moduleTitle || lesson.moduleId || "Modil";
    let mod = moduleMap.get(key);
    if (!mod) {
      mod = { title: key, lessons: [] };
      moduleMap.set(key, mod);
      modules.push(mod);
    }
    mod.lessons.push(lesson);
  }

  const completedSet = new Set(completedLessonIds);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h3 className="font-sans font-semibold text-base sm:text-lg text-ice-white">
          {t("lecteur.listeLecons")}
        </h3>
        <span className="font-mono text-xs text-ice-white/50">
          {lessons.length}{" "}
          {lessons.length > 1
            ? t("catalogue.lecons")
            : t("catalogue.leconSingulier")}
        </span>
      </div>

      <div className="space-y-5">
        {modules.map((mod, modIdx) => (
          <div key={`mod-${modIdx}`} className="space-y-2">
            {/* Titre du module */}
            <div className="flex items-center gap-2 px-1">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-aurora">
                Modil {modIdx + 1}
              </span>
              <span className="text-white/20">•</span>
              <h4 className="font-sans font-medium text-xs sm:text-sm text-ice-white/80 truncate">
                {mod.title}
              </h4>
            </div>

            {/* Liste des leçons du module */}
            <ul className="space-y-1.5" role="list">
              {mod.lessons.map((lesson) => {
                const isCurrent = lesson.id === currentLessonId;
                const isCompleted = completedSet.has(lesson.id);
                const duration = formatDuration(lesson.durationMinutes);

                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora ${
                        isCurrent
                          ? "bg-ion-blue/20 border border-ion-blue/60 text-white shadow-md shadow-ion-blue/10"
                          : "bg-deep-navy/60 hover:bg-white/5 border border-white/5 hover:border-white/10 text-ice-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Indicateur d'état (terminé, en cours, ou numéro) */}
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono transition-colors ${
                            isCompleted
                              ? "bg-aurora/20 text-aurora border border-aurora/40"
                              : isCurrent
                              ? "bg-ion-blue text-white"
                              : "bg-obsidian border border-white/10 text-ice-white/50"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="3"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          ) : (
                            lesson.order || modIdx + 1
                          )}
                        </span>

                        <span
                          className={`font-sans text-xs sm:text-sm truncate leading-snug ${
                            isCurrent
                              ? "font-semibold text-white"
                              : isCompleted
                              ? "text-ice-white/90"
                              : "text-ice-white/70"
                          }`}
                        >
                          {lesson.title}
                        </span>
                      </div>

                      {/* Durée de la leçon */}
                      {duration && (
                        <span className="font-mono text-[11px] text-ice-white/40 flex-shrink-0">
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
    </div>
  );
}
