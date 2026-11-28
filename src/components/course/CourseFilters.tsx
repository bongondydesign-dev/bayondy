"use client";

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { CourseLanguage, CourseLevel, PublicCourse } from "@/types/firestore";
import {
  extractCatalogFilterOptions,
  filterCatalogCourses,
} from "@/lib/courses/catalog";
import { CourseCard } from "./CourseCard";
import { t } from "@/lib/i18n";

interface CourseFiltersProps {
  courses: PublicCourse[];
}

export function CourseFilters({ courses }: CourseFiltersProps) {
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "all">("all");
  const [selectedLanguage, setSelectedLanguage] = useState<CourseLanguage | "all">("all");

  const { levels, languages } = useMemo(
    () => extractCatalogFilterOptions(courses),
    [courses]
  );

  const filteredCourses = useMemo(
    () => filterCatalogCourses(courses, selectedLevel, selectedLanguage),
    [courses, selectedLevel, selectedLanguage]
  );

  const hasActiveFilter = selectedLevel !== "all" || selectedLanguage !== "all";

  const handleReset = () => {
    setSelectedLevel("all");
    setSelectedLanguage("all");
  };

  return (
    <div className="space-y-8">
      {/* Barre de filtres segmentée verre dépoli */}
      {(levels.length > 0 || languages.length > 0) && (
        <section
          aria-label={`${t("catalogue.filtreNiveau")} / ${t("catalogue.filtreLangue")}`}
          className="rounded-2xl surface-glass border border-[var(--border-subtle)] p-4 sm:p-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filtre par niveau */}
            {levels.length > 0 && (
              <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-ice-white/60 shrink-0">
                  {t("catalogue.filtreNiveau")}
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(["all", ...levels] as Array<CourseLevel | "all">).map((level) => {
                    const isActive = selectedLevel === level;
                    const label =
                      level === "all"
                        ? t("catalogue.filtreTout")
                        : t(`catalogue.niveaux.${level}`);
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedLevel(level)}
                        aria-pressed={isActive}
                        className={`relative min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                          isActive
                            ? "border-transparent text-white dark:text-[var(--brand-fg)] font-semibold"
                            : "bg-[var(--surface-well)] dark:bg-[#141720] border-[var(--border-subtle)] dark:border-white/12 text-slate-700 dark:text-ice-white/75 hover:border-brand/55 hover:text-ice-white dark:hover:bg-[#1A1E29]"
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="catalog-level-pill"
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            className="absolute inset-0 rounded-full bg-[#0F1219] dark:bg-brand shadow-sm"
                            aria-hidden="true"
                          />
                        )}
                        <span className="relative z-10">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtre par langue */}
            {languages.length > 0 && (
              <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-ice-white/60 shrink-0">
                  {t("catalogue.filtreLangue")}
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(["all", ...languages] as Array<CourseLanguage | "all">).map((language) => {
                    const isActive = selectedLanguage === language;
                    const label =
                      language === "all"
                        ? t("catalogue.filtreTout")
                        : t(`catalogue.langues.${language}`);
                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => setSelectedLanguage(language)}
                        aria-pressed={isActive}
                        className={`relative min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                          isActive
                            ? "border-transparent text-white dark:text-[var(--brand-fg)] font-semibold"
                            : "bg-[var(--surface-well)] dark:bg-[#141720] border-[var(--border-subtle)] dark:border-white/12 text-slate-700 dark:text-ice-white/75 hover:border-brand/55 hover:text-ice-white dark:hover:bg-[#1A1E29]"
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="catalog-language-pill"
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            className="absolute inset-0 rounded-full bg-[#0F1219] dark:bg-brand shadow-sm"
                            aria-hidden="true"
                          />
                        )}
                        <span className="relative z-10">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Titre de section « Disponibles maintenant » */}
      <section id="disponibles" className="scroll-mt-24 space-y-6">
        <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-ice-white tracking-tight">
            {t("catalogue.disponiblesMaintenant")}
          </h2>

          <span
            className="font-mono text-xs sm:text-sm text-brand-light tabular-nums"
            aria-label={`${filteredCourses.length}`}
          >
            {String(filteredCourses.length).padStart(2, "0")}
          </span>
        </div>

        {/* Grille des formations filtrées */}
        {filteredCourses.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </motion.div>
        ) : (
          <div className="rounded-2xl surface-glass border border-[var(--border-subtle)] p-8 sm:p-10 text-center space-y-4">
            <p className="font-display font-semibold text-lg sm:text-xl text-ice-white">
              {t("catalogue.aucunResultat")}
            </p>
            <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-ice-white/70 max-w-md mx-auto">
              {t("catalogue.aucunResultatDescription")}
            </p>
            {hasActiveFilter && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-full bg-gradient-to-b from-[#FF652E] to-brand text-[var(--brand-fg)] text-sm font-semibold transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_6px_18px_-4px_var(--brand-glow)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  {t("catalogue.reinitialiserFiltres")}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default CourseFilters;
