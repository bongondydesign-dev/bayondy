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
import {
  getCourseBySlugForStudent,
  getEnrollment,
  getCourseLessons,
  saveProgress,
  type CourseWithId,
  type LessonWithId,
} from "@/lib/learning/queries";
import { t } from "@/lib/i18n";

interface PlayerViewProps {
  slug: string;
}

export function PlayerView({ slug }: PlayerViewProps) {
  const { user, loading: authLoading } = useRequireAuth();

  const [course, setCourse] = useState<CourseWithId | null>(null);
  const [lessons, setLessons] = useState<LessonWithId[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Chargement sécurisé : Cours -> Inscription -> Leçons
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;

    async function loadData() {
      try {
        // 1. Récupération du cours publié
        const courseDoc = await getCourseBySlugForStudent(slug);
        if (cancelled) return;
        if (!courseDoc) {
          setNotEnrolled(true);
          setDataLoading(false);
          return;
        }
        setCourse(courseDoc);

        // 2. Vérification de l'inscription de l'élève
        const enrollDoc = await getEnrollment(user!.uid, courseDoc.id);
        if (cancelled) return;
        if (!enrollDoc || enrollDoc.status !== "active") {
          // ⚠️ Stop immédiat : l'élève n'est pas actif sur ce cours, AUCUNE lecture de leçons
          setNotEnrolled(true);
          setDataLoading(false);
          return;
        }

        const initialCompleted = Array.isArray(
          enrollDoc.progress?.completedLessonIds
        )
          ? enrollDoc.progress.completedLessonIds
          : [];
        setCompletedLessonIds(initialCompleted);

        // 3. Lecture des leçons du cours (uniquement si inscription validée)
        try {
          const lessonList = await getCourseLessons(courseDoc.id);
          if (cancelled) return;
          setLessons(lessonList);

          if (lessonList.length > 0) {
            const savedLastId = enrollDoc.progress?.lastLessonId;
            const validSavedLesson = lessonList.find((l) => l.id === savedLastId);

            if (validSavedLesson) {
              setCurrentLessonId(validSavedLesson.id);
            } else {
              setCurrentLessonId(lessonList[0].id);
            }
          }
        } catch (lessonErr: unknown) {
          if (cancelled) return;
          const isPermissionDenied =
            lessonErr &&
            typeof lessonErr === "object" &&
            "code" in lessonErr &&
            lessonErr.code === "permission-denied";

          if (isPermissionDenied) {
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
  }, [slug, user]);

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

  // Changement de leçon active avec sauvegarde de lastLessonId
  const handleSelectLesson = async (lessonId: string) => {
    if (lessonId === currentLessonId) return;
    setCurrentLessonId(lessonId);
    setSaveError(null);

    if (user?.uid && course?.id) {
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
    ).slice(0, 200);

    // Mise à jour optimiste
    setCompletedLessonIds(newCompleted);
    setSavingProgress(true);
    setSaveError(null);

    try {
      await saveProgress(user.uid, course.id, {
        completedLessonIds: newCompleted,
        lastLessonId: currentLesson.id,
      });
    } catch {
      // Rollback optimiste en cas d'erreur Firestore
      setCompletedLessonIds(previousCompleted);
      setSaveError(t("lecteur.erreurEnregistrement"));
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white selection:bg-ion-blue/30 selection:text-aurora overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Chargement initial */}
        {authLoading || dataLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="aspect-video w-full rounded-3xl bg-deep-navy/80 border border-white/5" />
                <div className="h-8 bg-white/10 rounded-xl w-3/4" />
                <div className="h-10 bg-white/5 rounded-2xl w-40" />
              </div>
              <div className="lg:col-span-4 h-96 rounded-3xl bg-deep-navy/40 border border-white/5" />
            </div>
          </div>
        ) : notEnrolled ? (
          // État non inscrit ou accès révoqué
          <div className="flex flex-col items-center justify-center text-center p-8 sm:p-14 rounded-3xl bg-deep-navy/40 border border-white/10 my-10 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-deep-navy border border-white/10 flex items-center justify-center mb-6 text-aurora shadow-lg shadow-aurora/5">
              <PortalSymbol size={36} className="opacity-80" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
              {t("lecteur.nonInscrit")}
            </h1>
            <p className="font-sans text-sm sm:text-base text-ice-white/60 mb-8 max-w-md leading-relaxed">
              {t("lecteur.nonInscritDescription")}
            </p>
            <Link
              href={`/formations/${slug}`}
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-ion-blue hover:bg-ion-blue/90 text-white font-sans font-medium text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-ion-blue/25 transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
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
                className="hover:text-aurora transition-colors inline-flex items-center gap-1.5 min-h-[44px] py-1 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
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
              <span className="text-white/20">/</span>
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
                <div className="p-6 sm:p-7 rounded-3xl bg-deep-navy border border-white/10 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      {currentLesson.moduleTitle && (
                        <span className="font-mono text-xs uppercase tracking-wider text-aurora block mb-1.5">
                          {currentLesson.moduleTitle}
                        </span>
                      )}
                      {/* Titre unique H1 de la leçon active */}
                      <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-white leading-tight">
                        {currentLesson.title}
                      </h1>
                    </div>

                    {/* Bouton "Leson fini" */}
                    <div className="flex-shrink-0">
                      {isCurrentCompleted ? (
                        <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-aurora/15 border border-aurora/40 text-aurora font-sans font-medium text-sm select-none">
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
                          className="min-h-[48px] px-6 py-3 rounded-2xl bg-ion-blue hover:bg-ion-blue/90 disabled:bg-ion-blue/50 text-white font-sans font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-ion-blue/25 transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora select-none cursor-pointer disabled:cursor-not-allowed"
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
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm">
                      {saveError}
                    </div>
                  )}

                  {/* Ressources de la leçon si existantes */}
                  {currentLesson.resources &&
                    currentLesson.resources.length > 0 && (
                      <div className="pt-4 border-t border-white/5 space-y-2">
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian border border-white/10 text-xs text-aurora hover:underline min-h-[44px]"
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
                <div className="p-5 sm:p-6 rounded-3xl bg-deep-navy border border-white/10 space-y-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-ice-white/50 block">
                    {t("lecteur.progressionGlobale")}
                  </span>
                  <ProgressBar
                    completedCount={validCompletedCount}
                    totalCount={lessons.length}
                    size="md"
                  />
                </div>

                {/* Liste des leçons */}
                <div className="p-5 sm:p-6 rounded-3xl bg-deep-navy border border-white/10 max-h-[600px] overflow-y-auto">
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
