"use client";

import React, { useEffect, useState } from "react";
import { Loader2, MessageSquare, Send, Trash2 } from "lucide-react";
import type { User } from "firebase/auth";
import { MAX_COMMENT_LENGTH } from "@/types/firestore";
import { useAuth } from "@/lib/auth/AuthProvider";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatLocaleDate } from "@/lib/courses/format";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { getBrowserLocalStorage } from "@/lib/learning/progress";
import {
  mergeCommentsWithFallback,
  readLocalCommentsFallback,
  removeLocalCommentFallback,
  sanitizeAuthorName,
  sanitizeAuthorPhotoURL,
  upsertLocalCommentFallback,
  validateCommentCreateInput,
  type LessonCommentItem,
} from "@/lib/learning/comments";
import {
  createLessonCommentClient,
  deleteLessonCommentClient,
  deleteLessonCommentViaApi,
  fetchLessonCommentsViaApi,
  getLessonCommentsClient,
  postLessonCommentViaApi,
} from "@/lib/learning/queries";

interface LessonCommentsProps {
  courseId: string;
  lessonId: string;
  user: User | null;
  isAdmin: boolean;
}

function CommentAvatar({
  name,
  photoURL,
  isAdminAuthor,
}: {
  name: string;
  photoURL: string | null;
  isAdminAuthor: boolean;
}) {
  return (
    <UserAvatar
      src={photoURL}
      name={name}
      size="sm"
      shape="circle"
      highlight={isAdminAuthor}
    />
  );
}

export function LessonComments({
  courseId,
  lessonId,
  user,
  isAdmin,
}: LessonCommentsProps) {
  const { lang, t } = useI18n();
  const { profilePhotoUrl } = useAuth();

  const [comments, setComments] = useState<LessonCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !lessonId || !user) return;
    let cancelled = false;

    async function loadComments() {
      const storage = getBrowserLocalStorage();
      const localItems = readLocalCommentsFallback(storage, courseId, lessonId);

      try {
        const idToken = await user!.getIdToken();
        const apiRes = await fetchLessonCommentsViaApi({
          idToken,
          courseId,
          lessonId,
        });
        if (cancelled) return;

        if (apiRes.ok && apiRes.comments) {
          setComments(mergeCommentsWithFallback(apiRes.comments, localItems));
          setLoadError(null);
          return;
        }

        if (apiRes.status === 503 || apiRes.status === 0) {
          try {
            const clientRows = await getLessonCommentsClient(courseId, lessonId);
            if (cancelled) return;
            setComments(mergeCommentsWithFallback(clientRows, localItems));
            setLoadError(null);
            return;
          } catch {
            if (cancelled) return;
            if (localItems.length > 0) {
              setComments(localItems);
              setLoadError(null);
              return;
            }
          }
        }

        setComments(localItems);
        if (apiRes.status !== 503 && apiRes.status !== 0) {
          setLoadError(apiRes.error || t("lecteur.commentaireErreurChargement"));
        }
      } catch {
        try {
          const clientRows = await getLessonCommentsClient(courseId, lessonId);
          if (cancelled) return;
          setComments(mergeCommentsWithFallback(clientRows, localItems));
          setLoadError(null);
        } catch {
          if (cancelled) return;
          setComments(localItems);
          setLoadError(t("lecteur.commentaireErreurChargement"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, user, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    const validation = validateCommentCreateInput({
      courseId,
      lessonId,
      content: draft,
    });

    if (!validation.ok) {
      if (validation.code === "EMPTY_COMMENT") {
        setSubmitError(t("lecteur.commentaireVideValidation"));
      } else if (validation.code === "COMMENT_TOO_LONG") {
        setSubmitError(t("lecteur.commentaireTropLong"));
      } else {
        setSubmitError(t("lecteur.commentaireErreurEnvoi"));
      }
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const storage = getBrowserLocalStorage();

    try {
      const idToken = await user.getIdToken();
      const apiRes = await postLessonCommentViaApi({
        idToken,
        courseId,
        lessonId,
        content: validation.data.content,
      });

      if (apiRes.ok && apiRes.comment) {
        setComments((prev) => mergeCommentsWithFallback([apiRes.comment!], prev));
        setDraft("");
        return;
      }

      if (apiRes.status === 503 || apiRes.status === 0) {
        const fallbackName = sanitizeAuthorName(
          user.displayName || user.email?.split("@")[0],
          t("lecteur.commentaireAuteurAnonyme")
        );
        const fallbackPhoto = sanitizeAuthorPhotoURL(
          profilePhotoUrl ?? user.photoURL
        );

        try {
          const created = await createLessonCommentClient({
            courseId,
            lessonId,
            uid: user.uid,
            authorName: fallbackName,
            authorPhotoURL: fallbackPhoto,
            authorIsAdmin: isAdmin,
            content: validation.data.content,
          });
          setComments((prev) => mergeCommentsWithFallback([created], prev));
          setDraft("");
          return;
        } catch (clientErr: unknown) {
          const code =
            clientErr &&
            typeof clientErr === "object" &&
            "code" in clientErr &&
            typeof (clientErr as { code?: unknown }).code === "string"
              ? (clientErr as { code: string }).code
              : "";

          if (code === "permission-denied") {
            setSubmitError(t("lecteur.commentaireErreurEnvoi"));
            return;
          }

          // Mode hors ligne ou prévisualisation sans config Firebase
          const localComment: LessonCommentItem = {
            id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            courseId,
            lessonId,
            uid: user.uid,
            authorName: fallbackName,
            authorPhotoURL: fallbackPhoto,
            authorIsAdmin: isAdmin,
            content: validation.data.content,
            createdAtMs: Date.now(),
          };
          const updated = upsertLocalCommentFallback(
            storage,
            courseId,
            lessonId,
            localComment
          );
          setComments((prev) => mergeCommentsWithFallback(updated, prev));
          setDraft("");
          return;
        }
      }

      setSubmitError(apiRes.error || t("lecteur.commentaireErreurEnvoi"));
    } catch {
      setSubmitError(t("lecteur.commentaireErreurEnvoi"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async (commentId: string) => {
    if (!isAdmin || !user || deletingId) return;

    setDeletingId(commentId);
    setDeleteError(null);
    const storage = getBrowserLocalStorage();

    try {
      if (commentId.startsWith("local_")) {
        removeLocalCommentFallback(storage, courseId, lessonId, commentId);
        setComments((prev) => prev.filter((item) => item.id !== commentId));
        setConfirmDeleteId(null);
        return;
      }

      const idToken = await user.getIdToken();
      const apiRes = await deleteLessonCommentViaApi({ idToken, commentId });

      if (apiRes.ok) {
        removeLocalCommentFallback(storage, courseId, lessonId, commentId);
        setComments((prev) => prev.filter((item) => item.id !== commentId));
        setConfirmDeleteId(null);
        return;
      }

      if (apiRes.status === 503 || apiRes.status === 0) {
        try {
          await deleteLessonCommentClient(commentId);
          removeLocalCommentFallback(storage, courseId, lessonId, commentId);
          setComments((prev) => prev.filter((item) => item.id !== commentId));
          setConfirmDeleteId(null);
          return;
        } catch {
          setDeleteError(t("lecteur.commentaireErreurSuppression"));
          return;
        }
      }

      setDeleteError(apiRes.error || t("lecteur.commentaireErreurSuppression"));
    } catch {
      setDeleteError(t("lecteur.commentaireErreurSuppression"));
    } finally {
      setDeletingId(null);
    }
  };

  const remainingChars = MAX_COMMENT_LENGTH - draft.length;

  return (
    <section
      aria-labelledby="lesson-comments-heading"
      className="p-6 sm:p-7 rounded-2xl surface-glass border border-[var(--border-subtle)] space-y-6"
    >
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <MessageSquare className="w-5 h-5 text-brand-light shrink-0" aria-hidden="true" />
          <h2
            id="lesson-comments-heading"
            className="font-display font-bold text-lg sm:text-xl text-ice-white truncate"
          >
            {t("lecteur.commentairesTitre")}
          </h2>
        </div>
        <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-ice-white/60 shrink-0">
          {comments.length}
        </span>
      </div>

      {/* Formulaire d'ajout de commentaire */}
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <label htmlFor={`comment-input-${lessonId}`} className="sr-only">
          {t("lecteur.commentairePlaceholder")}
        </label>
        <textarea
          id={`comment-input-${lessonId}`}
          rows={3}
          maxLength={MAX_COMMENT_LENGTH}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (submitError) setSubmitError(null);
          }}
          placeholder={t("lecteur.commentairePlaceholder")}
          disabled={submitting}
          className="w-full rounded-xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed bg-white dark:bg-[var(--surface-well)] text-slate-900 dark:text-ice-white placeholder:text-slate-400 dark:placeholder:text-ice-white/40 border border-[var(--border-strong)] dark:border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-brand-light transition-shadow resize-y min-h-[92px] disabled:opacity-60"
        />

        {submitError && (
          <p
            role="alert"
            className="text-xs sm:text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3.5 py-2.5"
          >
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-between gap-4">
          <span
            className={`font-mono text-xs tabular-nums ${
              remainingChars < 100
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-500 dark:text-ice-white/50"
            }`}
          >
            {draft.length} / {MAX_COMMENT_LENGTH}
          </span>

          <button
            type="submit"
            disabled={submitting || !draft.trim()}
            className="min-h-[44px] px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-[var(--brand-glow-soft)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                <span>{t("lecteur.commentairePublication")}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t("lecteur.commentairePublier")}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {deleteError && (
        <p
          role="alert"
          className="text-xs sm:text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3.5 py-2.5"
        >
          {deleteError}
        </p>
      )}

      {loadError && (
        <p
          role="alert"
          className="text-xs sm:text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3.5 py-2.5"
        >
          {loadError}
        </p>
      )}

      {/* Liste des commentaires */}
      {loading ? (
        <div className="space-y-3 animate-pulse" aria-busy="true">
          <div className="h-20 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)]" />
          <div className="h-20 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)]" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] px-4">
          <p className="font-sans text-sm text-slate-600 dark:text-ice-white/65">
            {t("lecteur.commentairesVide")}
          </p>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {comments.map((comment) => {
            const isConfirming = confirmDeleteId === comment.id;
            const isDeleting = deletingId === comment.id;
            const dateLabel =
              comment.createdAtMs > 0
                ? formatLocaleDate(
                    new Date(comment.createdAtMs),
                    { day: "numeric", month: "short", year: "numeric" },
                    lang
                  )
                : "";

            return (
              <li
                key={comment.id}
                className="p-4 rounded-xl bg-white dark:bg-[var(--surface-well)] border border-[var(--border-subtle)] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CommentAvatar
                      name={comment.authorName}
                      photoURL={comment.authorPhotoURL}
                      isAdminAuthor={comment.authorIsAdmin}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-sans font-semibold text-sm text-ice-white truncate max-w-[200px] sm:max-w-xs">
                          {comment.authorName}
                        </span>
                        {comment.authorIsAdmin && (
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-light">
                            · {t("lecteur.commentaireBadgeAdmin")}
                          </span>
                        )}
                      </div>
                      {dateLabel && (
                        <span className="font-mono text-[11px] text-slate-500 dark:text-ice-white/50 block">
                          {dateLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Suppression réservée exclusivement à l'administrateur */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isConfirming ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(comment.id)}
                            disabled={isDeleting}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-sans font-semibold text-xs inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                            ) : null}
                            <span>{t("lecteur.commentaireConfirmerSuppression")}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={isDeleting}
                            className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[var(--surface-well)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-slate-700 dark:text-ice-white/75 font-sans text-xs whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                          >
                            {t("lecteur.commentaireAnnuler")}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setConfirmDeleteId(comment.id);
                          }}
                          aria-label={`${t("lecteur.commentaireSupprimer")} — ${comment.authorName}`}
                          className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-ice-white/55 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors inline-flex items-center gap-1.5 text-xs font-sans font-medium whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span className="hidden sm:inline">
                            {t("lecteur.commentaireSupprimer")}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p className="font-sans text-sm sm:text-[15px] text-slate-800 dark:text-ice-white/85 whitespace-pre-wrap break-words leading-relaxed pl-12">
                  {comment.content}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
