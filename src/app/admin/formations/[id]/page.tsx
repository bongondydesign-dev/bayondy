"use client";

// ⚠️ NOTE SÉCURITÉ : Les liens/IDs vidéo ne sont affichés que dans cet espace admin,
// jamais dans les pages publiques ni dans le syllabus côté client.

import React, { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Link2,
  PlayCircle,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { adminFetch } from "@/lib/admin/apiClient";
import {
  computeNextLessonOrder,
  computeOrderUpdatesForMove,
  slugifyCourseText,
} from "@/lib/admin/courseHelpers";
import { CoverImageField } from "@/components/admin/CoverImageField";
import { DeleteCourseDialog } from "@/components/admin/DeleteCourseDialog";
import { getLessonPlaybackInfo, parseLessonVideoInput } from "@/lib/video/lessonVideo";
import { useI18n } from "@/lib/i18n/I18nProvider";

// ─────────────────────────── Types ───────────────────────────

interface AdminCourse {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  level: string;
  language: string;
  status: "draft" | "published";
  durationMinutes: number;
  coverUrl: string | null;
  priceUSD: number | null;
  priceHTG: number | null;
  lessonsCount: number;
}

interface AdminLesson {
  id: string;
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  order: number;
  youtubeVideoId: string;
  videoProvider?: "tiktok" | "youtube";
  videoId?: string;
  videoUrl?: string;
  durationMinutes: number;
  isFreePreview: boolean;
  archived: boolean;
  resources: Array<{ label: string; url: string }>;
}

// ─────────────────────────── Sous-composants ───────────────────────────

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/65 block">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-600 dark:text-ice-white/50">{hint}</p>}
    </div>
  );
}

function inputClass(error?: boolean) {
  return `w-full px-4 py-3 rounded-xl bg-white dark:bg-[var(--surface-well)] shadow-2xs dark:shadow-none border ${
    error ? "border-red-500 dark:border-red-400" : "border-[var(--border-strong)]"
  } text-ice-white placeholder:text-slate-500 dark:placeholder:text-ice-white/40 text-base sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-colors min-h-[48px]`;
}

function StatusLabel({ status }: { status: "draft" | "published" }) {
  const { t } = useI18n();
  return (
    <span
      className={`font-mono text-xs font-medium ${
        status === "published"
          ? "text-emerald-700 dark:text-emerald-300"
          : "text-slate-600 dark:text-ice-white/60"
      }`}
    >
      {status === "published" ? t("admin.statut.publie") : t("admin.statut.brouillon")}
    </span>
  );
}

// ─────────────────────────── Formulaire Leçon ───────────────────────────

function LessonForm({
  courseId,
  initial,
  defaultOrder,
  existingModules,
  onSave,
  onCancel,
}: {
  courseId: string;
  initial?: AdminLesson;
  defaultOrder: number;
  existingModules: Array<{ moduleId: string; moduleTitle: string }>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const initialVideoSource =
    initial?.videoUrl || initial?.videoId || initial?.youtubeVideoId || "";

  const [form, setForm] = useState({
    moduleId: initial?.moduleId ?? existingModules[0]?.moduleId ?? "modil-01",
    moduleTitle: initial?.moduleTitle ?? existingModules[0]?.moduleTitle ?? "",
    title: initial?.title ?? "",
    order: initial?.order ?? defaultOrder,
    videoSource: initialVideoSource,
    durationMinutes: initial?.durationMinutes ?? 0,
    isFreePreview: initial?.isFreePreview ?? false,
  });
  const [moduleIdTouched, setModuleIdTouched] = useState(Boolean(initial?.moduleId));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const parsedVideo = useMemo(() => {
    if (!form.videoSource.trim()) return null;
    return parseLessonVideoInput(form.videoSource);
  }, [form.videoSource]);

  const handleModuleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      moduleTitle: value,
      moduleId: moduleIdTouched
        ? prev.moduleId
        : slugifyCourseText(value, 80) || "modil-01",
    }));
  };

  const selectExistingModule = (mod: { moduleId: string; moduleTitle: string }) => {
    setModuleIdTouched(true);
    setForm((prev) => ({
      ...prev,
      moduleId: mod.moduleId,
      moduleTitle: mod.moduleTitle,
    }));
  };

  const save = async () => {
    setSaving(true);
    setErrors([]);

    const payload = {
      moduleId: form.moduleId.trim() || slugifyCourseText(form.moduleTitle, 80) || "modil-01",
      moduleTitle: form.moduleTitle,
      title: form.title,
      order: form.order,
      videoSource: form.videoSource,
      durationMinutes: form.durationMinutes,
      isFreePreview: form.isFreePreview,
    };

    try {
      let res: Response;
      if (initial) {
        res = await adminFetch(`/api/admin/lessons/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        res = await adminFetch(`/api/admin/courses/${courseId}/lessons`, {
          method: "POST",
          body: JSON.stringify({ ...payload, courseId }),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setErrors(
          Array.isArray(data.errors) ? data.errors : [data.error ?? t("admin.erreurServeur")]
        );
        return;
      }
      onSave();
    } catch {
      setErrors([t("admin.erreurServeur")]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display font-semibold text-ice-white text-sm">
          {initial ? t("admin.lecon.modifier") : t("admin.lecon.ajouter")}
        </h3>
      </div>

      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs space-y-1">
          {errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      {existingModules.length > 0 && (
        <div className="space-y-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-ice-white/55 block">
            {t("admin.lecon.modulesExistants")}
          </span>
          <div className="flex flex-wrap gap-2">
            {existingModules.map((mod) => {
              const selected =
                form.moduleId === mod.moduleId && form.moduleTitle === mod.moduleTitle;
              return (
                <button
                  key={`${mod.moduleId}-${mod.moduleTitle}`}
                  type="button"
                  onClick={() => selectExistingModule(mod)}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg border text-xs font-sans transition-colors cursor-pointer ${
                    selected
                      ? "bg-brand text-[var(--brand-fg)] border-brand font-semibold"
                      : "bg-white dark:bg-[var(--surface-elevated)] border-[var(--border-strong)] dark:border-[var(--border-subtle)] shadow-2xs dark:shadow-none text-slate-800 dark:text-ice-white/80 hover:border-brand/40"
                  }`}
                >
                  {mod.moduleTitle}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setModuleIdTouched(false);
                setForm((prev) => ({ ...prev, moduleId: "", moduleTitle: "" }));
              }}
              className="min-h-[44px] px-3 py-1.5 rounded-lg border border-dashed border-[var(--border-strong)] bg-white/75 dark:bg-transparent text-xs font-sans font-medium text-slate-700 dark:text-ice-white/70 hover:text-slate-950 dark:hover:text-ice-white hover:border-brand/40 cursor-pointer"
            >
              + {t("admin.lecon.nouveauModule")}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label={t("admin.lecon.champModuleTitre")}>
          <input
            className={inputClass()}
            value={form.moduleTitle}
            onChange={(e) => handleModuleTitleChange(e.target.value)}
            placeholder={t("admin.lecon.champModuleTitrePlaceholder")}
          />
        </FieldGroup>
        <FieldGroup label={t("admin.lecon.champModuleId")}>
          <input
            className={inputClass()}
            value={form.moduleId}
            onChange={(e) => {
              setModuleIdTouched(true);
              setForm((p) => ({
                ...p,
                moduleId: slugifyCourseText(e.target.value, 80),
              }));
            }}
            placeholder={t("admin.lecon.champModuleIdPlaceholder")}
          />
        </FieldGroup>
        <FieldGroup label={t("admin.lecon.champTitre")}>
          <input
            className={inputClass()}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={t("admin.lecon.champTitrePlaceholder")}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup label={t("admin.lecon.champOrdre")}>
            <input
              type="number"
              className={inputClass()}
              value={form.order}
              onChange={(e) =>
                setForm((p) => ({ ...p, order: parseInt(e.target.value, 10) || 0 }))
              }
              min={1}
              max={9999}
            />
          </FieldGroup>
          <FieldGroup label={t("admin.lecon.champDuree")}>
            <input
              type="number"
              className={inputClass()}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  durationMinutes: parseInt(e.target.value, 10) || 0,
                }))
              }
              min={0}
            />
          </FieldGroup>
        </div>

        <div className="sm:col-span-2">
          <FieldGroup
            label={t("admin.lecon.champVideoSource")}
            hint={t("admin.lecon.champVideoSourceHint")}
          >
            <div className="relative">
              <Link2
                className="w-4 h-4 text-slate-500 dark:text-ice-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                className={`${inputClass(Boolean(parsedVideo && !parsedVideo.ok))} pl-10`}
                value={form.videoSource}
                onChange={(e) =>
                  setForm((p) => ({ ...p, videoSource: e.target.value }))
                }
                placeholder={t("admin.lecon.champVideoSourcePlaceholder")}
              />
            </div>

            {parsedVideo && (
              <div className="pt-1">
                {parsedVideo.ok ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      {parsedVideo.provider === "tiktok"
                        ? parsedVideo.needsShortResolve
                          ? t("admin.lecon.sourceLienCourt")
                          : `${t("admin.lecon.sourceDetecteeTikTok")} (${parsedVideo.videoId})`
                        : `${t("admin.lecon.sourceDetecteeYoutube")} (${parsedVideo.videoId})`}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {parsedVideo.error}
                  </p>
                )}
              </div>
            )}
          </FieldGroup>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={form.isFreePreview}
          onChange={(e) =>
            setForm((p) => ({ ...p, isFreePreview: e.target.checked }))
          }
          className="w-5 h-5 rounded border-[var(--border-strong)] bg-[var(--surface-elevated)] accent-brand"
        />
        <span className="font-sans text-sm text-slate-800 dark:text-ice-white/80">
          {t("admin.lecon.champApercu")}
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="min-h-[48px] px-5 py-2.5 rounded-full bg-brand text-[var(--brand-fg)] font-sans font-semibold text-sm hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          {saving ? t("admin.enregistrement") : t("admin.enregistrer")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-[48px] px-5 py-2.5 rounded-full bg-white dark:bg-[var(--surface-elevated)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] text-slate-800 dark:text-ice-white/80 font-sans font-medium text-sm hover:text-slate-950 dark:hover:text-ice-white hover:border-brand/40 disabled:opacity-50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          {t("admin.annuler")}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── Page principale ───────────────────────────

function AdminFormationDetailContent() {
  const { t, localize } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isNew = id === "new";
  const router = useRouter();

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [justCreated, setJustCreated] = useState(false);

  // Form du cours
  const [form, setForm] = useState({
    slug: "",
    title: "",
    shortDescription: "",
    description: "",
    level: "debutant",
    language: "ht",
    status: "draft" as "draft" | "published",
    durationMinutes: 0,
    coverUrl: "",
    priceUSD: "",
    priceHTG: "",
  });
  const [slugTouched, setSlugTouched] = useState(false);

  const [saving, setSaving] = useState(false);
  const [courseErrors, setCourseErrors] = useState<string[]>([]);
  const [courseSuccess, setCourseSuccess] = useState(false);

  // Leçon en cours d'édition
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Archivage & réordonnancement
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  // Suppression de formation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [deleteCourseError, setDeleteCourseError] = useState<string | null>(null);

  const existingModules = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of lessons) {
      if (l.moduleId && l.moduleTitle && !map.has(l.moduleId)) {
        map.set(l.moduleId, l.moduleTitle);
      }
    }
    return Array.from(map.entries()).map(([moduleId, moduleTitle]) => ({
      moduleId,
      moduleTitle,
    }));
  }, [lessons]);

  const nextLessonOrder = useMemo(() => computeNextLessonOrder(lessons), [lessons]);

  const loadCourse = useCallback(async () => {
    if (isNew) return;
    try {
      const res = await adminFetch(`/api/admin/courses/${id}`);
      if (!res.ok) return;
      const data = (await res.json()) as { course: AdminCourse; lessons: AdminLesson[] };
      setCourse(data.course);
      setLessons(data.lessons.filter((l) => !l.archived));
      setForm({
        slug: data.course.slug,
        title: data.course.title,
        shortDescription: data.course.shortDescription,
        description: data.course.description,
        level: data.course.level,
        language: data.course.language,
        status: data.course.status,
        durationMinutes: data.course.durationMinutes,
        coverUrl: data.course.coverUrl ?? "",
        priceUSD: data.course.priceUSD !== null ? String(data.course.priceUSD) : "",
        priceHTG: data.course.priceHTG !== null ? String(data.course.priceHTG) : "",
      });
    } catch {
      // Ignorer erreur de refresh silencieux
    }
  }, [id, isNew]);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    async function init() {
      try {
        const res = await adminFetch(`/api/admin/courses/${id}`);
        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const data = (await res.json()) as { course: AdminCourse; lessons: AdminLesson[] };
        if (!cancelled) {
          const activeLessons = data.lessons.filter((l) => !l.archived);
          setCourse(data.course);
          setLessons(activeLessons);
          setForm({
            slug: data.course.slug,
            title: data.course.title,
            shortDescription: data.course.shortDescription,
            description: data.course.description,
            level: data.course.level,
            language: data.course.language,
            status: data.course.status,
            durationMinutes: data.course.durationMinutes,
            coverUrl: data.course.coverUrl ?? "",
            priceUSD: data.course.priceUSD !== null ? String(data.course.priceUSD) : "",
            priceHTG: data.course.priceHTG !== null ? String(data.course.priceHTG) : "",
          });
          if (activeLessons.length === 0) {
            setAddingLesson(true);
          }
          if (
            typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("created") === "1"
          ) {
            setJustCreated(true);
          }
        }
      } catch {
        // En cas d'erreur
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: isNew && !slugTouched ? slugifyCourseText(value, 80) : prev.slug,
    }));
  };

  const saveCourse = async () => {
    setSaving(true);
    setCourseErrors([]);
    setCourseSuccess(false);

    const normalizedSlug = slugifyCourseText(form.slug.trim() || form.title.trim(), 80);

    const payload: Record<string, unknown> = {
      title: form.title,
      shortDescription: form.shortDescription,
      description: form.description,
      level: form.level,
      language: form.language,
      status: form.status,
      durationMinutes: parseInt(String(form.durationMinutes), 10) || 0,
      coverUrl: form.coverUrl.trim() || null,
      priceUSD: form.priceUSD !== "" ? parseFloat(form.priceUSD) : null,
      priceHTG: form.priceHTG !== "" ? parseFloat(form.priceHTG) : null,
    };
    if (isNew && normalizedSlug) payload.slug = normalizedSlug;

    try {
      let res: Response;
      if (isNew) {
        res = await adminFetch("/api/admin/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = (await res.json()) as { id: string };
          setJustCreated(true);
          router.replace(`/admin/formations/${data.id}?created=1`);
          return;
        }
      } else {
        res = await adminFetch(`/api/admin/courses/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setCourseSuccess(true);
          await loadCourse();
          return;
        }
      }
      const data = (await res.json().catch(() => null)) as {
        errors?: string[];
        error?: string;
      } | null;
      setCourseErrors(
        data && Array.isArray(data.errors)
          ? data.errors
          : [data?.error ?? t("admin.erreurServeur")]
      );
    } catch {
      setCourseErrors([t("admin.erreurServeur")]);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!course) return;
    setSaving(true);
    setCourseErrors([]);
    const newStatus = course.status === "published" ? "draft" : "published";
    try {
      const res = await adminFetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCourseErrors([data.error ?? t("admin.erreurServeur")]);
      } else {
        await loadCourse();
      }
    } catch {
      setCourseErrors([t("admin.erreurServeur")]);
    } finally {
      setSaving(false);
    }
  };

  const archiveLesson = async (lessonId: string) => {
    setArchivingId(lessonId);
    try {
      const res = await adminFetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
      if (res.ok) {
        await loadCourse();
      }
    } finally {
      setArchivingId(null);
    }
  };

  const confirmDeleteCourse = async () => {
    if (isNew || !course) return;
    setDeletingCourse(true);
    setDeleteCourseError(null);
    try {
      const res = await adminFetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setDeleteCourseError(data?.error ?? t("admin.formations.erreurSuppression"));
        return;
      }
      router.replace("/admin/formations");
    } catch {
      setDeleteCourseError(t("admin.formations.erreurSuppression"));
    } finally {
      setDeletingCourse(false);
    }
  };

  const moveLesson = async (lessonId: string, direction: "up" | "down") => {
    const updates = computeOrderUpdatesForMove(lessons, lessonId, direction);
    if (updates.length === 0) return;

    setMovingId(lessonId);
    try {
      await Promise.all(
        updates.map((u) =>
          adminFetch(`/api/admin/lessons/${u.id}`, {
            method: "PATCH",
            body: JSON.stringify({ order: u.order }),
          })
        )
      );
      await loadCourse();
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-[var(--surface-subtle)] rounded-xl w-64" />
        <div className="h-48 bg-deep-navy rounded-2xl border border-[var(--border-subtle)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white truncate">
            {isNew ? t("admin.formations.nouvelle") : course?.title ?? ""}
          </h1>
          {course && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusLabel status={course.status} />
              <span aria-hidden="true" className="text-slate-400 dark:text-ice-white/30">·</span>
              <span className="font-mono text-xs text-slate-600 dark:text-ice-white/55">/{course.slug}</span>
            </div>
          )}
        </div>
        {!isNew && course && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {lessons.length > 0 && (
              <Link
                href={localize(`/mes-formations/${course.slug}`)}
                className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2.5 rounded-full bg-white dark:bg-[var(--surface-elevated)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] text-slate-800 dark:text-ice-white/90 hover:text-slate-950 dark:hover:text-ice-white hover:border-brand/50 font-sans font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <PlayCircle className="w-4 h-4 text-brand-light" aria-hidden="true" />
                <span>{t("catalogue.boutonAcceder")}</span>
              </Link>
            )}
            <button
              type="button"
              onClick={toggleStatus}
              disabled={saving}
              className={`shrink-0 min-h-[48px] px-5 py-2.5 rounded-full font-sans font-semibold text-sm transition-all duration-200 disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                course.status === "published"
                  ? "bg-white dark:bg-[var(--surface-elevated)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] text-slate-800 dark:text-ice-white/85 hover:text-slate-950 dark:hover:text-ice-white hover:border-brand/40"
                  : "bg-brand text-[var(--brand-fg)] hover:bg-brand-dark dark:hover:bg-brand-light"
              }`}
            >
              {saving
                ? t("admin.enregistrement")
                : course.status === "published"
                ? t("admin.formations.depublier")
                : t("admin.formations.publier")}
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteCourseError(null);
                setDeleteDialogOpen(true);
              }}
              disabled={saving || deletingCourse}
              className="shrink-0 inline-flex items-center gap-2 min-h-[48px] px-4 py-2.5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-sans font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t("admin.formations.supprimer")}</span>
            </button>
          </div>
        )}
      </div>

      {!isNew && justCreated && (
        <div className="p-4 rounded-2xl bg-[var(--surface-active)] dark:bg-brand/10 border border-[var(--home-orange-vivid)]/40 dark:border-brand/30 text-ice-white text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-brand-light shrink-0" aria-hidden="true" />
          <span>{t("admin.formations.creeeBanniere")}</span>
        </div>
      )}

      {/* Gestion des leçons en priorité après création ou quand déjà créé */}
      {!isNew && (
        <div className="p-6 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display font-semibold text-ice-white text-base">
              {t("admin.lecons.titre")} ({lessons.length})
            </h2>
            {!addingLesson && (
              <button
                type="button"
                onClick={() => {
                  setAddingLesson(true);
                  setEditingLessonId(null);
                }}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-brand text-[var(--brand-fg)] font-sans font-semibold text-sm hover:bg-brand-dark dark:hover:bg-brand-light transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                {t("admin.lecons.ajouter")}
              </button>
            )}
          </div>

          {addingLesson && (
            <LessonForm
              courseId={id}
              defaultOrder={nextLessonOrder}
              existingModules={existingModules}
              onSave={async () => {
                setAddingLesson(false);
                setJustCreated(false);
                await loadCourse();
              }}
              onCancel={() => setAddingLesson(false)}
            />
          )}

          {lessons.length === 0 && !addingLesson ? (
            <p className="text-slate-600 dark:text-ice-white/55 text-sm text-center py-6">
              {t("admin.lecons.vide")}
            </p>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => {
                const playback = getLessonPlaybackInfo(lesson);
                return (
                  <div key={lesson.id}>
                    {editingLessonId === lesson.id ? (
                      <LessonForm
                        courseId={id}
                        initial={lesson}
                        defaultOrder={lesson.order}
                        existingModules={existingModules}
                        onSave={async () => {
                          setEditingLessonId(null);
                          await loadCourse();
                        }}
                        onCancel={() => setEditingLessonId(null)}
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors">
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveLesson(lesson.id, "up")}
                            disabled={idx === 0 || movingId === lesson.id}
                            aria-label={t("admin.lecons.monter")}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-white dark:bg-[var(--surface-elevated)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] dark:border-[var(--border-subtle)] flex items-center justify-center text-slate-700 dark:text-ice-white/60 hover:text-slate-950 dark:hover:text-ice-white hover:bg-[var(--surface-subtle)] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                          >
                            <ChevronUp className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveLesson(lesson.id, "down")}
                            disabled={idx === lessons.length - 1 || movingId === lesson.id}
                            aria-label={t("admin.lecons.descendre")}
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-white dark:bg-[var(--surface-elevated)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] dark:border-[var(--border-subtle)] flex items-center justify-center text-slate-700 dark:text-ice-white/60 hover:text-slate-950 dark:hover:text-ice-white hover:bg-[var(--surface-subtle)] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                          >
                            <ChevronDown className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-brand-light shrink-0 tabular-nums">
                              {String(lesson.order).padStart(2, "0")}
                            </span>
                            <span className="font-sans font-medium text-ice-white text-sm truncate">
                              {lesson.title}
                            </span>
                            {lesson.isFreePreview && (
                              <span className="shrink-0 text-xs font-mono text-emerald-700 dark:text-emerald-300">
                                · {t("admin.lecon.apercu")}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-slate-600 dark:text-ice-white/55 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{lesson.moduleTitle}</span>
                            <span aria-hidden="true">·</span>
                            <span>{lesson.durationMinutes} min</span>
                            {playback.provider && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1 text-slate-800 dark:text-ice-white/75">
                                  <Video className="w-3 h-3" aria-hidden="true" />
                                  {playback.provider === "tiktok" ? "TikTok" : "YouTube"}
                                </span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLessonId(lesson.id);
                              setAddingLesson(false);
                            }}
                            aria-label={t("admin.lecon.modifier")}
                            className="min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-[var(--surface-elevated)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] dark:border-[var(--border-subtle)] text-slate-800 dark:text-ice-white/80 hover:text-slate-950 dark:hover:text-ice-white hover:bg-[var(--surface-subtle)] font-sans font-medium text-xs cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                          >
                            {t("admin.modifier")}
                          </button>
                          <button
                            type="button"
                            onClick={() => archiveLesson(lesson.id)}
                            disabled={archivingId === lesson.id}
                            aria-label={t("admin.lecon.archiver")}
                            className="min-h-[44px] px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-sans text-xs disabled:opacity-50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                          >
                            {archivingId === lesson.id ? "…" : t("admin.archiver")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Formulaire cours */}
      <div className="p-6 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-5">
        <h2 className="font-display font-semibold text-ice-white text-base">
          {t("admin.formations.infoGenerales")}
        </h2>

        {courseErrors.length > 0 && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs space-y-1">
            {courseErrors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}
        {courseSuccess && (
          <div className="p-3 rounded-xl bg-[var(--surface-active)] dark:bg-brand/15 border border-[var(--home-orange-vivid)]/40 dark:border-brand/30 text-brand-light text-xs">
            {t("admin.formations.succesEnregistrement")}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldGroup label={t("admin.formations.champTitre")}>
            <input
              className={inputClass()}
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t("admin.formations.champTitrePlaceholder")}
            />
          </FieldGroup>
          {isNew && (
            <FieldGroup
              label={t("admin.formations.champSlug")}
              hint={t("admin.formations.champSlugHint")}
            >
              <input
                className={inputClass()}
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((p) => ({
                    ...p,
                    slug: slugifyCourseText(e.target.value, 80),
                  }));
                }}
                placeholder={t("admin.formations.champSlugPlaceholder")}
              />
            </FieldGroup>
          )}
          <FieldGroup label={t("admin.formations.champNiveau")}>
            <select
              className={inputClass()}
              value={form.level}
              onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
            >
              <option value="debutant">{t("catalogue.niveaux.debutant")}</option>
              <option value="intermediaire">{t("catalogue.niveaux.intermediaire")}</option>
              <option value="avance">{t("catalogue.niveaux.avance")}</option>
            </select>
          </FieldGroup>
          <FieldGroup label={t("admin.formations.champLangue")}>
            <select
              className={inputClass()}
              value={form.language}
              onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
            >
              <option value="ht">{t("catalogue.langues.ht")}</option>
              <option value="fr">{t("catalogue.langues.fr")}</option>
              <option value="en">{t("catalogue.langues.en")}</option>
            </select>
          </FieldGroup>
          <FieldGroup label={t("admin.formations.champDuree")}>
            <input
              type="number"
              className={inputClass()}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  durationMinutes: parseInt(e.target.value, 10) || 0,
                }))
              }
              min={0}
            />
          </FieldGroup>
          <FieldGroup label={t("admin.formations.champPrixUSD")}>
            <input
              type="number"
              step="0.01"
              className={inputClass()}
              value={form.priceUSD}
              onChange={(e) => setForm((p) => ({ ...p, priceUSD: e.target.value }))}
              placeholder={t("admin.formations.champPrixPlaceholder")}
              min={0}
            />
          </FieldGroup>
          <FieldGroup label={t("admin.formations.champPrixHTG")}>
            <input
              type="number"
              step="1"
              className={inputClass()}
              value={form.priceHTG}
              onChange={(e) => setForm((p) => ({ ...p, priceHTG: e.target.value }))}
              placeholder={t("admin.formations.champPrixPlaceholder")}
              min={0}
            />
          </FieldGroup>
        </div>

        <CoverImageField
          courseId={isNew ? undefined : id}
          value={form.coverUrl}
          courseTitle={form.title}
          onChange={(nextUrl) => setForm((p) => ({ ...p, coverUrl: nextUrl }))}
          onPersisted={async () => {
            await loadCourse();
          }}
        />

        <FieldGroup label={t("admin.formations.champCourteDescription")}>
          <input
            className={inputClass()}
            value={form.shortDescription}
            onChange={(e) =>
              setForm((p) => ({ ...p, shortDescription: e.target.value }))
            }
            placeholder={t("admin.formations.champCourteDescriptionPlaceholder")}
          />
        </FieldGroup>

        <FieldGroup label={t("admin.formations.champDescription")}>
          <textarea
            className={`${inputClass()} min-h-[120px] resize-y`}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder={t("admin.formations.champDescriptionPlaceholder")}
          />
        </FieldGroup>

        <button
          type="button"
          onClick={saveCourse}
          disabled={saving}
          className="min-h-[48px] px-6 py-3 rounded-full bg-brand text-[var(--brand-fg)] font-sans font-semibold text-sm hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          {saving ? t("admin.enregistrement") : t("admin.enregistrer")}
        </button>
      </div>

      {!isNew && course && (
        <DeleteCourseDialog
          open={deleteDialogOpen}
          courseTitle={course.title}
          deleting={deletingCourse}
          error={deleteCourseError}
          onCancel={() => {
            if (!deletingCourse) {
              setDeleteDialogOpen(false);
              setDeleteCourseError(null);
            }
          }}
          onConfirm={confirmDeleteCourse}
        />
      )}
    </div>
  );
}

export default function AdminFormationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-[var(--surface-subtle)] rounded-xl w-64" />
          <div className="h-48 bg-deep-navy rounded-2xl border border-[var(--border-subtle)]" />
        </div>
      }
    >
      <AdminFormationDetailContent />
    </Suspense>
  );
}
