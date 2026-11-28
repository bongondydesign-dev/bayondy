"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { LessonList } from "@/components/player/LessonList";
import { LessonComments } from "@/components/player/LessonComments";
import { ProgressBar } from "@/components/player/ProgressBar";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { formatDuration } from "@/lib/courses/format";
import { hasCourseAccess } from "@/lib/learning/access";
import {
  getCourseBySlugForStudent,
  getEnrollment,
  getCourseLessons,
  saveProgress,
  saveProgressViaApi,
  type CourseWithId,
  type LessonWithId,
} from "@/lib/learning/queries";
import {
  clearLocalProgressFallback,
  getBrowserLocalStorage,
  hasUnsyncedFallbackLessons,
  mergeProgressWithFallback,
  normalizeProgress,
  readLocalProgressFallback,
  writeLocalProgressFallback,
} from "@/lib/learning/progress";
import { MAX_COMPLETED_LESSONS, type EnrollmentProgress } from "@/types/firestore";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface PlayerViewProps {
  slug: string;
}

export function PlayerView({ slug }: PlayerViewProps) {
  const { lang, t, localize } = useI18n();
  const { user, loading: authLoading, isAdmin } = useRequireAuth();

  const [course, setCourse] = useState<CourseWithId | null>(null);
  const [lessons, setLessons] = useState<LessonWithId[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [hasActiveEnrollment, setHasActiveEnrollment] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);

  const [dataLoading, setDataLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const uid = user?.uid ?? null;

  const persistProgress = React.useCallback(
    async (
      targetCourseId: string,
      nextProgress: EnrollmentProgress,
      activeEnrolled: boolean,
      activeEnrollmentId: string | null
    ): Promise<void> => {
      if (!user || !uid) {
        throw new Error(t("lecteur.erreurEnregistrement"));
      }

      const storage = getBrowserLocalStorage();
      const normalized = normalizeProgress(nextProgress);

      if (activeEnrolled) {
        try {
          await saveProgress(
            uid,
            targetCourseId,
            normalized,
            lang,
            activeEnrollmentId ?? undefined
          );
          clearLocalProgressFallback(storage, uid, targetCourseId);
          return;
        } catch {
          // Fallback serveur si la règle client bloque (ex. document sans champ source ou id non canonique)
        }
      }

      try {
        const idToken = await user.getIdToken();
        const apiRes = await saveProgressViaApi({
          idToken,
          courseId: targetCourseId,
          progress: normalized,
        });

        if (apiRes.ok) {
          setHasActiveEnrollment(true);
          if (apiRes.enrollmentId) {
            setEnrollmentId(apiRes.enrollmentId);
          }
          clearLocalProgressFallback(storage, uid, targetCourseId);
          return;
        }

        if (isAdmin || apiRes.status === 503 || apiRes.status === 0) {
          writeLocalProgressFallback(storage, uid, targetCourseId, normalized);
          return;
        }

        throw new Error(apiRes.error || t("lecteur.erreurEnregistrement"));
      } catch (err) {
        if (isAdmin) {
          writeLocalProgressFallback(storage, uid, targetCourseId, normalized);
          return;
        }
        throw err;
      }
    },
    [user, uid, lang, isAdmin, t]
  );

  // Chargement sécurisé : Cours -> Inscription (ou accès admin) -> Leçons
  useEffect(() => {
    if (authLoading || !uid) return;
    let cancelled = false;

    async function loadData() {
      try {
        const courseDoc = await getCourseBySlugForStudent(slug, isAdmin);
        if (cancelled) return;
        if (!courseDoc) {
          setNotEnrolled(true);
          setDataLoading(false);
          return;
        }
        setCourse(courseDoc);

        const enrollDoc = await getEnrollment(uid!, courseDoc.id).catch(() => null);
        if (cancelled) return;

        const enrolledActive = enrollDoc?.status === "active";
        setHasActiveEnrollment(enrolledActive);
        setEnrollmentId(enrollDoc?.id ?? null);

        if (!hasCourseAccess({ isAdmin, enrollmentStatus: enrollDoc?.status })) {
          setNotEnrolled(true);
          setDataLoading(false);
          return;
        }

        const storage = getBrowserLocalStorage();
        const localFallback = readLocalProgressFallback(storage, uid!, courseDoc.id);
        const mergedProgress = mergeProgressWithFallback(enrollDoc?.progress, localFallback);
        setCompletedLessonIds(mergedProgress.completedLessonIds);

        if (
          localFallback &&
          hasUnsyncedFallbackLessons(enrollDoc?.progress, localFallback) &&
          user
        ) {
          user
            .getIdToken()
            .then((idToken) =>
              saveProgressViaApi({
                idToken,
                courseId: courseDoc.id,
                progress: mergedProgress,
              })
            )
            .then((res) => {
              if (!cancelled && res.ok) {
                setHasActiveEnrollment(true);
                if (res.enrollmentId) setEnrollmentId(res.enrollmentId);
                clearLocalProgressFallback(storage, uid!, courseDoc.id);
              }
            })
            .catch(() => undefined);
        } else if (localFallback && enrolledActive) {
          clearLocalProgressFallback(storage, uid!, courseDoc.id);
        }

        try {
          const lessonList = await getCourseLessons(courseDoc.id);
          if (cancelled) return;
          setLessons(lessonList);

          if (lessonList.length > 0) {
            const savedLastId = mergedProgress.lastLessonId;
            const validSavedLesson = lessonList.find((l) => l.id === savedLastId);
            setCurrentLessonId(validSavedLesson ? validSavedLesson.id : lessonList[0].id);
          }
        } catch (lessonErr: unknown) {
          if (cancelled) return;
          const errorCode =
            lessonErr &&
            typeof lessonErr === "object" &&
            "code" in lessonErr &&
            typeof (lessonErr as { code?: unknown }).code === "string"
              ? (lessonErr as { code: string }).code
              : "unknown";

          if (process.env.NODE_ENV === "development") {
            console.warn("[PlayerView] Erreur chargement leçons (code):", errorCode);
          }

          if (errorCode === "permission-denied") {
            setNotEnrolled(true);
          } else {
            setSaveError(t("lecteur.erreur"));
          }
        }
      } catch {
        if (!cancelled) {
          setNotEnrolled(true);
        }
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, uid, authLoading, isAdmin]);

  const currentLessonIndex = useMemo(() => {
    if (lessons.length === 0) return -1;
    const idx = lessons.findIndex((l) => l.id === currentLessonId);
    return idx >= 0 ? idx : 0;
  }, [lessons, currentLessonId]);

  const currentLesson = useMemo(() => {
    if (currentLessonIndex < 0) return undefined;
    return lessons[currentLessonIndex];
  }, [lessons, currentLessonIndex]);

  const previousLesson =
    currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;

  const validCompletedCount = useMemo(() => {
    const lessonIdSet = new Set(lessons.map((l) => l.id));
    return Array.from(new Set(completedLessonIds)).filter((id) =>
      lessonIdSet.has(id)
    ).length;
  }, [lessons, completedLessonIds]);

  const isCurrentCompleted = useMemo(() => {
    return currentLesson ? completedLessonIds.includes(currentLesson.id) : false;
  }, [currentLesson, completedLessonIds]);

  const handleSelectLesson = async (lessonId: string) => {
    if (lessonId === currentLessonId) return;
    setCurrentLessonId(lessonId);
    setSaveError(null);

    if (uid && course?.id) {
      try {
        await persistProgress(
          course.id,
          {
            completedLessonIds,
            lastLessonId: lessonId,
          },
          hasActiveEnrollment,
          enrollmentId
        );
      } catch {
        // Échec silencieux pour le simple changement de position
      }
    }
  };

  const handleMarkCompleted = async () => {
    if (!currentLesson || !uid || !course?.id || savingProgress) return;
    if (completedLessonIds.includes(currentLesson.id)) return;

    const previousCompleted = [...completedLessonIds];
    const newCompleted = Array.from(
      new Set([...completedLessonIds, currentLesson.id])
    );
    if (newCompleted.length > MAX_COMPLETED_LESSONS) {
      setSaveError(t("lecteur.limiteLeconsDepassee"));
      return;
    }

    setCompletedLessonIds(newCompleted);
    setSaveError(null);

    setSavingProgress(true);
    try {
      await persistProgress(
        course.id,
        {
          completedLessonIds: newCompleted,
          lastLessonId: currentLesson.id,
        },
        hasActiveEnrollment,
        enrollmentId
      );
    } catch (err: unknown) {
      setCompletedLessonIds(previousCompleted);
      const msg = err instanceof Error ? err.message : t("lecteur.erreurEnregistrement");
      setSaveError(msg);
    } finally {
      setSavingProgress(false);
    }
  };

  const currentLessonDuration = currentLesson
    ? formatDuration(currentLesson.durationMinutes)
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {authLoading || dataLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-4 bg-[var(--surface-subtle)] rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="aspect-video w-full rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
                <div className="h-8 bg-[var(--surface-subtle)] rounded-xl w-3/4" />
                <div className="h-10 bg-[var(--surface-well)] rounded-full w-40" />
              </div>
              <div className="lg:col-span-4 h-96 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
            </div>
          </div>
        ) : notEnrolled ? (
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-2xl surface-glass my-10 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 text-brand-light shadow-lg shadow-[var(--brand-glow-soft)]">
              <PortalSymbol size={36} className="opacity-85" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white mb-3">
              {t("lecteur.nonInscrit")}
            </h1>
            <p className="font-sans text-sm sm:text-base text-slate-700 dark:text-ice-white/70 mb-8 max-w-md leading-relaxed">
              {t("lecteur.nonInscritDescription")}
            </p>
            <Link
              href={localize(`/formations/${slug}`)}
              className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span>{t("lecteur.boutonVoirFormation")}</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        ) : !currentLesson || !course ? (
          <div className="p-8 text-center text-slate-600 dark:text-ice-white/60">
            <p>{t("catalogue.vide")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Fil d'Ariane + Mode Cinéma */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-700 dark:text-ice-white/70 min-w-0">
                <Link
                  href={localize("/mes-formations")}
                  className="hover:text-brand-light transition-colors inline-flex items-center gap-1.5 min-h-[44px] py-1 px-2 rounded-lg whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t("lecteur.retourMesFormations")}</span>
                </Link>
                <span className="text-slate-500 dark:text-ice-white/30 shrink-0" aria-hidden="true">
                  /
                </span>
                <span className="text-ice-white font-medium truncate max-w-[180px] sm:max-w-md">
                  {course.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setTheaterMode((prev) => !prev)}
                aria-pressed={theaterMode}
                className="hidden lg:inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[var(--surface-well)] hover:bg-[var(--surface-well)] dark:hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs font-sans font-medium text-slate-700 dark:text-ice-white/80 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                {theaterMode ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-brand-light shrink-0" aria-hidden="true" />
                    <span>{t("lecteur.quitterModeCinema")}</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-brand-light shrink-0" aria-hidden="true" />
                    <span>{t("lecteur.modeCinema")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Layout responsive : Vidéo + Commentaires à gauche, Liste à droite (ou pleine largeur en mode cinéma) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Colonne Principale */}
              <div
                className={`space-y-6 ${
                  theaterMode ? "lg:col-span-12" : "lg:col-span-8"
                }`}
              >
                <VideoPlayer
                  key={currentLesson.id}
                  lessonTitle={currentLesson.title}
                  youtubeVideoId={currentLesson.youtubeVideoId}
                  videoProvider={currentLesson.videoProvider}
                  videoId={currentLesson.videoId}
                  videoUrl={currentLesson.videoUrl}
                  durationMinutes={currentLesson.durationMinutes}
                  nextLessonTitle={nextLesson?.title}
                  onNextLesson={
                    nextLesson ? () => handleSelectLesson(nextLesson.id) : undefined
                  }
                />

                {/* Carte d'information et actions de la leçon */}
                <div className="p-6 sm:p-7 rounded-2xl surface-glass border border-[var(--border-subtle)] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs uppercase tracking-wider text-brand-light">
                        {currentLesson.moduleTitle && (
                          <span>{currentLesson.moduleTitle}</span>
                        )}
                        {currentLesson.moduleTitle && (
                          <span className="text-slate-500 dark:text-ice-white/30" aria-hidden="true">
                            ·
                          </span>
                        )}
                        <span className="tabular-nums text-slate-600 dark:text-ice-white/65">
                          {currentLessonIndex + 1} / {lessons.length}
                        </span>
                        {currentLessonDuration && (
                          <>
                            <span className="text-slate-500 dark:text-ice-white/30" aria-hidden="true">
                              ·
                            </span>
                            <span className="normal-case tabular-nums text-slate-600 dark:text-ice-white/65">
                              {currentLessonDuration}
                            </span>
                          </>
                        )}
                      </div>

                      <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-ice-white leading-tight">
                        {currentLesson.title}
                      </h1>
                    </div>

                    {/* Bouton "Terminé" */}
                    <div className="flex-shrink-0">
                      {isCurrentCompleted ? (
                        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/45 text-brand-light font-sans font-semibold text-sm select-none whitespace-nowrap">
                          <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
                          <span>{t("lecon.terminee")}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleMarkCompleted}
                          disabled={savingProgress}
                          aria-disabled={savingProgress}
                          className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light select-none cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {savingProgress ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                              <span>{t("lecteur.enregistrement")}</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                              <span>{t("lecon.terminee")}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Navigation leçon précédente / suivante */}
                  {(previousLesson || nextLesson) && (
                    <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                      {previousLesson ? (
                        <button
                          type="button"
                          onClick={() => handleSelectLesson(previousLesson.id)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-[var(--surface-well)] hover:bg-[var(--surface-well)] dark:hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs sm:text-sm font-sans font-medium text-slate-800 dark:text-ice-white/85 inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                        >
                          <ChevronLeft className="w-4 h-4 text-brand-light shrink-0" aria-hidden="true" />
                          <span>{t("lecteur.precedent")}</span>
                        </button>
                      ) : (
                        <div />
                      )}

                      {nextLesson && (
                        <button
                          type="button"
                          onClick={() => handleSelectLesson(nextLesson.id)}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-[var(--surface-well)] hover:bg-[var(--surface-well)] dark:hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-xs sm:text-sm font-sans font-medium text-slate-800 dark:text-ice-white/85 inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ml-auto"
                        >
                          <span>{t("lecteur.suivant")}</span>
                          <ChevronRight className="w-4 h-4 text-brand-light shrink-0" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}

                  {saveError && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs sm:text-sm">
                      {saveError}
                    </div>
                  )}

                  {currentLesson.resources &&
                    currentLesson.resources.some((res) =>
                      /^https?:\/\//i.test((res.url || "").trim())
                    ) && (
                      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2">
                        <span className="font-mono text-xs font-medium text-slate-600 dark:text-ice-white/60 block">
                          {t("lecteur.ressources")} :
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {currentLesson.resources
                            .filter((res) =>
                              /^https?:\/\//i.test((res.url || "").trim())
                            )
                            .map((res, idx) => (
                              <a
                                key={`res-${idx}`}
                                href={res.url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[var(--surface-well)] border border-[var(--border-strong)] dark:border-[var(--border-subtle)] text-xs font-medium text-brand-light hover:underline min-h-[44px]"
                              >
                                <span>{res.label}</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              </a>
                            ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Espace commentaires par leçon (création élève/admin, suppression admin uniquement) */}
                <LessonComments
                  key={currentLesson.id}
                  courseId={course.id}
                  lessonId={currentLesson.id}
                  user={user}
                  isAdmin={isAdmin}
                />
              </div>

              {/* Colonne Latérale (Progression + Liste des leçons) */}
              <aside
                className={
                  theaterMode
                    ? "lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                    : "lg:col-span-4 space-y-6 lg:sticky lg:top-24"
                }
              >
                <div
                  className={`p-5 sm:p-6 rounded-2xl surface-glass border border-[var(--border-subtle)] space-y-3 ${
                    theaterMode ? "lg:col-span-4" : ""
                  }`}
                >
                  <span className="font-mono text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-ice-white/60 block">
                    {t("lecteur.progressionGlobale")}
                  </span>
                  <ProgressBar
                    completedCount={validCompletedCount}
                    totalCount={lessons.length}
                    size="md"
                    lang={lang}
                  />
                </div>

                <div
                  className={`p-5 sm:p-6 rounded-2xl surface-glass border border-[var(--border-subtle)] max-h-[600px] overflow-y-auto ${
                    theaterMode ? "lg:col-span-8" : ""
                  }`}
                >
                  <LessonList
                    lessons={lessons}
                    currentLessonId={currentLesson.id}
                    completedLessonIds={completedLessonIds}
                    onSelectLesson={handleSelectLesson}
                  />
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
