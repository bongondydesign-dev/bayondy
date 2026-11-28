import React from "react";
import { ChevronDown, PlayCircle } from "lucide-react";
import type { SyllabusModule } from "@/types/firestore";
import { t } from "@/lib/i18n";
import { AppLang, DEFAULT_APP_LANG } from "@/lib/i18n/config";

interface SyllabusProps {
  syllabus: SyllabusModule[];
  lang?: AppLang;
  previewLessonTitles?: string[];
}

export function Syllabus({
  syllabus,
  lang = DEFAULT_APP_LANG,
  previewLessonTitles = [],
}: SyllabusProps) {
  if (!syllabus || syllabus.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
        <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
          {t("catalogue.programme", lang)}
        </h2>
        <span className="font-mono text-xs text-slate-600 dark:text-ice-white/65 tabular-nums font-medium">
          {syllabus.length}{" "}
          {syllabus.length > 1
            ? t("catalogue.modules", lang)
            : t("catalogue.moduleSingulier", lang)}
        </span>
      </div>

      <div className="space-y-3">
        {syllabus.map((mod, modIdx) => {
          const lessonCount = mod.lessons?.length || 0;
          return (
            <details
              key={`mod-${modIdx}`}
              open={modIdx === 0}
              className="group rounded-2xl surface-glass border border-[var(--border-subtle)] overflow-hidden transition-colors duration-200 open:border-[var(--home-orange-vivid)]/45"
            >
              <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none list-none min-h-[44px] hover:bg-[var(--surface-well)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light transition-colors">
                <div className="flex items-center gap-3 pr-2">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-center font-mono text-xs font-semibold text-brand-light tabular-nums">
                    {String(modIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans font-semibold text-base text-ice-white group-hover:text-brand-light transition-colors">
                    {mod.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-mono text-xs text-slate-600 dark:text-ice-white/60 hidden sm:inline tabular-nums">
                    {lessonCount}{" "}
                    {lessonCount > 1
                      ? t("catalogue.lecons", lang)
                      : t("catalogue.leconSingulier", lang)}
                  </span>
                  <ChevronDown
                    className="w-5 h-5 text-slate-600 dark:text-ice-white/60 transition-transform duration-200 group-open:rotate-180"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
              </summary>

              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-[var(--border-faint)] bg-[var(--surface-well)]">
                <ul className="divide-y divide-[var(--border-faint)]">
                  {mod.lessons?.map((lesson, lessonIdx) => {
                    const normalizedTitle = (lesson.title || "").trim().toLowerCase();
                    const isPreview =
                      normalizedTitle.length > 0 &&
                      previewLessonTitles.some(
                        (pt) => pt.trim().toLowerCase() === normalizedTitle
                      );
                    return (
                      <li
                        key={`mod-${modIdx}-l-${lessonIdx}`}
                        className="py-3 flex items-center justify-between gap-3 text-sm text-slate-800 dark:text-ice-white/80"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white dark:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-slate-600 dark:text-ice-white/60 font-mono text-[10px] font-medium tabular-nums">
                            {lessonIdx + 1}
                          </span>
                          <span className="font-sans truncate leading-snug">
                            {lesson.title}
                          </span>
                        </div>
                        {isPreview && (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-brand-light shrink-0 whitespace-nowrap">
                            <PlayCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{t("lecteur.apercuGratuitBadge", lang)}</span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
