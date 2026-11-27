"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { StudentShell } from "@/components/student/StudentShell";
import { ProgressBar } from "@/components/player/ProgressBar";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import {
  getAllCoursesForAdmin,
  getMyEnrollments,
  getCourseByIdForStudent,
  getMyPayments,
  type PaymentWithId,
} from "@/lib/learning/queries";
import { mergeAdminCoursesWithEnrollments } from "@/lib/learning/access";
import {
  computeCoursePercent,
  computeStudentStats,
  filterStudentCourses,
  isCourseCompleted,
  type StudentCourseFilter,
  type StudentCourseItem,
} from "@/lib/learning/stats";
import { formatDuration } from "@/lib/courses/format";
import { t } from "@/lib/i18n";

function paymentStatusBadge(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25";
    case "pending":
    case "awaiting_payment":
      return "bg-amber-500/12 text-amber-800 dark:text-amber-300 border-amber-500/25";
    case "failed":
    case "expired":
      return "bg-red-500/12 text-red-700 dark:text-red-300 border-red-500/25";
    default:
      return "bg-[var(--surface-well)] text-ice-white/70 border-[var(--border-subtle)]";
  }
}

export default function MesFormationsPage() {
  const { user, loading: authLoading, isAdmin } = useRequireAuth();
  const [items, setItems] = useState<StudentCourseItem[]>([]);
  const [payments, setPayments] = useState<PaymentWithId[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<StudentCourseFilter>("all");

  const fetchDashboardData = useCallback(async (uid: string, admin: boolean) => {
    const [enrollments, userPayments, adminCourses] = await Promise.all([
      getMyEnrollments(uid),
      getMyPayments(uid).catch(() => [] as PaymentWithId[]),
      admin ? getAllCoursesForAdmin().catch(() => []) : Promise.resolve([]),
    ]);

    if (admin && adminCourses.length > 0) {
      return {
        loaded: mergeAdminCoursesWithEnrollments(adminCourses, enrollments, uid),
        userPayments,
      };
    }

    const loaded: StudentCourseItem[] = [];
    for (const enr of enrollments) {
      try {
        const course = await getCourseByIdForStudent(enr.courseId);
        if (course) {
          loaded.push({ enrollment: enr, course });
        }
      } catch {
        // Cours inaccessible ou supprimé — ignoré sans bloquer le reste
      }
    }

    return { loaded, userPayments };
  }, []);

  useEffect(() => {
    if (authLoading || !user?.uid) return;
    let cancelled = false;

    fetchDashboardData(user.uid, isAdmin)
      .then(({ loaded, userPayments }) => {
        if (!cancelled) {
          setItems(loaded);
          setPayments(userPayments);
          setDataLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("mesFormations.erreur"));
          setDataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, authLoading, isAdmin, fetchDashboardData]);

  const handleRetry = () => {
    if (!user?.uid) return;
    setDataLoading(true);
    setError(null);
    fetchDashboardData(user.uid, isAdmin)
      .then(({ loaded, userPayments }) => {
        setItems(loaded);
        setPayments(userPayments);
        setDataLoading(false);
      })
      .catch(() => {
        setError(t("mesFormations.erreur"));
        setDataLoading(false);
      });
  };

  const stats = useMemo(() => computeStudentStats(items), [items]);
  const filteredItems = useMemo(
    () => filterStudentCourses(items, courseFilter),
    [items, courseFilter]
  );

  const courseTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.course.id, item.course.title);
    }
    return map;
  }, [items]);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "BAYONDY";

  return (
    <StudentShell
      pageTitle={t("mesFormations.titre")}
      pageSubtitle={t("mesFormations.navApprendre")}
    >
      {authLoading || dataLoading ? (
        <div className="space-y-8 animate-pulse" aria-hidden="true">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 h-60 rounded-3xl bg-deep-navy border border-[var(--border-subtle)]" />
            <div className="lg:col-span-4 h-60 rounded-3xl bg-deep-navy border border-[var(--border-subtle)]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-deep-navy border border-red-200 dark:border-red-500/20 shadow-[var(--card-shadow)] my-8 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
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
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--surface-elevated)] hover:border-brand/50 border border-[var(--border-strong)] text-ice-white font-sans text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light cursor-pointer"
            >
              {t("accueil.boutonPrincipal")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Top Bento Hero: 8 cols Dark Obsidian Banner + 4 cols Resume Card */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Theme-adaptive Hero Banner */}
            <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-deep-navy dark:bg-[#0A0B0F] border border-[var(--border-subtle)] dark:border-white/10 p-6 sm:p-8 text-ice-white dark:text-[#F4F5F7] flex flex-col justify-between gap-6 shadow-[var(--card-shadow)] dark:shadow-xl">
              {/* Warm ambient orange glow + delicate dashed orbital ring */}
              <div
                className="pointer-events-none absolute -bottom-24 right-8 w-80 h-80 rounded-full opacity-25 dark:opacity-45 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(229,72,19,0.28) 0%, rgba(186,52,8,0.06) 55%, transparent 75%)",
                }}
                aria-hidden="true"
              />
              <svg
                className="pointer-events-none absolute -top-16 -right-12 w-72 h-72 opacity-50"
                viewBox="0 0 240 240"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="120"
                  cy="120"
                  r="96"
                  className="stroke-slate-900/10 dark:stroke-white/15"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                />
                <circle cx="52" cy="70" r="2.5" className="fill-brand dark:fill-[#FF885C]" />
                <circle cx="176" cy="148" r="2.5" className="fill-brand dark:fill-[#FF5B22]" />
              </svg>

              <div className="relative z-10 space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-light dark:text-[#FF885C]">
                  {t("mesFormations.bonjour")}
                </p>
                <h1 className="font-display font-bold text-2xl sm:text-4xl tracking-tight text-ice-white dark:text-white">
                  {displayName}
                </h1>
                <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-slate-300/80 max-w-lg leading-relaxed">
                  {t("mesFormations.sousTitre")}
                </p>
              </div>

              {/* 3 Real KPI Tiles */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[var(--surface-well)] dark:bg-white/[0.06] border border-[var(--border-subtle)] dark:border-white/10 p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-active)] dark:bg-[#FF5B22]/20 border border-brand/25 dark:border-[#FF5B22]/35 text-brand dark:text-[#FF885C] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t("mesFormations.kpiCours")}
                    </span>
                    <span className="font-display font-bold text-xl sm:text-2xl text-ice-white dark:text-white tabular-nums">
                      {stats.totalCourses}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[var(--surface-well)] dark:bg-white/[0.06] border border-[var(--border-subtle)] dark:border-white/10 p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-deep-navy dark:bg-white/10 border border-[var(--border-subtle)] dark:border-white/15 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t("mesFormations.kpiLecons")}
                    </span>
                    <span className="font-display font-bold text-xl sm:text-2xl text-ice-white dark:text-white tabular-nums">
                      {stats.totalCompletedLessons}
                      <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                        /{stats.totalCourseLessons}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[var(--surface-well)] dark:bg-white/[0.06] border border-[var(--border-subtle)] dark:border-white/10 p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-400/35 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t("mesFormations.kpiProgression")}
                    </span>
                    <span className="font-display font-bold text-xl sm:text-2xl text-amber-700 dark:text-amber-300 tabular-nums">
                      {stats.globalPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Resume Learning Card (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 flex flex-col justify-between gap-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ice-white/55">
                {t("mesFormations.continuerCardTitre")}
              </p>

              {stats.resumeItem ? (
                <>
                  <div className="space-y-3">
                    <h2 className="font-display font-semibold text-lg text-ice-white line-clamp-2 leading-snug">
                      {stats.resumeItem.course.title}
                    </h2>
                    <ProgressBar
                      completedCount={
                        stats.resumeItem.enrollment.progress?.completedLessonIds?.length || 0
                      }
                      totalCount={stats.resumeItem.course.lessonsCount || 0}
                      size="sm"
                    />
                  </div>
                  <Link
                    href={`/mes-formations/${stats.resumeItem.course.slug}`}
                    className="w-full min-h-[46px] px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-[var(--brand-glow)] transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                  >
                    <span>{t("mesFormations.continuer")}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-center text-ice-white/45">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-sans text-sm text-ice-white/60">
                    {t("mesFormations.aucuneLeconDemarree")}
                  </p>
                  <Link
                    href="/formations"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                  >
                    <span>{t("mesFormations.boutonDecouvrir")}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* 01 — MON PARCOURS / MES FORMATIONS */}
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                    01
                  </span>
                  <span className="w-6 h-px bg-brand/50" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ice-white/55">
                    {t("mesFormations.sectionParcours")}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
                  {t("mesFormations.sectionParcoursTitre")}
                </h2>
              </div>

              {/* Segmented Filter Tabs */}
              {items.length > 0 && (
                <div
                  className="inline-flex items-center gap-1 p-1 rounded-full bg-deep-navy border border-[var(--border-subtle)] self-start sm:self-auto"
                  role="group"
                  aria-label={t("mesFormations.sectionParcoursTitre")}
                >
                  {(
                    [
                      { key: "all", label: t("mesFormations.filtreToutes"), count: items.length },
                      {
                        key: "active",
                        label: t("mesFormations.filtreEnCours"),
                        count: items.length - stats.completedCoursesCount,
                      },
                      {
                        key: "completed",
                        label: t("mesFormations.filtreTerminees"),
                        count: stats.completedCoursesCount,
                      },
                    ] as Array<{ key: StudentCourseFilter; label: string; count: number }>
                  ).map((tab) => {
                    const active = courseFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setCourseFilter(tab.key)}
                        aria-pressed={active}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-full font-sans text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                          active
                            ? "bg-[#0F172A] text-white dark:bg-brand dark:text-[var(--brand-fg)]"
                            : "text-ice-white/70 hover:text-ice-white"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className="font-mono text-[11px] opacity-80 tabular-nums">
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
                <div className="w-14 h-14 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-center mb-5 text-brand-light">
                  <PortalSymbol size={32} className="opacity-85" />
                </div>
                <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-2">
                  {t("mesFormations.vide")}
                </h3>
                <p className="font-sans text-sm text-ice-white/65 mb-6 max-w-md leading-relaxed">
                  {t("mesFormations.videDescription")}
                </p>
                <Link
                  href="/formations"
                  className="min-h-[44px] px-6 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center gap-2 shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <span>{t("mesFormations.boutonDecouvrir")}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
                <p className="font-sans text-sm text-ice-white/65">
                  {t("mesFormations.aucunePourFiltre")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const { enrollment, course } = item;
                  const completedCount =
                    enrollment.progress?.completedLessonIds?.length || 0;
                  const totalCount = course.lessonsCount || 0;
                  const duration = formatDuration(course.durationMinutes);
                  const levelKey = `catalogue.niveaux.${course.level}`;
                  const completed = isCourseCompleted(item);

                  return (
                    <article
                      key={enrollment.id}
                      className="group relative flex flex-col rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-brand/45 shadow-[var(--card-shadow)] transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-well)] border-b border-[var(--border-subtle)]">
                        {course.coverUrl ? (
                          <Image
                            src={course.coverUrl}
                            alt={course.title}
                            fill
                            referrerPolicy="no-referrer"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-well)]">
                            <div
                              className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-85"
                              style={{
                                background:
                                  "radial-gradient(circle at 80% 20%, var(--brand-glow) 0%, var(--brand-glow-soft) 45%, transparent 72%)",
                              }}
                              aria-hidden="true"
                            />
                            <PortalSymbol
                              size={48}
                              className="relative z-10 opacity-90 transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-5 flex flex-col justify-between space-y-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-mono text-xs text-ice-white/60 flex-wrap">
                            <span className="uppercase tracking-wider text-brand-light font-semibold">
                              {t(levelKey)}
                            </span>
                            {duration && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{duration}</span>
                              </>
                            )}
                            {completed && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {t("mesFormations.terminee")}
                                </span>
                              </>
                            )}
                          </div>
                          <h3 className="font-display font-semibold text-lg text-ice-white group-hover:text-brand-light transition-colors line-clamp-2 leading-snug">
                            {course.title}
                          </h3>
                        </div>

                        <div className="space-y-4 pt-3 border-t border-[var(--border-faint)]">
                          <ProgressBar
                            completedCount={completedCount}
                            totalCount={totalCount}
                            size="sm"
                          />

                          <Link
                            href={`/mes-formations/${course.slug}`}
                            className="w-full min-h-[44px] px-4 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[var(--brand-glow)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
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
          </section>

          {/* 02 — PROGRESSION */}
          <section className="space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                  02
                </span>
                <span className="w-6 h-px bg-brand/50" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ice-white/55">
                  {t("mesFormations.sectionProgression")}
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
                {t("mesFormations.sectionProgressionTitre")}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Overall pace summary */}
              <div className="lg:col-span-5 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 flex flex-col justify-between gap-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-ice-white/55">
                      {t("mesFormations.progressionGlobale")}
                    </p>
                    <p className="font-display font-bold text-3xl sm:text-4xl text-ice-white tabular-nums mt-1">
                      {stats.globalPercent}%
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-[var(--surface-well)] flex items-center justify-center relative">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke="var(--track-muted)"
                        strokeWidth="5"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke="var(--brand)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={163.36}
                        strokeDashoffset={163.36 - (163.36 * stats.globalPercent) / 100}
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[var(--border-faint)]">
                  <div className="flex items-center justify-between text-xs font-mono text-ice-white/65">
                    <span>{t("mesFormations.leconsCompletees")}</span>
                    <span className="font-semibold text-ice-white tabular-nums">
                      {stats.totalCompletedLessons} / {stats.totalCourseLessons}
                    </span>
                  </div>
                  <ProgressBar
                    completedCount={stats.totalCompletedLessons}
                    totalCount={stats.totalCourseLessons}
                    showText={false}
                    size="md"
                  />
                </div>
              </div>

              {/* Per-course breakdown */}
              <div className="lg:col-span-7 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6">
                {items.length === 0 ? (
                  <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center gap-3">
                    <p className="font-sans text-sm text-ice-white/60">
                      {t("mesFormations.aucunCoursProgression")}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-faint)]">
                    {items.map(({ enrollment, course }) => {
                      const completed =
                        enrollment.progress?.completedLessonIds?.length || 0;
                      const total = course.lessonsCount || 0;
                      const pct = computeCoursePercent(completed, total);
                      return (
                        <div
                          key={course.id}
                          className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <Link
                              href={`/mes-formations/${course.slug}`}
                              className="font-sans font-medium text-sm text-ice-white hover:text-brand-light transition-colors truncate block"
                            >
                              {course.title}
                            </Link>
                            <div className="w-full h-1.5 rounded-full bg-[var(--surface-well)] overflow-hidden">
                              <div
                                className="h-full bg-brand rounded-full transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="shrink-0 text-right font-mono text-xs tabular-nums">
                            <span className="font-semibold text-ice-white block">
                              {pct}%
                            </span>
                            <span className="text-ice-white/55">
                              {completed}/{total}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 03 — PAIEMENTS / TRANSACTIONS */}
          <section className="space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                  03
                </span>
                <span className="w-6 h-px bg-brand/50" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ice-white/55">
                  {t("mesFormations.sectionPaiements")}
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
                {t("mesFormations.sectionPaiementsTitre")}
              </h2>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-3">
                <p className="font-sans text-sm text-ice-white/60">
                  {t("mesFormations.aucunPaiement")}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans min-w-[560px]">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)]">
                        <th className="text-left px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/55">
                          {t("admin.paiements.colStatut")}
                        </th>
                        <th className="text-left px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/55">
                          {t("admin.paiements.colCours")}
                        </th>
                        <th className="text-left px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/55">
                          {t("admin.paiements.colMontant")}
                        </th>
                        <th className="text-left px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/55">
                          {t("admin.paiements.colMethode")}
                        </th>
                        <th className="text-left px-5 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/55">
                          {t("admin.paiements.colDate")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-faint)]">
                      {payments.map((p) => {
                        const statusText = t(`mesFormations.paiementStatut.${p.status}`);
                        const formattedDate = p.createdAt?.toDate
                          ? p.createdAt.toDate().toLocaleDateString("fr-FR")
                          : "—";
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-[var(--surface-subtle)] transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono border ${paymentStatusBadge(
                                  p.status
                                )}`}
                              >
                                {statusText}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-medium text-ice-white max-w-[220px] truncate">
                              {courseTitleMap.get(p.courseId) || p.courseId}
                            </td>
                            <td className="px-5 py-3.5 font-mono font-semibold text-ice-white tabular-nums whitespace-nowrap">
                              {p.amount} {p.currency}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-ice-white/70 uppercase">
                              {p.method}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-ice-white/60 whitespace-nowrap tabular-nums">
                              {formattedDate}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </StudentShell>
  );
}
