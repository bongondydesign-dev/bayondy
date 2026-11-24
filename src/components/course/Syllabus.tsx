import React from "react";
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
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <h2 className="font-sans font-semibold text-xl sm:text-2xl text-ice-white">
          {t("catalogue.programme")}
        </h2>
        <span className="font-mono text-xs text-ice-white/60">
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
              className="group rounded-2xl bg-deep-navy border border-white/[0.08] overflow-hidden transition-colors duration-200 open:border-brand/35"
            >
              <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none list-none min-h-[44px] hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light transition-colors">
                <div className="flex items-center gap-3 pr-2">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-obsidian border border-white/[0.08] flex items-center justify-center font-mono text-xs font-semibold text-brand-light">
                    {String(modIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans font-medium text-base text-ice-white group-hover:text-brand-light transition-colors">
                    {mod.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-mono text-xs text-ice-white/50 hidden sm:inline">
                    {lessonCount}{" "}
                    {lessonCount > 1
                      ? t("catalogue.lecons")
                      : t("catalogue.leconSingulier")}
                  </span>
                  <svg
                    className="w-5 h-5 text-ice-white/60 transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </summary>

              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-white/5 bg-obsidian/40">
                <ul className="divide-y divide-white/5">
                  {mod.lessons?.map((lesson, lessonIdx) => (
                    <li
                      key={`mod-${modIdx}-l-${lessonIdx}`}
                      className="py-3 flex items-center gap-3 text-sm text-ice-white/80"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-ice-white/40 font-mono text-[10px]">
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
