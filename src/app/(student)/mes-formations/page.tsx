"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProgressBar } from "@/components/player/ProgressBar";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import {
  getMyEnrollments,
  getCourseByIdForStudent,
  type CourseWithId,
  type EnrollmentWithId,
} from "@/lib/learning/queries";
import { formatDuration } from "@/lib/courses/format";
import { t } from "@/lib/i18n";

interface EnrolledCourseItem {
  enrollment: EnrollmentWithId;
  course: CourseWithId;
}

export default function MesFormationsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [items, setItems] = useState<EnrolledCourseItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;

    async function fetchEnrollments() {
      try {
        const enrollments = await getMyEnrollments(user!.uid);
        const loaded: EnrolledCourseItem[] = [];

        for (const enr of enrollments) {
          const course = await getCourseByIdForStudent(enr.courseId);
          if (course) {
            loaded.push({ enrollment: enr, course });
          }
        }

        if (!cancelled) {
          setItems(loaded);
          setDataLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(t("mesFormations.erreur"));
          setDataLoading(false);
        }
      }
    }

    fetchEnrollments();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleRetry = () => {
    if (!user?.uid) return;
    setDataLoading(true);
    setError(null);
    getMyEnrollments(user.uid)
      .then(async (enrollments) => {
        const loaded: EnrolledCourseItem[] = [];
        for (const enr of enrollments) {
          const course = await getCourseByIdForStudent(enr.courseId);
          if (course) loaded.push({ enrollment: enr, course });
        }
        setItems(loaded);
        setDataLoading(false);
      })
      .catch(() => {
        setError(t("mesFormations.erreur"));
        setDataLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white selection:bg-ion-blue/30 selection:text-aurora overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* En-tête */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-white/10 text-aurora font-mono text-xs uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora animate-pulse" />
            {t("nav.mesFormations")}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-3">
            {t("mesFormations.titre")}
          </h1>
          <p className="font-sans text-base sm:text-lg text-ice-white/70 leading-relaxed">
            {t("mesFormations.sousTitre")}
          </p>
        </div>

        {/* État de chargement initial */}
        {authLoading || dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-3xl bg-deep-navy/60 border border-white/5 p-5 sm:p-6 space-y-4 animate-pulse"
                aria-hidden="true"
              >
                <div className="aspect-video w-full rounded-2xl bg-white/5" />
                <div className="h-6 bg-white/10 rounded-lg w-3/4" />
                <div className="h-4 bg-white/5 rounded-lg w-1/2" />
                <div className="h-2 bg-white/5 rounded-full w-full" />
                <div className="h-10 bg-white/10 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          // État d'erreur
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-deep-navy/40 border border-red-500/20 my-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="font-sans text-sm text-ice-white/80 mb-6">{error}</p>
            {user?.uid && (
              <button
                type="button"
                onClick={handleRetry}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-deep-navy hover:bg-white/5 border border-white/10 text-white font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora cursor-pointer"
              >
                {t("accueil.boutonPrincipal")}
              </button>
            )}
          </div>
        ) : items.length === 0 ? (
          // État vide
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-3xl bg-deep-navy/40 border border-white/10 my-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-deep-navy border border-white/10 flex items-center justify-center mb-6 text-aurora shadow-lg shadow-aurora/5">
              <PortalSymbol size={36} className="opacity-80" />
            </div>
            <h2 className="font-sans font-semibold text-xl sm:text-2xl text-white mb-2">
              {t("mesFormations.vide")}
            </h2>
            <p className="font-sans text-sm sm:text-base text-ice-white/60 mb-8 max-w-md leading-relaxed">
              {t("mesFormations.videDescription")}
            </p>
            <Link
              href="/formations"
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-ion-blue hover:bg-ion-blue/90 text-white font-sans font-medium text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-ion-blue/25 transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
            >
              <span>{t("mesFormations.boutonDecouvrir")}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        ) : (
          // Liste des cours inscrits
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {items.map(({ enrollment, course }) => {
              const completedCount =
                enrollment.progress?.completedLessonIds?.length || 0;
              const totalCount = course.lessonsCount || 0;
              const duration = formatDuration(course.durationMinutes);
              const levelKey = `catalogue.niveaux.${course.level}`;

              return (
                <article
                  key={enrollment.id}
                  className="group relative flex flex-col rounded-3xl bg-deep-navy border border-white/10 hover:border-aurora/40 transition-all duration-300 hover:shadow-2xl hover:shadow-ion-blue/10 overflow-hidden"
                >
                  {/* Image ou visuel de repli */}
                  <div className="relative aspect-video w-full overflow-hidden bg-obsidian border-b border-white/5">
                    {course.coverUrl ? (
                      <Image
                        src={course.coverUrl}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ion-blue/20 via-obsidian to-aurora/10">
                        <div
                          className="absolute inset-0 bg-noise opacity-50"
                          aria-hidden="true"
                        />
                        <PortalSymbol
                          size={54}
                          className="opacity-75 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-obsidian/80 backdrop-blur-md border border-white/10 text-ice-white/90">
                        {t(levelKey)}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-5">
                    <div>
                      {duration && (
                        <span className="font-mono text-xs text-ice-white/50 block mb-2">
                          ⏱ {duration}
                        </span>
                      )}
                      <h2 className="font-display font-semibold text-lg sm:text-xl text-white group-hover:text-aurora transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h2>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-white/5">
                      {/* Barre de progression */}
                      <ProgressBar
                        completedCount={completedCount}
                        totalCount={totalCount}
                        size="sm"
                      />

                      {/* Bouton Continuer */}
                      <Link
                        href={`/mes-formations/${course.slug}`}
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-ion-blue hover:bg-ion-blue/90 text-white font-sans font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-ion-blue/20 transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
                      >
                        <span>{t("mesFormations.continuer")}</span>
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
