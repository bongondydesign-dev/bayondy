import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseFilters } from "@/components/course/CourseFilters";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { Button } from "@/components/ui/Button";
import { getPublishedCourses } from "@/lib/courses/queries";
import { computeCatalogStats } from "@/lib/courses/catalog";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("catalogue.titre")} | BAYONDY`,
  description: t("catalogue.sousTitre"),
};

function CatalogSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true">
      <div className="h-16 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-80 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]"
          />
        ))}
      </div>
    </div>
  );
}

async function CatalogContent() {
  const courses = await getPublishedCourses();
  const { totalCourses, totalLessons } = computeCatalogStats(courses);

  return (
    <>
      {/* 1. En-tête du catalogue avec lueur pleine largeur BAYONDY */}
      <section className="relative w-full pt-12 pb-10 sm:pt-16 sm:pb-12 overflow-hidden bg-transparent transition-colors duration-200">
        <div
          className="absolute inset-x-0 top-0 h-[440px] pointer-events-none opacity-45 dark:opacity-100"
          style={{
            background:
              "radial-gradient(ellipse 65% 55% at 50% 0%, var(--brand-glow) 0%, var(--brand-glow-soft) 48%, transparent 78%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light">
            {t("catalogue.badge")}
          </p>

          <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl tracking-[-0.025em] text-ice-white leading-[1.06] max-w-3xl text-balance">
            <span className="block">{t("catalogue.titreLigne1")}</span>
            <span className="block">
              {t("catalogue.titreLigne2Prefix")}
              <span className="font-serif italic font-normal bg-gradient-to-r from-[#E54813] to-[#BA3408] dark:from-[#FF885C] dark:to-[#FF5B22] bg-clip-text text-transparent pr-1.5">
                {t("catalogue.titreLigne2Accent")}
              </span>
            </span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-ice-white/70 leading-relaxed max-w-2xl text-balance">
            {t("catalogue.sousTitre")}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            {totalCourses > 0 ? (
              <Button
                href="#disponibles"
                variant="principal"
                className="pl-6 pr-2.5 py-2"
              >
                <span>{t("catalogue.boutonExplorer")}</span>
                <span
                  className="w-7 h-7 rounded-full bg-[var(--brand-fg)] text-brand inline-flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.4}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </Button>
            ) : (
              <Button href="/faq" variant="secondaire">
                {t("catalogue.aideBouton")}
              </Button>
            )}

            {/* Statistiques réelles sobrement intégrées sans pastilles */}
            {(totalCourses > 0 || totalLessons > 0) && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ice-white/75 font-sans tabular-nums">
                {totalCourses > 0 && (
                  <div className="inline-flex items-baseline gap-2">
                    <span className="font-mono font-semibold text-brand-light">
                      {totalCourses}
                    </span>
                    <span>
                      {totalCourses > 1
                        ? t("catalogue.statFormations")
                        : t("catalogue.statFormationsSingulier")}
                    </span>
                  </div>
                )}

                {totalCourses > 0 && totalLessons > 0 && (
                  <span className="text-ice-white/30" aria-hidden="true">
                    ·
                  </span>
                )}

                {totalLessons > 0 && (
                  <div className="inline-flex items-baseline gap-2">
                    <span className="font-mono font-semibold text-brand-light">
                      {totalLessons}
                    </span>
                    <span>
                      {totalLessons > 1
                        ? t("catalogue.statLecons")
                        : t("catalogue.statLeconsSingulier")}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Corps du catalogue (filtres + grille ou état vide) + bandeau d'aide */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pb-16 sm:pb-24 space-y-14">
        {courses.length === 0 ? (
          <section className="flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-center mb-6">
              <PortalSymbol accent="brand" size={38} className="opacity-95" />
            </div>
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white mb-2">
              {t("catalogue.vide")}
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-ice-white/70 max-w-md mx-auto leading-relaxed">
              {t("catalogue.videDescription")}
            </p>
          </section>
        ) : (
          <CourseFilters courses={courses} />
        )}

        {/* 3. Bandeau d'aide en bas de page */}
        <section className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-brand/40 transition-colors shadow-[var(--card-shadow)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1.5">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-ice-white tracking-tight">
              {t("catalogue.aideTitre")}
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-ice-white/70">
              {t("aide.contactBientot")}
            </p>
          </div>

          <Link
            href="/faq"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-deep-navy dark:bg-[var(--surface-well)] border border-[var(--border-strong)] hover:border-brand/55 hover:bg-[var(--surface-subtle)] text-ice-white hover:text-brand-light text-sm font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
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
      </div>
    </>
  );
}

export default function FormationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Suspense
          fallback={
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12">
              <CatalogSkeleton />
            </div>
          }
        >
          <CatalogContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
