"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { adminFetch } from "@/lib/admin/apiClient";
import { isValidCoverUrl } from "@/lib/admin/cover";
import { filterAdminCourses } from "@/lib/admin/filters";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white">
            {t("admin.formations.titre")}
          </h1>
          <p className="font-sans text-ice-white/65 text-sm mt-1">
            {t("admin.formations.sousTitre")}
          </p>
        </div>
        <Link
          href="/admin/formations/new"
          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 rounded-full bg-brand text-[var(--brand-fg)] font-sans font-semibold text-sm hover:bg-brand-dark dark:hover:bg-brand-light transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t("admin.formations.nouvelle")}
        </Link>
      </div>

      {/* Filter Toolbar */}
      {!loading && !error && courses.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <svg
              className="w-4 h-4 text-ice-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.formations.rechercher")}
              aria-label={t("admin.formations.rechercher")}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-deep-navy border border-[var(--border-strong)] text-ice-white placeholder:text-ice-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-full bg-deep-navy border border-[var(--border-subtle)] self-start md:self-auto"
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
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] text-ice-white/60 text-sm">
          {t("admin.formations.vide")}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] text-ice-white/60 text-sm">
          {t("admin.formations.aucunResultat")}
        </div>
      ) : (
        <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] divide-y divide-[var(--border-faint)] overflow-hidden">
          {filteredCourses.map((c) => {
            const hasCover = isValidCoverUrl(c.coverUrl);
            return (
              <Link
                key={c.id}
                href={`/admin/formations/${c.id}`}
                className="flex items-center justify-between gap-4 p-4 sm:p-5 hover:bg-[var(--surface-subtle)] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-light min-h-[72px]"
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
                      className={`shrink-0 inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                        c.status === "published"
                          ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                          : "bg-[var(--surface-well)] text-ice-white/65 border-[var(--border-subtle)]"
                      }`}
                    >
                      {c.status === "published" ? t("admin.statut.publie") : t("admin.statut.brouillon")}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-ice-white/55 flex items-center gap-2 flex-wrap tabular-nums">
                    <span>{c.lessonsCount} {t("catalogue.lecons")}</span>
                    <span aria-hidden="true">·</span>
                    <span>{c.level}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{c.slug}</span>
                  </p>
                </div>
                <svg className="w-4 h-4 text-ice-white/45 group-hover:text-brand-light transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
