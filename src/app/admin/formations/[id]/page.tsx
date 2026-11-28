"use client";

// ⚠️ NOTE SÉCURITÉ : youtubeVideoId n'est affiché que dans cet espace admin,
// jamais dans les pages publiques ni dans le syllabus côté client.

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { PlayCircle, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/apiClient";
import { CoverImageField } from "@/components/admin/CoverImageField";
import { DeleteCourseDialog } from "@/components/admin/DeleteCourseDialog";
import { t } from "@/lib/i18n";

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
  durationMinutes: number;
  isFreePreview: boolean;
  archived: boolean;
  resources: Array<{ label: string; url: string }>;
}

// ─────────────────────────── Sous-composants ───────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-xs uppercase tracking-wider text-ice-white/65 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function inputClass(error?: boolean) {
  return `w-full px-4 py-3 rounded-xl bg-[var(--surface-well)] border ${
    error ? "border-red-500 dark:border-red-400" : "border-[var(--border-strong)]"
  } text-ice-white placeholder:text-ice-white/40 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-colors min-h-[48px]`;
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
        status === "published"
          ? "bg-brand/15 text-brand-light border border-brand/30"
          : "bg-[var(--surface-well)] text-ice-white/65 border border-[var(--border-subtle)]"
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
  onSave,
  onCancel,
}: {
  courseId: string;
  initial?: AdminLesson;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    moduleId: initial?.moduleId ?? "",
    moduleTitle: initial?.moduleTitle ?? "",
    title: initial?.title ?? "",
    order: initial?.order ?? 0,
    youtubeVideoId: initial?.youtubeVideoId ?? "",
    durationMinutes: initial?.durationMinutes ?? 0,
    isFreePreview: initial?.isFreePreview ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const save = async () => {
    setSaving(true);
    setErrors([]);
    try {
      let res: Response;
      if (initial) {
        res = await adminFetch(`/api/admin/lessons/${initial.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        res = await adminFetch(`/api/admin/courses/${courseId}/lessons`, {
          method: "POST",
          body: JSON.stringify({ ...form, courseId }),
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
      <h3 className="font-display font-semibold text-ice-white text-sm">
        {initial ? t("admin.lecon.modifier") : t("admin.lecon.ajouter")}
      </h3>

      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs space-y-1">
          {errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label={t("admin.lecon.champModuleId")}>
          <input
            className={inputClass()}
            value={form.moduleId}
            onChange={(e) => setForm((p) => ({ ...p, moduleId: e.target.value }))}
            placeholder={t("admin.lecon.champModuleIdPlaceholder")}
          />
        </FieldGroup>
        <FieldGroup label={t("admin.lecon.champModuleTitre")}>
          <input
            className={inputClass()}
            value={form.moduleTitle}
            onChange={(e) => setForm((p) => ({ ...p, moduleTitle: e.target.value }))}
            placeholder={t("admin.lecon.champModuleTitrePlaceholder")}
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
        <FieldGroup label={t("admin.lecon.champVideoId")}>
          <input
            className={inputClass()}
            value={form.youtubeVideoId}
            onChange={(e) => setForm((p) => ({ ...p, youtubeVideoId: e.target.value }))}
            maxLength={11}
          />
        </FieldGroup>
        <FieldGroup label={t("admin.lecon.champOrdre")}>
          <input
            type="number"
            className={inputClass()}
            value={form.order}
            onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value, 10) || 0 }))}
            min={0}
            max={9999}
          />
        </FieldGroup>
        <FieldGroup label={t("admin.lecon.champDuree")}>
          <input
            type="number"
            className={inputClass()}
            value={form.durationMinutes}
            onChange={(e) => setForm((p) => ({ ...p, durationMinutes: parseInt(e.target.value, 10) || 0 }))}
            min={0}
          />
        </FieldGroup>
      </div>

      <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={form.isFreePreview}
          onChange={(e) => setForm((p) => ({ ...p, isFreePreview: e.target.checked }))}
          className="w-5 h-5 rounded border-[var(--border-strong)] bg-[var(--surface-elevated)] accent-brand"
        />
        <span className="font-sans text-sm text-ice-white/80">{t("admin.lecon.champApercu")}</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="min-h-[48px] px-5 py-2.5 rounded-full bg-brand text-[var(--brand-fg)] font-sans font-semibold text-sm hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          {saving ? t("admin.enregistrement") : t("admin.enregistrer")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-[48px] px-5 py-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-ice-white/80 font-sans text-sm hover:text-ice-white hover:border-brand/40 disabled:opacity-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          {t("admin.annuler")}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── Page principale ───────────────────────────

export default function AdminFormationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const isNew = id === "new";
  const router = useRouter();

  const [course, setCourse] = useState<AdminCourse | null>(null);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [loading, setLoading] = useState(!isNew);

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

  const [saving, setSaving] = useState(false);
  const [courseErrors, setCourseErrors] = useState<string[]>([]);
  const [courseSuccess, setCourseSuccess] = useState(false);

  // Leçon en cours d'édition
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Archivage
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Suppression de formation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [deleteCourseError, setDeleteCourseError] = useState<string | null>(null);

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

  const saveCourse = async () => {
    setSaving(true);
    setCourseErrors([]);
    setCourseSuccess(false);

    const normalizedSlug = (form.slug.trim() || form.title.trim())
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

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
    if (isNew) payload.slug = normalizedSlug;

    try {
      let res: Response;
      if (isNew) {
        res = await adminFetch("/api/admin/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = (await res.json()) as { id: string };
          router.replace(`/admin/formations/${data.id}`);
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
    const idx = lessons.findIndex((l) => l.id === lessonId);
    if (idx < 0) return;
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= lessons.length) return;

    const a = lessons[idx];
    const b = lessons[target];

    // Swap orders
    await Promise.all([
      adminFetch(`/api/admin/lessons/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ order: b.order }),
      }),
      adminFetch(`/api/admin/lessons/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    await loadCourse();
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
            {isNew ? t("admin.formations.nouvelle") : (course?.title ?? "")}
          </h1>
          {course && (
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={course.status} />
              <span className="font-mono text-xs text-ice-white/55">/{course.slug}</span>
            </div>
          )}
        </div>
        {!isNew && course && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {lessons.length > 0 && (
              <Link
                href={`/mes-formations/${course.slug}`}
                className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-ice-white/90 hover:text-ice-white hover:border-brand/50 font-sans font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <PlayCircle className="w-4 h-4 text-brand-light" aria-hidden="true" />
                <span>{t("catalogue.boutonAcceder")}</span>
              </Link>
            )}
            <button
              type="button"
              onClick={toggleStatus}
              disabled={saving}
              className={`shrink-0 min-h-[48px] px-5 py-2.5 rounded-full font-sans font-semibold text-sm transition-all duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                course.status === "published"
                  ? "bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-ice-white/85 hover:text-ice-white hover:border-brand/40"
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

      {/* Formulaire cours */}
      <div className="p-6 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-5">
        <h2 className="font-display font-semibold text-ice-white text-base">
          {t("admin.formations.infoGenerales")}
        </h2>

        {courseErrors.length > 0 && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs space-y-1">
            {courseErrors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}
        {courseSuccess && (
          <div className="p-3 rounded-xl bg-brand/15 border border-brand/30 text-brand-light text-xs">
            {t("admin.formations.succesEnregistrement")}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {isNew && (
            <FieldGroup label={t("admin.formations.champSlug")}>
              <input
                className={inputClass()}
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                placeholder={t("admin.formations.champSlugPlaceholder")}
              />
            </FieldGroup>
          )}
          <FieldGroup label={t("admin.formations.champTitre")}>
            <input
              className={inputClass()}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t("admin.formations.champTitrePlaceholder")}
            />
          </FieldGroup>
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
              onChange={(e) => setForm((p) => ({ ...p, durationMinutes: parseInt(e.target.value, 10) || 0 }))}
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
            onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))}
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
          className="min-h-[48px] px-6 py-3 rounded-full bg-brand text-[var(--brand-fg)] font-sans font-semibold text-sm hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          {saving ? t("admin.enregistrement") : t("admin.enregistrer")}
        </button>
      </div>

      {/* Gestion des leçons (seulement si la formation existe) */}
      {!isNew && (
        <div className="p-6 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display font-semibold text-ice-white text-base">
              {t("admin.lecons.titre")} ({lessons.length})
            </h2>
            {!addingLesson && (
              <button
                type="button"
                onClick={() => { setAddingLesson(true); setEditingLessonId(null); }}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-brand/15 border border-brand/30 text-brand-light font-sans font-medium text-sm hover:bg-brand/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {t("admin.lecons.ajouter")}
              </button>
            )}
          </div>

          {/* Formulaire ajout */}
          {addingLesson && (
            <LessonForm
              courseId={id}
              onSave={async () => { setAddingLesson(false); await loadCourse(); }}
              onCancel={() => setAddingLesson(false)}
            />
          )}

          {/* Liste des leçons */}
          {lessons.length === 0 && !addingLesson ? (
            <p className="text-ice-white/55 text-sm text-center py-6">
              {t("admin.lecons.vide")}
            </p>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id}>
                  {editingLessonId === lesson.id ? (
                    <LessonForm
                      courseId={id}
                      initial={lesson}
                      onSave={async () => { setEditingLessonId(null); await loadCourse(); }}
                      onCancel={() => setEditingLessonId(null)}
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)] hover:border-[var(--border-subtle)] transition-colors">
                      {/* Boutons Monter/Descendre */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveLesson(lesson.id, "up")}
                          disabled={idx === 0}
                          aria-label={t("admin.lecons.monter")}
                          className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-ice-white/60 hover:text-ice-white hover:bg-[var(--surface-subtle)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLesson(lesson.id, "down")}
                          disabled={idx === lessons.length - 1}
                          aria-label={t("admin.lecons.descendre")}
                          className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-ice-white/60 hover:text-ice-white hover:bg-[var(--surface-subtle)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Infos leçon */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-brand-light shrink-0">
                            {String(lesson.order).padStart(2, "0")}
                          </span>
                          <span className="font-sans font-medium text-ice-white text-sm truncate">
                            {lesson.title}
                          </span>
                          {lesson.isFreePreview && (
                            <span className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded-md bg-brand/15 text-brand-light border border-brand/30">
                              {t("admin.lecon.apercu")}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-ice-white/55 mt-0.5 block">
                          {lesson.moduleTitle} · {lesson.durationMinutes} min
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => { setEditingLessonId(lesson.id); setAddingLesson(false); }}
                          aria-label={t("admin.lecon.modifier")}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-ice-white/80 hover:text-ice-white hover:bg-[var(--surface-subtle)] font-sans text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                        >
                          {t("admin.modifier")}
                        </button>
                        <button
                          type="button"
                          onClick={() => archiveLesson(lesson.id)}
                          disabled={archivingId === lesson.id}
                          aria-label={t("admin.lecon.archiver")}
                          className="min-h-[44px] px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-sans text-xs disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        >
                          {archivingId === lesson.id ? "…" : t("admin.archiver")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
