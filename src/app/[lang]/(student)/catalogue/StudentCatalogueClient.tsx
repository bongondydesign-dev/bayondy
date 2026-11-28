"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  RotateCcw,
  Search,
  ShoppingBag,
} from "lucide-react";
import type { CourseLanguage, CourseLevel, PublicCourse } from "@/types/firestore";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { StudentShell } from "@/components/student/StudentShell";
import { PriceTag } from "@/components/course/PriceTag";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { extractCatalogFilterOptions } from "@/lib/courses/catalog";
import { formatDuration } from "@/lib/courses/format";
import {
  computeStudentMarketplaceSummary,
  filterStudentMarketplaceCourses,
  isCourseOwnedByStudent,
  type StudentMarketplaceAvailability,
} from "@/lib/learning/catalog";
import {
  getAllCoursesForAdmin,
  getMyEnrollments,
  getPublishedCoursesClient,
} from "@/lib/learning/queries";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface StudentCatalogueClientProps {
  initialCourses: PublicCourse[];
}

export function StudentCatalogueClient({
  initialCourses,
}: StudentCatalogueClientProps) {
  const { lang, t, localize } = useI18n();
  const { user, loading: authLoading, isAdmin } = useRequireAuth();

  const [courses, setCourses] = useState<PublicCourse[]>(initialCourses);
  const [ownedCourseIds, setOwnedCourseIds] = useState<Set<string>>(new Set());
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availability, setAvailability] =
    useState<StudentMarketplaceAvailability>("all");
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "all">("all");
  const [selectedLanguage, setSelectedLanguage] = useState<CourseLanguage | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const loadCatalogData = useCallback(
    async (uid: string, admin: boolean) => {
      const [enrollments, clientCourses] = await Promise.all([
        getMyEnrollments(uid),
        initialCourses.length > 0 && !admin
          ? Promise.resolve(initialCourses)
          : (admin
              ? getAllCoursesForAdmin().then((list) =>
                  list
                    .filter((c) => c.status === "published")
                    .map(
                      (c): PublicCourse => ({
                        id: c.id,
                        slug: c.slug,
                        title: c.title,
                        shortDescription: c.shortDescription,
                        description: c.description,
                        priceUSD: c.priceUSD ?? null,
                        priceHTG: c.priceHTG ?? null,
                        coverUrl: c.coverUrl ?? null,
                        level: c.level ?? "debutant",
                        language: c.language ?? "ht",
                        durationMinutes: c.durationMinutes ?? 0,
                        lessonsCount: c.lessonsCount ?? 0,
                        syllabus: Array.isArray(c.syllabus) ? c.syllabus : [],
                      })
                    )
                )
              : getPublishedCoursesClient()
            ).catch(() => initialCourses),
      ]);

      const nextOwned = new Set<string>();
      for (const enr of enrollments) {
        if (enr.status === "active" && enr.courseId) {
          nextOwned.add(enr.courseId);
        }
      }

      return {
        nextCourses: clientCourses.length > 0 ? clientCourses : initialCourses,
        nextOwned,
      };
    },
    [initialCourses]
  );

  useEffect(() => {
    if (authLoading || !user?.uid) return;
    let cancelled = false;

    loadCatalogData(user.uid, isAdmin)
      .then(({ nextCourses, nextOwned }) => {
        if (!cancelled) {
          setCourses(nextCourses);
          setOwnedCourseIds(nextOwned);
          setDataLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("catalogueClient.erreurChargement"));
          setDataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.uid, isAdmin, loadCatalogData, t]);

  const handleRetry = () => {
    if (!user?.uid) return;
    setDataLoading(true);
    setError(null);
    loadCatalogData(user.uid, isAdmin)
      .then(({ nextCourses, nextOwned }) => {
        setCourses(nextCourses);
        setOwnedCourseIds(nextOwned);
        setDataLoading(false);
      })
      .catch(() => {
        setError(t("catalogueClient.erreurChargement"));
        setDataLoading(false);
      });
  };

  const { levels, languages } = useMemo(
    () => extractCatalogFilterOptions(courses),
    [courses]
  );

  const summary = useMemo(
    () => computeStudentMarketplaceSummary(courses, ownedCourseIds, isAdmin),
    [courses, ownedCourseIds, isAdmin]
  );

  const filteredCourses = useMemo(
    () =>
      filterStudentMarketplaceCourses(courses, {
        ownedCourseIds,
        isAdmin,
        availability,
        level: selectedLevel,
        language: selectedLanguage,
        query: searchQuery,
      }),
    [
      courses,
      ownedCourseIds,
      isAdmin,
      availability,
      selectedLevel,
      selectedLanguage,
      searchQuery,
    ]
  );

  const hasActiveFilter =
    availability !== "all" ||
    selectedLevel !== "all" ||
    selectedLanguage !== "all" ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setAvailability("all");
    setSelectedLevel("all");
    setSelectedLanguage("all");
    setSearchQuery("");
  };

  return (
    <StudentShell
      pageTitle={t("catalogueClient.titre")}
      pageSubtitle={t("mesFormations.navApprendre")}
    >
      {authLoading || dataLoading ? (
        <div className="space-y-6 animate-pulse" aria-hidden="true">
          <div className="h-24 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          <div className="h-16 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]"
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-deep-navy border border-red-200 dark:border-red-500/20 shadow-[var(--card-shadow)] my-8 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="font-sans text-sm text-slate-700 dark:text-ice-white/80 mb-6">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="min-h-[44px] px-6 py-2.5 rounded-full bg-[var(--surface-elevated)] hover:border-brand/50 border border-[var(--border-strong)] text-ice-white font-sans text-sm inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{t("catalogueClient.reessayer")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* En-tête catalogue client */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-light">
                {t("catalogue.badge")}
              </p>
              <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white text-balance">
                {t("catalogueClient.titre")}
              </h1>
              <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-ice-white/70 max-w-2xl leading-relaxed">
                {t("catalogueClient.sousTitre")}
              </p>
            </div>

            {courses.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-slate-600 dark:text-ice-white/65 tabular-nums shrink-0">
                <span>
                  <strong className="text-ice-white font-semibold">
                    {summary.availableCount}
                  </strong>{" "}
                  {t("catalogueClient.disponiblesCount")}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="text-brand-light font-semibold">
                    {summary.ownedCount}
                  </strong>{" "}
                  {t("catalogueClient.dejaAcquises")}
                </span>
              </div>
            )}
          </div>

          {/* Barre d'outils : disponibilité + recherche + niveau + langue */}
          {courses.length > 0 && (
            <section
              aria-label={t("catalogueClient.titre")}
              className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 min-w-0"
            >
              <div
                className="grid grid-cols-3 sm:inline-flex items-center gap-1 p-1 rounded-2xl sm:rounded-full bg-[var(--surface-well)] border border-[var(--border-subtle)] w-full sm:w-auto sm:self-start shrink-0"
                role="group"
                aria-label={t("catalogueClient.titre")}
              >
                {(
                  [
                    {
                      key: "all",
                      label: t("catalogueClient.filtreToutes"),
                      count: summary.totalCount,
                    },
                    {
                      key: "available",
                      label: t("catalogueClient.filtreDisponibles"),
                      count: summary.availableCount,
                    },
                    {
                      key: "owned",
                      label: t("catalogueClient.filtreMesAcces"),
                      count: summary.ownedCount,
                    },
                  ] as Array<{
                    key: StudentMarketplaceAvailability;
                    label: string;
                    count: number;
                  }>
                ).map((tab) => {
                  const active = availability === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setAvailability(tab.key)}
                      aria-pressed={active}
                      className={`min-h-[40px] px-2 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full font-sans text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-colors cursor-pointer min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                        active
                          ? "bg-[#111318] text-white dark:bg-brand dark:text-[var(--brand-fg)]"
                          : "text-slate-600 dark:text-ice-white/70 hover:text-ice-white"
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      <span className="font-mono text-[11px] opacity-80 tabular-nums shrink-0">
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 flex-1 xl:justify-end min-w-0">
                <div className="relative w-full sm:flex-1 sm:min-w-[180px] sm:max-w-xs">
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
                    className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[var(--surface-well)] border border-[var(--border-strong)] dark:border-[var(--border-subtle)] text-ice-white placeholder:text-slate-500 dark:placeholder:text-ice-white/45 font-sans text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
                  />
                </div>

                {levels.length > 0 && (
                  <select
                    value={selectedLevel}
                    onChange={(e) =>
                      setSelectedLevel(e.target.value as CourseLevel | "all")
                    }
                    aria-label={t("catalogue.filtreNiveau")}
                    className="w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-[var(--surface-well)] border border-[var(--border-strong)] dark:border-[var(--border-subtle)] text-ice-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-light cursor-pointer"
                  >
                    <option value="all">{t("catalogueClient.tousNiveaux")}</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {t(`catalogue.niveaux.${level}`)}
                      </option>
                    ))}
                  </select>
                )}

                {languages.length > 0 && (
                  <select
                    value={selectedLanguage}
                    onChange={(e) =>
                      setSelectedLanguage(e.target.value as CourseLanguage | "all")
                    }
                    aria-label={t("catalogue.filtreLangue")}
                    className="w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-[var(--surface-well)] border border-[var(--border-strong)] dark:border-[var(--border-subtle)] text-ice-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-light cursor-pointer"
                  >
                    <option value="all">{t("catalogueClient.toutesLangues")}</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {t(`catalogue.langues.${language}`)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </section>
          )}

          {/* Grille des formations */}
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-10 sm:p-14 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-center mb-5 text-brand-light">
                <PortalSymbol size={32} className="opacity-85" />
              </div>
              <h2 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-2">
                {t("catalogue.vide")}
              </h2>
              <p className="font-sans text-sm text-slate-700 dark:text-ice-white/65 max-w-md leading-relaxed">
                {t("catalogue.videDescription")}
              </p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-8 sm:p-10 text-center rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-4">
              <p className="font-display font-semibold text-lg text-ice-white">
                {t("catalogue.aucunResultat")}
              </p>
              <p className="font-sans text-sm text-slate-700 dark:text-ice-white/65 max-w-md mx-auto">
                {t("catalogue.aucunResultatDescription")}
              </p>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="min-h-[44px] px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark text-[var(--brand-fg)] font-sans text-sm font-semibold inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>{t("catalogue.reinitialiserFiltres")}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCourses.map((course) => {
                const owned = isCourseOwnedByStudent(
                  course.id,
                  ownedCourseIds,
                  isAdmin
                );
                const enrolledSpecifically = ownedCourseIds.has(course.id);
                const detailHref = localize(`/catalogue/${course.slug}`);
                const playerHref = localize(`/mes-formations/${course.slug}`);
                const durationText = formatDuration(course.durationMinutes);
                const levelLabel = course.level
                  ? t(`catalogue.niveaux.${course.level}`)
                  : "";
                const lessonsText =
                  course.lessonsCount > 0
                    ? `${course.lessonsCount} ${
                        course.lessonsCount > 1
                          ? t("catalogue.lecons")
                          : t("catalogue.leconSingulier")
                      }`
                    : "";
                const metaParts = [levelLabel, durationText, lessonsText].filter(
                  Boolean
                );

                return (
                  <article
                    key={course.id}
                    className="group min-w-0 flex flex-col rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-brand/45 shadow-[var(--card-shadow)] transition-all duration-200 overflow-hidden"
                  >
                    <Link
                      href={detailHref}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="relative aspect-video w-full overflow-hidden bg-[var(--surface-well)] border-b border-[var(--border-subtle)] block"
                    >
                      {course.coverUrl ? (
                        <Image
                          src={course.coverUrl}
                          alt={course.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          referrerPolicy="no-referrer"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-well)]">
                          <div
                            className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-75"
                            style={{
                              background:
                                "radial-gradient(circle at 80% 20%, var(--brand-glow) 0%, var(--brand-glow-soft) 45%, transparent 72%)",
                            }}
                            aria-hidden="true"
                          />
                          <PortalSymbol
                            size={48}
                            className="relative z-10 opacity-90 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between space-y-4 sm:space-y-5">
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 font-mono text-xs text-slate-600 dark:text-ice-white/60 tabular-nums">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                            {metaParts.map((part, idx) => (
                              <React.Fragment key={`${course.id}-${part}-${idx}`}>
                                {idx > 0 && <span aria-hidden="true">·</span>}
                                <span
                                  className={
                                    idx === 0
                                      ? "uppercase tracking-wider text-brand-light font-semibold"
                                      : undefined
                                  }
                                >
                                  {part}
                                </span>
                              </React.Fragment>
                            ))}
                          </div>
                          {owned && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold whitespace-nowrap shrink-0">
                              <CheckCircle2
                                className="w-3.5 h-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span>
                                {isAdmin && !enrolledSpecifically
                                  ? t("catalogueClient.statutAccesAdmin")
                                  : t("catalogueClient.statutAccesActif")}
                              </span>
                            </span>
                          )}
                        </div>

                        <h2 className="font-display font-bold text-lg text-ice-white group-hover:text-brand-light transition-colors line-clamp-2 leading-snug break-words">
                          <Link
                            href={detailHref}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded"
                          >
                            {course.title}
                          </Link>
                        </h2>

                        {course.shortDescription && (
                          <p className="font-sans text-xs sm:text-sm text-slate-700 dark:text-ice-white/65 line-clamp-2 leading-relaxed">
                            {course.shortDescription}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3 min-w-0">
                        {!owned && (
                          <PriceTag
                            priceUSD={course.priceUSD}
                            priceHTG={course.priceHTG}
                            size="sm"
                            lang={lang}
                          />
                        )}

                        {owned ? (
                          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 min-w-0">
                            <Link
                              href={playerHref}
                              className="flex-1 min-w-0 min-h-[44px] px-4 py-2.5 rounded-full bg-[#111318] hover:bg-[#1E222B] dark:bg-brand dark:hover:bg-brand-light text-white dark:text-[var(--brand-fg)] font-sans font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                            >
                              <PlayCircle
                                className="w-4 h-4 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">
                                {t("catalogueClient.boutonContinuerCours")}
                              </span>
                            </Link>
                            <Link
                              href={detailHref}
                              className="min-h-[44px] px-4 py-2.5 rounded-full bg-white dark:bg-[var(--surface-well)] hover:bg-[var(--surface-well)] dark:hover:bg-[var(--surface-subtle)] border border-[var(--border-strong)] dark:border-[var(--border-subtle)] text-ice-white font-sans font-medium text-xs sm:text-sm inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
                            >
                              {t("catalogueClient.boutonProgramme")}
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={detailHref}
                            className="w-full min-w-0 min-h-[46px] px-4 sm:px-5 py-2.5 rounded-full bg-gradient-to-b from-[#FF652E] to-brand hover:brightness-105 text-[var(--brand-fg)] font-sans font-semibold text-sm flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_6px_18px_-4px_var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                          >
                            <ShoppingBag
                              className="w-4 h-4 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {t("catalogueClient.boutonAcheterVoir")}
                            </span>
                            <ArrowRight
                              className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </StudentShell>
  );
}
