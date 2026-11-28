import React from "react";
import { ChevronDown } from "lucide-react";
import type { SyllabusModule } from "@/types/firestore";
import { t } from "@/lib/i18n";

interface SyllabusProps {
  syllabus: SyllabusModule[];
}

export function Syllabus({ syllabus }: SyllabusProps) {
  if (!syllabus || syllabus.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
        <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
          {t("catalogue.programme")}
        </h2>
        <span className="font-mono text-xs text-slate-600 dark:text-ice-white/65 tabular-nums font-medium">
          {syllabus.length}{" "}
          {syllabus.length > 1
            ? t("catalogue.modules")
            : t("catalogue.moduleSingulier")}
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
                      ? t("catalogue.lecons")
                      : t("catalogue.leconSingulier")}
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
                  {mod.lessons?.map((lesson, lessonIdx) => (
                    <li
                      key={`mod-${modIdx}-l-${lessonIdx}`}
                      className="py-3 flex items-center gap-3 text-sm text-slate-800 dark:text-ice-white/80"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white dark:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-slate-600 dark:text-ice-white/60 font-mono text-[10px] font-medium tabular-nums">
                        {lessonIdx + 1}
                      </span>
                      <span className="font-sans flex-1 leading-snug">
                        {lesson.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
