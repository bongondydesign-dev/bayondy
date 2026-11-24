"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin/apiClient";
import { t } from "@/lib/i18n";

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  lessonsCount: number;
  level: string;
}

export default function AdminFormationsPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            {t("admin.formations.titre")}
          </h1>
          <p className="font-sans text-ice-white/60 text-sm mt-1">
            {t("admin.formations.sousTitre")}
          </p>
        </div>
        <Link
          href="/admin/formations/new"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-full bg-brand text-[#07080A] font-sans font-semibold text-sm hover:bg-brand-light transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t("admin.formations.nouvelle")}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#0D0E11] border border-white/[0.06]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
      ) : courses.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#0D0E11] border border-white/[0.08] text-ice-white/55 text-sm">
          {t("admin.formations.vide")}
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/admin/formations/${c.id}`}
              className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-[#0D0E11] border border-white/[0.08] hover:border-brand/40 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light min-h-[64px]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans font-medium text-white text-sm sm:text-base truncate group-hover:text-brand-light transition-colors">
                    {c.title}
                  </span>
                  <span
                    className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                      c.status === "published"
                        ? "bg-brand/15 text-brand-light border border-brand/30"
                        : "bg-white/5 text-ice-white/55 border border-white/10"
                    }`}
                  >
                    {c.status === "published" ? t("admin.statut.publie") : t("admin.statut.brouillon")}
                  </span>
                </div>
                <span className="font-mono text-xs text-ice-white/45 mt-0.5 block">
                  {c.lessonsCount} {t("catalogue.lecons")} · {c.level}
                </span>
              </div>
              <svg className="w-4 h-4 text-ice-white/35 group-hover:text-brand-light transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
