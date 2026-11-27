import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseFilters } from "@/components/course/CourseFilters";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { getPublishedCourses } from "@/lib/courses/queries";
import { computeCatalogStats } from "@/lib/courses/catalog";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("catalogue.titre")} | BAYONDY`,
  description: t("catalogue.sousTitre"),
};

export default async function FormationsPage() {
  const courses = await getPublishedCourses();
  const { totalCourses, totalLessons } = computeCatalogStats(courses);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--catalog-bg)] bg-noise text-[var(--catalog-ink)] selection:bg-[var(--catalog-blue)]/25 selection:text-[var(--catalog-blue)] dark:selection:text-[var(--catalog-aurora)] overflow-x-clip">
      <Navbar />

      <main className="relative flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
        {/* Lueur d'ambiance Ion Blue / Aurora en haut de page */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top_left,var(--catalog-glow),transparent_60%)]"
          aria-hidden="true"
        />

        {/* 1. En-tête du catalogue */}
        <header className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--catalog-card)] border border-[var(--catalog-blue)]/30 px-3.5 py-1.5 shadow-sm dark:shadow-none">
            <span
              className="w-2 h-2 rounded-full bg-[var(--catalog-aurora)]"
              aria-hidden="true"
            />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--catalog-aurora)]">
              {t("catalogue.badge")}
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[var(--catalog-ink)] leading-[1.08]">
            <span className="block">{t("catalogue.titreLigne1")}</span>
            <span className="block">
              {t("catalogue.titreLigne2Prefix")}
              <span className="bg-gradient-to-r from-[var(--catalog-blue)] to-[var(--catalog-aurora)] bg-clip-text text-transparent">
                {t("catalogue.titreLigne2Accent")}
              </span>
            </span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-[var(--catalog-ink)]/75 leading-relaxed max-w-2xl">
            {t("catalogue.sousTitre")}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            {totalCourses > 0 ? (
              <a
                href="#disponibles"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--catalog-blue)] hover:bg-[var(--catalog-blue-hover)] text-white text-sm sm:text-base font-semibold transition-colors shadow-lg shadow-[var(--catalog-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--catalog-aurora)]"
              >
                <span>{t("catalogue.boutonExplorer")}</span>
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </a>
            ) : (
              <Link
                href="/faq"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--catalog-card)] border border-[var(--catalog-blue)]/35 hover:border-[var(--catalog-aurora)] text-[var(--catalog-ink)] text-sm sm:text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--catalog-aurora)] shadow-sm dark:shadow-none"
              >
                {t("catalogue.aideBouton")}
              </Link>
            )}
          </div>

          {/* 2. Rangée de pastilles de chiffres RÉELS (affichées seulement si > 0) */}
          {(totalCourses > 0 || totalLessons > 0) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {totalCourses > 0 && (
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[var(--catalog-card)] border border-[var(--border-subtle)] px-4 py-2 shadow-sm dark:shadow-none">
                  <span className="font-mono text-sm font-semibold text-[var(--catalog-aurora)]">
                    {totalCourses}
                  </span>
                  <span className="font-sans text-xs sm:text-sm text-[var(--catalog-ink)]/80">
                    {totalCourses > 1
                      ? t("catalogue.statFormations")
                      : t("catalogue.statFormationsSingulier")}
                  </span>
                </div>
              )}

              {totalLessons > 0 && (
                <div className="inline-flex items-center gap-2.5 rounded-full bg-[var(--catalog-card)] border border-[var(--border-subtle)] px-4 py-2 shadow-sm dark:shadow-none">
                  <span className="font-mono text-sm font-semibold text-[var(--catalog-aurora)]">
                    {totalLessons}
                  </span>
                  <span className="font-sans text-xs sm:text-sm text-[var(--catalog-ink)]/80">
                    {totalLessons > 1
                      ? t("catalogue.statLecons")
                      : t("catalogue.statLeconsSingulier")}
                  </span>
                </div>
              )}
            </div>
          )}
        </header>

        {/* 3. Filtres et grille des formations publiées ou état vide */}
        {courses.length === 0 ? (
          <section className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-[var(--catalog-card)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--catalog-well)] border border-[var(--catalog-blue)]/30 flex items-center justify-center mb-6 shadow-lg shadow-[var(--catalog-glow)]">
              <PortalSymbol accent="ion" size={36} className="opacity-90" />
            </div>
            <h2 className="font-sans font-semibold text-xl sm:text-2xl text-[var(--catalog-ink)] mb-2">
              {t("catalogue.vide")}
            </h2>
            <p className="font-sans text-sm sm:text-base text-[var(--catalog-ink)]/70 max-w-md mx-auto leading-relaxed">
              {t("catalogue.videDescription")}
            </p>
          </section>
        ) : (
          <CourseFilters courses={courses} />
        )}

        {/* 4. Bandeau d'aide en bas de page */}
        <section className="rounded-2xl bg-[var(--catalog-card)] border border-[var(--catalog-blue)]/30 shadow-[var(--card-shadow)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1.5">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--catalog-ink)] tracking-tight">
              {t("catalogue.aideTitre")}
            </h2>
            <p className="font-sans text-sm sm:text-base text-[var(--catalog-ink)]/75">
              {t("aide.contactBientot")}
            </p>
          </div>

          <Link
            href="/faq"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--catalog-well)] border border-[var(--catalog-aurora)]/45 hover:border-[var(--catalog-aurora)] text-[var(--catalog-ink)] hover:text-[var(--catalog-aurora)] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--catalog-aurora)]"
          >
            <span>{t("catalogue.aideBouton")}</span>
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
