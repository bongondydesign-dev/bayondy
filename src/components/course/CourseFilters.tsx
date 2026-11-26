"use client";

import React, { useMemo, useState } from "react";
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
      {/* Barre de filtres en pastilles (défilement horizontal autonome sur mobile) */}
      {(levels.length > 0 || languages.length > 0) && (
        <section
          aria-label={`${t("catalogue.filtreNiveau")} / ${t("catalogue.filtreLangue")}`}
          className="rounded-2xl bg-[#14243B]/50 border border-white/[0.08] p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filtre par niveau */}
            {levels.length > 0 && (
              <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <span className="font-mono text-xs uppercase tracking-wider text-[#E8EDF5]/65 shrink-0">
                  {t("catalogue.filtreNiveau")}
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setSelectedLevel("all")}
                    aria-pressed={selectedLevel === "all"}
                    className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37D6D0] ${
                      selectedLevel === "all"
                        ? "bg-[#2864FF] border-[#2864FF] text-white shadow-md shadow-[#2864FF]/25"
                        : "bg-[#080B14]/80 border-white/[0.1] text-[#E8EDF5]/80 hover:border-[#37D6D0]/50 hover:text-[#E8EDF5]"
                    }`}
                  >
                    {t("catalogue.filtreTout")}
                  </button>

                  {levels.map((level) => {
                    const isActive = selectedLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSelectedLevel(level)}
                        aria-pressed={isActive}
                        className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37D6D0] ${
                          isActive
                            ? "bg-[#2864FF] border-[#2864FF] text-white shadow-md shadow-[#2864FF]/25"
                            : "bg-[#080B14]/80 border-white/[0.1] text-[#E8EDF5]/80 hover:border-[#37D6D0]/50 hover:text-[#E8EDF5]"
                        }`}
                      >
                        {t(`catalogue.niveaux.${level}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtre par langue */}
            {languages.length > 0 && (
              <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <span className="font-mono text-xs uppercase tracking-wider text-[#E8EDF5]/65 shrink-0">
                  {t("catalogue.filtreLangue")}
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage("all")}
                    aria-pressed={selectedLanguage === "all"}
                    className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37D6D0] ${
                      selectedLanguage === "all"
                        ? "bg-[#2864FF] border-[#2864FF] text-white shadow-md shadow-[#2864FF]/25"
                        : "bg-[#080B14]/80 border-white/[0.1] text-[#E8EDF5]/80 hover:border-[#37D6D0]/50 hover:text-[#E8EDF5]"
                    }`}
                  >
                    {t("catalogue.filtreTout")}
                  </button>

                  {languages.map((language) => {
                    const isActive = selectedLanguage === language;
                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => setSelectedLanguage(language)}
                        aria-pressed={isActive}
                        className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37D6D0] ${
                          isActive
                            ? "bg-[#2864FF] border-[#2864FF] text-white shadow-md shadow-[#2864FF]/25"
                            : "bg-[#080B14]/80 border-white/[0.1] text-[#E8EDF5]/80 hover:border-[#37D6D0]/50 hover:text-[#E8EDF5]"
                        }`}
                      >
                        {t(`catalogue.langues.${language}`)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Titre de section « Disponibles maintenant » avec le nombre réel */}
      <section id="disponibles" className="scroll-mt-24 space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#37D6D0] shadow-[0_0_12px_rgba(55,214,208,0.65)] shrink-0"
              aria-hidden="true"
            />
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#E8EDF5] tracking-tight">
              {t("catalogue.disponiblesMaintenant")}
            </h2>
          </div>

          <span
            className="inline-flex items-center justify-center min-w-[2.25rem] px-3 py-1 rounded-full bg-[#14243B] border border-[#2864FF]/35 font-mono text-xs sm:text-sm font-medium text-[#37D6D0]"
            aria-label={`${filteredCourses.length}`}
          >
            {String(filteredCourses.length).padStart(2, "0")}
          </span>
        </div>

        {/* Grille des formations filtrées ou message aucun résultat */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#14243B]/60 border border-white/[0.08] p-8 sm:p-10 text-center space-y-4">
            <p className="font-display font-semibold text-lg sm:text-xl text-[#E8EDF5]">
              {t("catalogue.aucunResultat")}
            </p>
            <p className="font-sans text-sm sm:text-base text-[#E8EDF5]/70 max-w-md mx-auto">
              {t("catalogue.aucunResultatDescription")}
            </p>
            {hasActiveFilter && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-full bg-[#2864FF] hover:bg-[#3B74FF] text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37D6D0]"
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
