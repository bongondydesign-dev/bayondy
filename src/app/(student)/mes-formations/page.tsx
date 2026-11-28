"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  Receipt,
  RotateCcw,
  Search,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
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

function PaymentStatusIndicator({ status }: { status: string }) {
  const label = t(`mesFormations.paiementStatut.${status}`);

  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    case "pending":
    case "awaiting_payment":
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    case "failed":
    case "expired":
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-red-700 dark:text-red-300 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-slate-700 dark:text-ice-white/70 whitespace-nowrap">
          <Receipt className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
  }
}

export default function MesFormationsPage() {
  const { user, loading: authLoading, isAdmin } = useRequireAuth();
  const [items, setItems] = useState<StudentCourseItem[]>([]);
  const [payments, setPayments] = useState<PaymentWithId[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<StudentCourseFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboardData = useCallback(
    async (uid: string, admin: boolean, getToken?: () => Promise<string>) => {
      const [initialEnrollments, initialPayments, adminCourses] = await Promise.all([
        getMyEnrollments(uid),
        getMyPayments(uid).catch(() => [] as PaymentWithId[]),
        admin ? getAllCoursesForAdmin().catch(() => []) : Promise.resolve([]),
      ]);

      let enrollments = initialEnrollments;
      let userPayments = initialPayments;

      // Réconciliation active des paiements MonCash en attente si le webhook n'est pas encore passé
      if (!admin && getToken) {
        const pendingOrders = userPayments
          .filter(
            (p) => p.status === "awaiting_payment" || p.status === "pending"
          )
          .slice(0, 3);

        if (pendingOrders.length > 0) {
          try {
            const idToken = await getToken();
            let shouldRefresh = false;

            await Promise.all(
              pendingOrders.map(async (p) => {
                const orderId = p.orderId || p.merchantReference || p.id;
                if (!orderId) return;
                try {
                  const res = await fetch("/api/moncash/verify", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({ orderId }),
                  });
                  if (!res.ok) return;
                  const data = (await res.json().catch(() => null)) as {
                    status?: string;
                  } | null;
                  if (data?.status === "paid" || data?.status === "failed") {
                    shouldRefresh = true;
                  }
                } catch {
                  // Ignorer les erreurs réseau individuelles sans bloquer le tableau de bord
                }
              })
            );

            if (shouldRefresh) {
              const [refreshedEnrollments, refreshedPayments] = await Promise.all([
                getMyEnrollments(uid),
                getMyPayments(uid).catch(() => userPayments),
              ]);
              enrollments = refreshedEnrollments;
              userPayments = refreshedPayments;
            }
          } catch {
            // Ignorer si le jeton n'a pas pu être récupéré
          }
        }
      }

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
    },
    []
  );

  useEffect(() => {
    if (authLoading || !user?.uid) return;
    let cancelled = false;

    fetchDashboardData(user.uid, isAdmin, () => user.getIdToken())
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
  }, [user, authLoading, isAdmin, fetchDashboardData]);

  const handleRetry = () => {
    if (!user?.uid) return;
    setDataLoading(true);
    setError(null);
    fetchDashboardData(user.uid, isAdmin, () => user.getIdToken())
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
    () => filterStudentCourses(items, courseFilter, searchQuery),
    [items, courseFilter, searchQuery]
  );

  const courseTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.course.id, item.course.title);
    }
    return map;
  }, [items]);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "BAYONDY";
  const ringCircumference = 163.36;

  return (
    <StudentShell
      pageTitle={t("mesFormations.titre")}
      pageSubtitle={t("mesFormations.navApprendre")}
    >
      {authLoading || dataLoading ? (
        <div className="space-y-8 animate-pulse" aria-hidden="true">
          <div className="h-52 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-72 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]"
                />
              ))}
            </div>
            <div className="xl:col-span-4 h-72 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-deep-navy border border-red-200 dark:border-red-500/20 shadow-[var(--card-shadow)] my-8 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="font-sans text-sm text-slate-700 dark:text-ice-white/80 mb-6">{error}</p>
          {user?.uid && (
            <button
              type="button"
              onClick={handleRetry}
              className="min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--surface-elevated)] hover:border-brand/50 border border-[var(--border-strong)] text-ice-white font-sans text-sm inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t("mesFormations.boutonDecouvrir")}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Clean Canvas Greeting Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-light">
                {t("mesFormations.bonjour")}
              </p>
              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2rem] tracking-tight text-ice-white truncate">
                {displayName}
              </h1>
              <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-ice-white/70 max-w-xl leading-relaxed">
                {stats.resumeItem
                  ? `${t("mesFormations.continuerCardTitre")} · ${stats.resumeItem.course.title}`
                  : t("mesFormations.sousTitre")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {stats.resumeItem ? (
                <Link
                  href={`/mes-formations/${stats.resumeItem.course.slug}`}
                  className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#111318] hover:bg-[#1E222B] dark:bg-brand dark:hover:bg-brand-light text-white dark:text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap shrink-0"
                >
                  <PlayCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t("mesFormations.continuer")}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href="/formations"
                  className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#111318] hover:bg-[#1E222B] dark:bg-brand dark:hover:bg-brand-light text-white dark:text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap shrink-0"
                >
                  <span>{t("mesFormations.boutonDecouvrir")}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          {/* Finexy-inspired Bento KPI Row: Coral Anchor Card + 3 Crisp Metric Cards */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* Hero KPI Tile: Global Progress */}
            <div className="md:col-span-5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 text-white bg-gradient-to-br from-[#FF6A36] via-[#F04E18] to-[#D63E0C] shadow-[0_12px_28px_-10px_rgba(240,78,24,0.45)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/85 block">
                    {t("mesFormations.kpiProgression")}
                  </span>
                  <span className="font-display font-bold text-3xl sm:text-4xl text-white tabular-nums mt-1.5 block leading-none">
                    {stats.globalPercent}%
                  </span>
                </div>
                <span className="w-10 h-10 rounded-full bg-white/18 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" aria-hidden="true" />
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-full h-2 rounded-full bg-white/25 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${stats.globalPercent}%` }}
                  />
                </div>
                <p className="font-mono text-xs text-white/90 tabular-nums">
                  {stats.totalCompletedLessons} / {stats.totalCourseLessons}{" "}
                  {t("mesFormations.leconsCompletees")}
                </p>
              </div>
            </div>

            {/* 3 Crisp Secondary KPI Tiles */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans font-medium text-xs sm:text-sm text-slate-600 dark:text-ice-white/75">
                    {t("mesFormations.kpiCours")}
                  </span>
                  <span className="w-9 h-9 rounded-full bg-[var(--surface-well)] border border-[var(--border-faint)] text-brand flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
                <div>
                  <span className="font-display font-bold text-3xl text-ice-white tabular-nums block leading-none">
                    {stats.totalCourses}
                  </span>
                  <span className="mt-2 font-mono text-xs text-slate-500 dark:text-ice-white/55 tabular-nums block">
                    {stats.completedCoursesCount} {t("mesFormations.filtreTerminees").toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans font-medium text-xs sm:text-sm text-slate-600 dark:text-ice-white/75">
                    {t("mesFormations.kpiLecons")}
                  </span>
                  <span className="w-9 h-9 rounded-full bg-[var(--surface-well)] border border-[var(--border-subtle)] text-slate-700 dark:text-ice-white/75 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-3xl text-ice-white tabular-nums leading-none">
                      {stats.totalCompletedLessons}
                    </span>
                    <span className="font-mono text-sm text-slate-500 dark:text-ice-white/55 tabular-nums">
                      / {stats.totalCourseLessons}
                    </span>
                  </div>
                  <span className="mt-2 font-mono text-xs text-slate-500 dark:text-ice-white/55 block truncate">
                    {t("mesFormations.leconsCompletees")}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans font-medium text-xs sm:text-sm text-slate-600 dark:text-ice-white/75">
                    {t("mesFormations.filtreTerminees")}
                  </span>
                  <span className="w-9 h-9 rounded-full bg-[var(--surface-well)] border border-[var(--border-faint)] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
                <div>
                  <span className="font-display font-bold text-3xl text-ice-white tabular-nums block leading-none">
                    {stats.completedCoursesCount}
                  </span>
                  <span className="mt-2 font-mono text-xs text-slate-500 dark:text-ice-white/55 tabular-nums block">
                    {stats.totalCourses - stats.completedCoursesCount}{" "}
                    {t("mesFormations.filtreEnCours").toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 12-Column Workspace: Enrolled Courses (8 cols) + Learning Pace & Shortcuts (4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* 01 — MY COURSES */}
            <section className="xl:col-span-8 space-y-5">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                      01
                    </span>
                    <span className="w-6 h-px bg-brand/50" aria-hidden="true" />
                    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/55">
                      {t("mesFormations.sectionParcours")}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-2xl tracking-tight text-ice-white">
                    {t("mesFormations.sectionParcoursTitre")}
                  </h2>
                </div>

                {items.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div
                      className="inline-flex items-center gap-1 p-1 rounded-full bg-white dark:bg-deep-navy border border-[var(--border-strong)] dark:border-[var(--border-subtle)] shadow-2xs dark:shadow-none self-start"
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
                            className={`min-h-[38px] px-3.5 py-1.5 rounded-full font-sans text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                              active
                                ? "bg-[#111318] text-white dark:bg-brand dark:text-[var(--brand-fg)]"
                                : "text-slate-600 dark:text-ice-white/70 hover:text-ice-white"
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

                    <div className="relative w-full sm:w-64">
                      <Search
                        className="w-4 h-4 text-slate-500 dark:text-ice-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("mesFormations.rechercher")}
                        aria-label={t("mesFormations.rechercher")}
                        className="w-full min-h-[42px] pl-10 pr-4 py-2 rounded-full bg-white dark:bg-deep-navy border border-[var(--border-strong)] dark:border-[var(--border-subtle)] shadow-2xs dark:shadow-none text-ice-white placeholder:text-slate-500 dark:placeholder:text-ice-white/45 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
                      />
                    </div>
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
                  <p className="font-sans text-sm text-slate-700 dark:text-ice-white/65 mb-6 max-w-md leading-relaxed">
                    {t("mesFormations.videDescription")}
                  </p>
                  <Link
                    href="/formations"
                    className="min-h-[44px] px-6 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center gap-2 shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap"
                  >
                    <span>{t("mesFormations.boutonDecouvrir")}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-4">
                  <p className="font-sans text-sm text-slate-700 dark:text-ice-white/65">
                    {t("mesFormations.aucunePourFiltre")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCourseFilter("all");
                      setSearchQuery("");
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-well)] hover:border-brand/50 text-ice-white font-sans text-xs font-medium inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t("catalogue.reinitialiserFiltres")}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        className="group flex flex-col rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-brand/45 shadow-[var(--card-shadow)] transition-all duration-300 overflow-hidden"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-well)] border-b border-[var(--border-subtle)]">
                          {course.coverUrl ? (
                            <Image
                              src={course.coverUrl}
                              alt={course.title}
                              fill
                              referrerPolicy="no-referrer"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
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
                                size={44}
                                className="relative z-10 opacity-90 transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-5 flex flex-col justify-between space-y-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-ice-white/60 flex-wrap">
                              <span className="uppercase tracking-wider text-brand-light font-semibold">
                                {t(levelKey)}
                              </span>
                              {duration && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">{duration}</span>
                                </>
                              )}
                              {completed && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>{t("mesFormations.terminee")}</span>
                                  </span>
                                </>
                              )}
                            </div>

                            <h3 className="font-display font-semibold text-lg text-ice-white group-hover:text-brand-light transition-colors line-clamp-2 leading-snug">
                              {course.title}
                            </h3>

                            {course.shortDescription && (
                              <p className="font-sans text-xs sm:text-sm text-slate-700 dark:text-ice-white/65 line-clamp-2 leading-relaxed">
                                {course.shortDescription}
                              </p>
                            )}
                          </div>

                          <div className="space-y-4 pt-3 border-t border-[var(--border-subtle)]">
                            <ProgressBar
                              completedCount={completedCount}
                              totalCount={totalCount}
                              size="sm"
                            />

                            <Link
                              href={`/mes-formations/${course.slug}`}
                              className="w-full min-h-[44px] px-4 py-2.5 rounded-full bg-[#111318] hover:bg-[#1E222B] dark:bg-brand dark:hover:bg-brand-light text-white dark:text-[var(--brand-fg)] font-sans font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap"
                            >
                              <span>{t("mesFormations.continuer")}</span>
                              <ArrowRight
                                className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0"
                                aria-hidden="true"
                              />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 02 — LEARNING PACE & SHORTCUTS */}
            <aside className="xl:col-span-4 space-y-5">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                    02
                  </span>
                  <span className="w-6 h-px bg-brand/50" aria-hidden="true" />
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/55">
                    {t("mesFormations.sectionProgression")}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl tracking-tight text-ice-white">
                  {t("mesFormations.sectionProgressionTitre")}
                </h2>
              </div>

              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-ice-white/55">
                      {t("mesFormations.progressionGlobale")}
                    </p>
                    <p className="font-display font-bold text-3xl text-ice-white tabular-nums mt-1">
                      {stats.globalPercent}%
                    </p>
                    <p className="font-mono text-xs text-slate-600 dark:text-ice-white/60 tabular-nums mt-1">
                      {stats.totalCompletedLessons} / {stats.totalCourseLessons}{" "}
                      {t("mesFormations.leconsCompletees")}
                    </p>
                  </div>

                  <div className="w-16 h-16 shrink-0 flex items-center justify-center relative">
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
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={
                          ringCircumference - (ringCircumference * stats.globalPercent) / 100
                        }
                      />
                    </svg>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)]">
                  {items.length === 0 ? (
                    <p className="font-sans text-sm text-slate-700 dark:text-ice-white/60 leading-relaxed">
                      {t("mesFormations.aucunCoursProgression")}
                    </p>
                  ) : (
                    <div className="divide-y divide-[var(--border-subtle)]">
                      {items.map(({ enrollment, course }) => {
                        const completed =
                          enrollment.progress?.completedLessonIds?.length || 0;
                        const total = course.lessonsCount || 0;
                        const pct = computeCoursePercent(completed, total);
                        return (
                          <Link
                            key={course.id}
                            href={`/mes-formations/${course.slug}`}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg"
                          >
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <span className="font-sans font-medium text-sm text-ice-white group-hover:text-brand-light transition-colors truncate block">
                                {course.title}
                              </span>
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
                              <span className="text-slate-600 dark:text-ice-white/55">
                                {completed}/{total}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Quick Links */}
              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] divide-y divide-[var(--border-subtle)] overflow-hidden">
                <Link
                  href="/profil"
                  className="px-5 py-3.5 min-h-[48px] flex items-center justify-between gap-3 hover:bg-[var(--surface-subtle)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <span className="flex items-center gap-3 font-sans text-sm font-medium text-ice-white min-w-0">
                    <User className="w-4 h-4 text-brand-light shrink-0" aria-hidden="true" />
                    <span className="truncate">{t("mesFormations.navProfil")}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 dark:text-ice-white/45 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  href="/formations"
                  className="px-5 py-3.5 min-h-[48px] flex items-center justify-between gap-3 hover:bg-[var(--surface-subtle)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <span className="flex items-center gap-3 font-sans text-sm font-medium text-ice-white min-w-0">
                    <BookOpen className="w-4 h-4 text-brand-light shrink-0" aria-hidden="true" />
                    <span className="truncate">{t("mesFormations.navCatalogue")}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 dark:text-ice-white/45 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>

          {/* 03 — TRANSACTIONS */}
          <section className="space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                  03
                </span>
                <span className="w-6 h-px bg-brand/50" aria-hidden="true" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/55">
                  {t("mesFormations.sectionPaiements")}
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl tracking-tight text-ice-white">
                {t("mesFormations.sectionPaiementsTitre")}
              </h2>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
                <p className="font-sans text-sm text-slate-700 dark:text-ice-white/60">
                  {t("mesFormations.aucunPaiement")}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans min-w-[560px]">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--surface-well)]">
                        <th className="text-left px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-ice-white/55">
                          {t("admin.paiements.colStatut")}
                        </th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-ice-white/55">
                          {t("admin.paiements.colCours")}
                        </th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-ice-white/55">
                          {t("admin.paiements.colMontant")}
                        </th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-ice-white/55">
                          {t("admin.paiements.colMethode")}
                        </th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-ice-white/55">
                          {t("admin.paiements.colDate")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {payments.map((p) => {
                        const formattedDate = p.createdAt?.toDate
                          ? p.createdAt.toDate().toLocaleDateString("fr-FR")
                          : "—";
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-[var(--surface-subtle)] transition-colors"
                          >
                            <td className="px-5 py-3">
                              <PaymentStatusIndicator status={p.status} />
                            </td>
                            <td className="px-5 py-3 font-medium text-ice-white max-w-[240px] truncate">
                              {courseTitleMap.get(p.courseId) || p.courseId}
                            </td>
                            <td className="px-5 py-3 font-mono font-semibold text-ice-white tabular-nums whitespace-nowrap">
                              {p.amount} {p.currency}
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-slate-700 dark:text-ice-white/70 uppercase">
                              {p.method}
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-ice-white/60 whitespace-nowrap tabular-nums">
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
