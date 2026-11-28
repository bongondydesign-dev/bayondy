"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, PlayCircle, ShieldCheck } from "lucide-react";
import type { PublicCourse } from "@/types/firestore";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { StudentShell } from "@/components/student/StudentShell";
import { CoursePreviewPlayer } from "@/components/course/CoursePreviewPlayer";
import { PriceTag } from "@/components/course/PriceTag";
import { EnrollButton } from "@/components/course/EnrollButton";
import { Syllabus } from "@/components/course/Syllabus";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { formatDuration } from "@/lib/courses/format";
import { getPublishedCourseBySlugClient } from "@/lib/learning/queries";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface StudentCourseDetailClientProps {
  slug: string;
  initialCourse: PublicCourse | null;
}

export function StudentCourseDetailClient({
  slug,
  initialCourse,
}: StudentCourseDetailClientProps) {
  const { lang, t, localize } = useI18n();
  const { user, loading: authLoading, isAdmin } = useRequireAuth();

  const [course, setCourse] = useState<PublicCourse | null>(initialCourse);
  const [resolvingClient, setResolvingClient] = useState(!initialCourse);

  useEffect(() => {
    if (authLoading || !user?.uid) return;
    if (initialCourse) {
      return;
    }

    let cancelled = false;
    getPublishedCourseBySlugClient(slug, isAdmin)
      .then((found) => {
        if (!cancelled) {
          setCourse(found);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourse(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setResolvingClient(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.uid, slug, isAdmin, initialCourse]);

  const isLoading = authLoading || resolvingClient;
  const durationText = course ? formatDuration(course.durationMinutes) : "";
  const levelKey = course ? `catalogue.niveaux.${course.level}` : "";
  const languageKey = course ? `catalogue.langues.${course.language}` : "";
  const courseLanguageKey = course
    ? `catalogue.coursEnLangue.${course.language}`
    : "";

  return (
    <StudentShell
      pageTitle={course?.title || t("catalogueClient.titre")}
      pageSubtitle={t("catalogue.badge")}
    >
      {isLoading ? (
        <div className="space-y-6 animate-pulse" aria-hidden="true">
          <div className="h-5 w-44 rounded bg-[var(--surface-subtle)]" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-5">
              <div className="h-10 w-3/4 rounded-xl bg-[var(--surface-subtle)]" />
              <div className="aspect-video w-full rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
              <div className="h-52 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
            </div>
            <div className="lg:col-span-4 h-80 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          </div>
        </div>
      ) : !course ? (
        <div className="flex flex-col items-center justify-center text-center p-10 sm:p-14 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] my-8 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-center mb-5 text-brand-light">
            <PortalSymbol size={32} className="opacity-85" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ice-white mb-2">
            {t("catalogueClient.introuvable")}
          </h1>
          <p className="font-sans text-sm text-slate-700 dark:text-ice-white/70 mb-7 max-w-md leading-relaxed">
            {t("catalogueClient.introuvableDescription")}
          </p>
          <Link
            href={localize("/catalogue")}
            className="min-h-[44px] px-6 py-2.5 rounded-full bg-brand hover:bg-brand-dark text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t("catalogueClient.retourCatalogueClient")}</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <Link
              href={localize("/catalogue")}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-600 dark:text-ice-white/70 hover:text-brand-light transition-colors min-h-[44px] py-1 px-2 -ml-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t("catalogueClient.retourCatalogueClient")}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Colonne principale : En-tête + Aperçu vidéo + Description + Programme */}
            <div className="lg:col-span-8 min-w-0 space-y-6 sm:space-y-7">
              <div className="space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-ice-white/70 tabular-nums">
                  <span className="text-brand-light font-semibold">
                    {t(levelKey)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-ice-white font-semibold normal-case tracking-normal">
                    {t(courseLanguageKey)}
                  </span>
                  {durationText && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                        <Clock
                          className="w-3.5 h-3.5 text-brand-light"
                          aria-hidden="true"
                        />
                        <span>{durationText}</span>
                      </span>
                    </>
                  )}
                  {course.lessonsCount > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                        <PlayCircle
                          className="w-3.5 h-3.5 text-brand-light"
                          aria-hidden="true"
                        />
                        <span>
                          {course.lessonsCount}{" "}
                          {course.lessonsCount > 1
                            ? t("catalogue.lecons")
                            : t("catalogue.leconSingulier")}
                        </span>
                      </span>
                    </>
                  )}
                </div>

                <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-ice-white leading-tight text-balance break-words">
                  {course.title}
                </h1>

                {course.shortDescription && (
                  <p className="font-sans text-base sm:text-lg text-slate-700 dark:text-ice-white/75 leading-relaxed">
                    {course.shortDescription}
                  </p>
                )}
              </div>

              <CoursePreviewPlayer
                courseTitle={course.title}
                coverUrl={course.coverUrl}
              />

              {course.description && (
                <section className="p-5 sm:p-6 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-3">
                  <h2 className="font-display font-semibold text-xl text-ice-white">
                    {t("catalogue.aPropos")}
                  </h2>
                  <div className="font-sans text-sm sm:text-base text-slate-700 dark:text-ice-white/75 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </section>
              )}

              <section id="programme" className="scroll-mt-24">
                <Syllabus syllabus={course.syllabus} lang={lang} />
              </section>
            </div>

            {/* Colonne achat directe MonCash dans l'espace client */}
            <aside className="lg:col-span-4 min-w-0 lg:sticky lg:top-24">
              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-5 sm:p-6 space-y-6">
                <div className="space-y-3 pb-5 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-medium text-slate-600 dark:text-zinc-400 uppercase tracking-[0.14em]">
                      {t("catalogue.prixLabel")}
                    </span>
                    <span className="font-sans text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {t("fonctionnalites.acces.titre")}
                    </span>
                  </div>

                  <PriceTag
                    priceUSD={course.priceUSD}
                    priceHTG={course.priceHTG}
                    size="lg"
                    lang={lang}
                  />
                </div>

                <EnrollButton
                  courseId={course.id}
                  courseSlug={course.slug}
                  courseTitle={course.title}
                  priceUSD={course.priceUSD}
                  priceHTG={course.priceHTG}
                  redirectBasePath="/catalogue"
                />

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-ice-white/65">
                  <ShieldCheck
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{t("catalogueClient.paiementDirectInfo")}</span>
                </div>

                <ul className="pt-5 border-t border-[var(--border-subtle)] space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/85">
                    <span className="w-5 h-5 rounded-full bg-brand/12 border border-brand/25 text-brand-light flex items-center justify-center shrink-0">
                      <Check
                        className="w-3 h-3"
                        strokeWidth={2.6}
                        aria-hidden="true"
                      />
                    </span>
                    <span>
                      {t("catalogue.langueDuCours")} : {t(languageKey)}
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/85">
                    <span className="w-5 h-5 rounded-full bg-brand/12 border border-brand/25 text-brand-light flex items-center justify-center shrink-0">
                      <Check
                        className="w-3 h-3"
                        strokeWidth={2.6}
                        aria-hidden="true"
                      />
                    </span>
                    <span>{t("catalogue.atoutMobile")}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/85">
                    <span className="w-5 h-5 rounded-full bg-brand/12 border border-brand/25 text-brand-light flex items-center justify-center shrink-0">
                      <Check
                        className="w-3 h-3"
                        strokeWidth={2.6}
                        aria-hidden="true"
                      />
                    </span>
                    <span>{t("catalogue.atoutRythme")}</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      )}
    </StudentShell>
  );
}
