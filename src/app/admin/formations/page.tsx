"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Plus, Search, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/apiClient";
import { isValidCoverUrl } from "@/lib/admin/cover";
import { removeCourseFromList } from "@/lib/admin/courseDeletion";
import { filterAdminCourses } from "@/lib/admin/filters";
import { DeleteCourseDialog } from "@/components/admin/DeleteCourseDialog";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { t } from "@/lib/i18n";

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  lessonsCount: number;
  level: string;
  coverUrl?: string | null;
}

export default function AdminFormationsPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const [courseToDelete, setCourseToDelete] = useState<CourseRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCourses() {
      try {
        const res = await adminFetch("/api/admin/courses");
        if (!res.ok) {
          if (!cancelled) setError(t("admin.erreurChargement"));
          return;
        }
        const data = (await res.json()) as { courses: CourseRow[] };
        if (!cancelled) setCourses(data.courses);
      } catch {
        if (!cancelled) setError(t("admin.erreurChargement"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    let published = 0;
    let draft = 0;
    for (const c of courses) {
      if (c.status === "published") published++;
      else draft++;
    }
    return { all: courses.length, published, draft };
  }, [courses]);

  const filteredCourses = useMemo(
    () => filterAdminCourses(courses, search, statusFilter),
    [courses, search, statusFilter]
  );

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await adminFetch(`/api/admin/courses/${courseToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setDeleteError(data?.error ?? t("admin.formations.erreurSuppression"));
        return;
      }
      setCourses((prev) => removeCourseFromList(prev, courseToDelete.id));
      setCourseToDelete(null);
    } catch {
      setDeleteError(t("admin.formations.erreurSuppression"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white">
            {t("admin.formations.titre")}
          </h1>
          <p className="font-sans text-slate-600 dark:text-ice-white/65 text-sm mt-1">
            {t("admin.formations.sousTitre")}
          </p>
        </div>
        <Link
          href="/admin/formations/new"
          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 rounded-full bg-brand text-[var(--brand-fg)] font-sans font-semibold text-sm hover:bg-brand-dark dark:hover:bg-brand-light transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t("admin.formations.nouvelle")}</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      {!loading && !error && courses.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-slate-500 dark:text-ice-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.formations.rechercher")}
              aria-label={t("admin.formations.rechercher")}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none text-ice-white placeholder:text-slate-500 dark:placeholder:text-ice-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-full bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none self-start md:self-auto"
            role="group"
            aria-label={t("admin.formations.titre")}
          >
            {(
              [
                { key: "all", label: t("admin.formations.filtreTout"), count: counts.all },
                { key: "published", label: t("admin.statut.publie"), count: counts.published },
                { key: "draft", label: t("admin.statut.brouillon"), count: counts.draft },
              ] as Array<{ key: "all" | "published" | "draft"; label: string; count: number }>
            ).map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  aria-pressed={active}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-full font-sans text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                    active
                      ? "bg-[#12141B] text-white dark:bg-brand dark:text-[var(--brand-fg)]"
                      : "text-slate-700 dark:text-ice-white/70 hover:text-slate-950 dark:hover:text-ice-white"
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
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-2xl surface-glass border border-[var(--border-subtle)]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-10 text-center rounded-2xl surface-glass border border-[var(--border-subtle)] text-slate-600 dark:text-ice-white/60 text-sm">
          {t("admin.formations.vide")}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-10 text-center rounded-2xl surface-glass border border-[var(--border-subtle)] text-slate-600 dark:text-ice-white/60 text-sm">
          {t("admin.formations.aucunResultat")}
        </div>
      ) : (
        <div className="rounded-2xl surface-glass border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] overflow-hidden">
          {filteredCourses.map((c) => {
            const hasCover = isValidCoverUrl(c.coverUrl);
            return (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-[var(--surface-subtle)] transition-colors min-h-[72px]"
              >
                <Link
                  href={`/admin/formations/${c.id}`}
                  className="flex-1 min-w-0 flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-xl"
                >
                  <div className="relative w-20 sm:w-24 aspect-video rounded-xl overflow-hidden bg-[var(--surface-well)] border border-[var(--border-subtle)] shrink-0 flex items-center justify-center">
                    {hasCover && c.coverUrl ? (
                      <Image
                        src={c.coverUrl}
                        alt={c.title}
                        fill
                        referrerPolicy="no-referrer"
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <PortalSymbol accent="brand" size={24} className="opacity-75" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-sans font-semibold text-ice-white text-sm sm:text-base truncate group-hover:text-brand-light transition-colors">
                        {c.title}
                      </span>
                      <span
                        className={`shrink-0 font-mono text-xs font-medium ${
                          c.status === "published"
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-600 dark:text-ice-white/55"
                        }`}
                      >
                        · {c.status === "published" ? t("admin.statut.publie") : t("admin.statut.brouillon")}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 dark:text-ice-white/55 flex items-center gap-2 flex-wrap tabular-nums">
                      <span>{c.lessonsCount} {t("catalogue.lecons")}</span>
                      <span aria-hidden="true">·</span>
                      <span>{c.level}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{c.slug}</span>
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setCourseToDelete(c);
                    }}
                    aria-label={`${t("admin.formations.supprimer")} ${c.title}`}
                    title={t("admin.formations.supprimer")}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <Link
                    href={`/admin/formations/${c.id}`}
                    aria-label={`${t("admin.modifier")} ${c.title}`}
                    className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-[var(--border-strong)] dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--surface-well)] shadow-2xs dark:shadow-none text-slate-700 dark:text-ice-white/60 hover:text-brand-light hover:border-brand/50 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteCourseDialog
        open={Boolean(courseToDelete)}
        courseTitle={courseToDelete?.title ?? ""}
        deleting={deleting}
        error={deleteError}
        onCancel={() => {
          if (!deleting) {
            setCourseToDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
