"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { LessonList } from "@/components/player/LessonList";
import { ProgressBar } from "@/components/player/ProgressBar";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { hasCourseAccess } from "@/lib/learning/access";
import {
  getCourseBySlugForStudent,
  getEnrollment,
  getCourseLessons,
  saveProgress,
  type CourseWithId,
  type LessonWithId,
} from "@/lib/learning/queries";
import { MAX_COMPLETED_LESSONS } from "@/types/firestore";
import { t } from "@/lib/i18n";

interface PlayerViewProps {
  slug: string;
}

export function PlayerView({ slug }: PlayerViewProps) {
  const { user, loading: authLoading, isAdmin } = useRequireAuth();

  const [course, setCourse] = useState<CourseWithId | null>(null);
  const [lessons, setLessons] = useState<LessonWithId[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [hasActiveEnrollment, setHasActiveEnrollment] = useState(false);

  const [dataLoading, setDataLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Chargement sécurisé : Cours -> Inscription (ou accès admin) -> Leçons
  useEffect(() => {
    if (authLoading || !user?.uid) return;
    let cancelled = false;

    async function loadData() {
      try {
        // 1. Récupération du cours (y compris brouillon si admin)
        const courseDoc = await getCourseBySlugForStudent(slug, isAdmin);
        if (cancelled) return;
        if (!courseDoc) {
          setNotEnrolled(true);
          setDataLoading(false);
          return;
        }
        setCourse(courseDoc);

        // 2. Vérification de l'inscription de l'élève (ou accès gratuit admin)
        const enrollDoc = await getEnrollment(user!.uid, courseDoc.id).catch(
          () => null
        );
        if (cancelled) return;

        const enrolledActive = enrollDoc?.status === "active";
        setHasActiveEnrollment(enrolledActive);

        if (!hasCourseAccess({ isAdmin, enrollmentStatus: enrollDoc?.status })) {
          // ⚠️ Stop immédiat : l'élève n'est pas actif sur ce cours, AUCUNE lecture de leçons
          setNotEnrolled(true);
          setDataLoading(false);
          return;
        }

        const initialCompleted = Array.isArray(
          enrollDoc?.progress?.completedLessonIds
        )
          ? enrollDoc.progress.completedLessonIds
          : [];
        setCompletedLessonIds(initialCompleted);

        // 3. Lecture des leçons du cours (autorisée pour inscription active ou admin)
        try {
          const lessonList = await getCourseLessons(courseDoc.id);
          if (cancelled) return;
          setLessons(lessonList);

          if (lessonList.length > 0) {
            const savedLastId = enrollDoc?.progress?.lastLessonId;
            const validSavedLesson = lessonList.find((l) => l.id === savedLastId);

            if (validSavedLesson) {
              setCurrentLessonId(validSavedLesson.id);
            } else {
              setCurrentLessonId(lessonList[0].id);
            }
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
  }, [slug, user, authLoading, isAdmin]);

  // Leçon active courante
  const currentLesson = useMemo(() => {
    return lessons.find((l) => l.id === currentLessonId) || lessons[0];
  }, [lessons, currentLessonId]);

  // Nombre de leçons terminées valides (correspondant aux leçons réelles du cours)
  const validCompletedCount = useMemo(() => {
    const lessonIdSet = new Set(lessons.map((l) => l.id));
    return completedLessonIds.filter((id) => lessonIdSet.has(id)).length;
  }, [lessons, completedLessonIds]);

  const isCurrentCompleted = useMemo(() => {
    return currentLesson ? completedLessonIds.includes(currentLesson.id) : false;
  }, [currentLesson, completedLessonIds]);

  // Changement de leçon active avec sauvegarde de lastLessonId (si inscription active)
  const handleSelectLesson = async (lessonId: string) => {
    if (lessonId === currentLessonId) return;
    setCurrentLessonId(lessonId);
    setSaveError(null);

    if (hasActiveEnrollment && user?.uid && course?.id) {
      try {
        await saveProgress(user.uid, course.id, {
          completedLessonIds,
          lastLessonId: lessonId,
        });
      } catch {
        // Échec silencieux pour le simple changement de position
      }
    }
  };

  // Marquer la leçon comme terminée
  const handleMarkCompleted = async () => {
    if (!currentLesson || !user?.uid || !course?.id || savingProgress) return;
    if (completedLessonIds.includes(currentLesson.id)) return;

    const previousCompleted = [...completedLessonIds];
    const newCompleted = Array.from(
      new Set([...completedLessonIds, currentLesson.id])
    );
    if (newCompleted.length > MAX_COMPLETED_LESSONS) {
      setSaveError(t("lecteur.limiteLeconsDepassee"));
      return;
    }

    // Mise à jour optimiste
    setCompletedLessonIds(newCompleted);
    setSaveError(null);

    if (!hasActiveEnrollment) {
      return;
    }

    setSavingProgress(true);
    try {
      await saveProgress(user.uid, course.id, {
        completedLessonIds: newCompleted,
        lastLessonId: currentLesson.id,
      });
    } catch (err: unknown) {
      // Rollback optimiste en cas d'erreur Firestore ou validation
      setCompletedLessonIds(previousCompleted);
      const msg = err instanceof Error ? err.message : t("lecteur.erreurEnregistrement");
      setSaveError(msg);
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Chargement initial */}
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
          // État non inscrit ou accès révoqué
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] my-10 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 text-brand-light shadow-lg shadow-[var(--brand-glow-soft)]">
              <PortalSymbol size={36} className="opacity-85" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white mb-3">
              {t("lecteur.nonInscrit")}
            </h1>
            <p className="font-sans text-sm sm:text-base text-ice-white/70 mb-8 max-w-md leading-relaxed">
              {t("lecteur.nonInscritDescription")}
            </p>
            <Link
              href={`/formations/${slug}`}
              className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span>{t("lecteur.boutonVoirFormation")}</span>
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
        ) : !currentLesson ? (
          // Aucune leçon disponible
          <div className="p-8 text-center text-ice-white/60">
            <p>{t("catalogue.vide")}</p>
          </div>
        ) : (
          // Lecteur complet (Vidéo + Contrôles + Liste des leçons)
          <div className="space-y-6">
            {/* Fil d'Ariane & Retour */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-ice-white/70">
              <Link
                href="/mes-formations"
                className="hover:text-brand-light transition-colors inline-flex items-center gap-1.5 min-h-[44px] py-1 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>{t("lecteur.retourMesFormations")}</span>
              </Link>
              <span className="text-ice-white/30">/</span>
              <span className="text-ice-white/90 truncate max-w-xs sm:max-w-md">
                {course?.title}
              </span>
            </div>

            {/* Layout responsive : Vidéo à gauche, Liste à droite sur grand écran */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Colonne Principale (Lecteur Vidéo + Titre + Bouton de progression) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Lektè videyo (Iframe uniquement au clic, remonte proprement à chaque leçon) */}
                <VideoPlayer
                  key={currentLesson.id}
                  lessonTitle={currentLesson.title}
                  youtubeVideoId={currentLesson.youtubeVideoId}
                />

                {/* En-tête de la leçon et action "Leson fini" */}
                <div className="p-6 sm:p-7 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      {currentLesson.moduleTitle && (
                        <span className="font-mono text-xs uppercase tracking-wider text-brand-light block mb-1.5">
                          {currentLesson.moduleTitle}
                        </span>
                      )}
                      {/* Titre unique H1 de la leçon active */}
                      <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-ice-white leading-tight">
                        {currentLesson.title}
                      </h1>
                    </div>

                    {/* Bouton "Leson fini" */}
                    <div className="flex-shrink-0">
                      {isCurrentCompleted ? (
                        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-brand/15 border border-brand/40 text-brand-light font-sans font-medium text-sm select-none">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{t("lecon.terminee")} ✓</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleMarkCompleted}
                          disabled={savingProgress}
                          aria-disabled={savingProgress}
                          className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light select-none cursor-pointer disabled:cursor-not-allowed"
                        >
                          {savingProgress ? (
                            <>
                              <svg
                                className="w-4 h-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                              <span>{t("lecteur.enregistrement")}</span>
                            </>
                          ) : (
                            <>
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span>{t("lecon.terminee")}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message d'erreur d'enregistrement si échec */}
                  {saveError && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs sm:text-sm">
                      {saveError}
                    </div>
                  )}

                  {/* Ressources de la leçon si existantes */}
                  {currentLesson.resources &&
                    currentLesson.resources.length > 0 && (
                      <div className="pt-4 border-t border-[var(--border-faint)] space-y-2">
                        <span className="font-mono text-xs text-ice-white/60 block">
                          {t("lecteur.ressources")} :
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {currentLesson.resources.map((res, idx) => (
                            <a
                              key={`res-${idx}`}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-well)] border border-[var(--border-subtle)] text-xs text-brand-light hover:underline min-h-[44px]"
                            >
                              <span>{res.label}</span>
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Colonne Latérale (Progression + Liste des leçons) */}
              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                {/* Carte de progression globale */}
                <div className="p-5 sm:p-6 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-ice-white/60 block">
                    {t("lecteur.progressionGlobale")}
                  </span>
                  <ProgressBar
                    completedCount={validCompletedCount}
                    totalCount={lessons.length}
                    size="md"
                  />
                </div>

                {/* Liste des leçons */}
                <div className="p-5 sm:p-6 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] max-h-[600px] overflow-y-auto">
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
