"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { adminFetch } from "@/lib/admin/apiClient";
import { filterAdminStudents } from "@/lib/admin/filters";
import { t } from "@/lib/i18n";

interface EnrollmentRef {
  courseId: string;
  status: string;
}

interface StudentRow {
  uid: string;
  displayName: string;
  email: string;
  createdAt: string | null;
  enrollments: EnrollmentRef[];
}

interface CourseOption {
  id: string;
  title: string;
}

export default function AdminElevesPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [enrollmentFilter, setEnrollmentFilter] = useState<"all" | "enrolled" | "unenrolled">("all");

  // Formulaire accès
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [accessEmail, setAccessEmail] = useState("");
  const [accessCourseId, setAccessCourseId] = useState("");
  const [accessAction, setAccessAction] = useState<"grant" | "revoke">("grant");
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessResult, setAccessResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function loadStudents(cursor?: string) {
    if (cursor) setLoading(true);
    setError(null);
    try {
      const url = cursor
        ? `/api/admin/students?startAfter=${cursor}`
        : "/api/admin/students";
      const res = await adminFetch(url);
      if (!res.ok) {
        setError(t("admin.erreurChargement"));
        return;
      }
      const data = (await res.json()) as { students: StudentRow[]; nextCursor: string | null };
      setStudents((prev) => (cursor ? [...prev, ...data.students] : data.students));
      setNextCursor(data.nextCursor);
    } catch {
      setError(t("admin.erreurChargement"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [studRes, courseRes] = await Promise.all([
          adminFetch("/api/admin/students"),
          adminFetch("/api/admin/courses"),
        ]);
        if (!cancelled && studRes.ok) {
          const sData = (await studRes.json()) as {
            students: StudentRow[];
            nextCursor: string | null;
          };
          setStudents(sData.students);
          setNextCursor(sData.nextCursor);
        }
        if (!cancelled && courseRes.ok) {
          const cData = (await courseRes.json()) as { courses: CourseOption[] };
          setCourses(cData.courses);
          if (cData.courses.length > 0) setAccessCourseId(cData.courses[0].id);
        }
      } catch {
        if (!cancelled) setError(t("admin.erreurChargement"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessEmail.trim() || !accessCourseId) return;
    setAccessLoading(true);
    setAccessResult(null);
    try {
      const res = await adminFetch("/api/admin/acces", {
        method: "POST",
        body: JSON.stringify({
          email: accessEmail.trim(),
          courseId: accessCourseId,
          action: accessAction,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAccessResult({
          ok: true,
          message:
            accessAction === "grant"
              ? t("admin.eleves.accesBay")
              : t("admin.eleves.accesRetire"),
        });
        await loadStudents();
      } else {
        setAccessResult({ ok: false, message: data.error ?? t("admin.erreurServeur") });
      }
    } catch {
      setAccessResult({ ok: false, message: t("admin.erreurServeur") });
    } finally {
      setAccessLoading(false);
    }
  };

  const courseTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of courses) {
      map.set(c.id, c.title);
    }
    return map;
  }, [courses]);

  const counts = useMemo(() => {
    let enrolled = 0;
    let unenrolled = 0;
    for (const s of students) {
      if (s.enrollments.some((e) => e.status === "active")) enrolled++;
      else unenrolled++;
    }
    return { all: students.length, enrolled, unenrolled };
  }, [students]);

  const filteredStudents = useMemo(
    () => filterAdminStudents(students, search, enrollmentFilter),
    [students, search, enrollmentFilter]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white">
          {t("admin.eleves.titre")}
        </h1>
        <p className="font-sans text-slate-600 dark:text-ice-white/65 text-sm mt-1">
          {t("admin.eleves.sousTitre")}
        </p>
      </div>

      {/* Formulaire accès manuel */}
      <div className="p-6 rounded-2xl surface-glass border border-[var(--border-subtle)] space-y-5">
        <h2 className="font-display font-semibold text-ice-white text-base">
          {t("admin.eleves.accesManuel")}
        </h2>

        <form onSubmit={handleAccessSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-access-email"
                className="font-mono text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/65 block"
              >
                {t("auth.email")}
              </label>
              <input
                id="admin-access-email"
                type="email"
                required
                value={accessEmail}
                onChange={(e) => setAccessEmail(e.target.value)}
                placeholder={t("admin.eleves.placeholderEmail")}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[var(--surface-well)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] text-ice-white placeholder:text-slate-500 dark:placeholder:text-ice-white/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-light min-h-[48px]"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="admin-access-course"
                className="font-mono text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/65 block"
              >
                {t("admin.eleves.formation")}
              </label>
              <select
                id="admin-access-course"
                value={accessCourseId}
                onChange={(e) => setAccessCourseId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[var(--surface-well)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] text-ice-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-light min-h-[48px]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="admin-access-action"
                className="font-mono text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/65 block"
              >
                {t("admin.eleves.action")}
              </label>
              <select
                id="admin-access-action"
                value={accessAction}
                onChange={(e) => setAccessAction(e.target.value as "grant" | "revoke")}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[var(--surface-well)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] text-ice-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-light min-h-[48px]"
              >
                <option value="grant">{t("admin.eleves.donner")}</option>
                <option value="revoke">{t("admin.eleves.retirer")}</option>
              </select>
            </div>
          </div>

          {accessResult && (
            <div
              role="status"
              className={`p-3 rounded-xl border text-sm ${
                accessResult.ok
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300"
              }`}
            >
              {accessResult.message}
            </div>
          )}

          <button
            type="submit"
            disabled={accessLoading || !accessCourseId}
            className="min-h-[46px] px-6 py-2.5 rounded-full bg-brand text-[var(--brand-fg)] font-sans font-semibold text-sm hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {accessLoading ? t("admin.enregistrement") : t("admin.eleves.appliquer")}
          </button>
        </form>
      </div>

      {/* Liste des élèves */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-ice-white text-base">
            {t("admin.eleves.liste")}
          </h2>

          {students.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative">
                <Search
                  className="w-4 h-4 text-slate-500 dark:text-ice-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("admin.eleves.rechercher")}
                  aria-label={t("admin.eleves.rechercher")}
                  className="w-full sm:w-64 min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none text-ice-white placeholder:text-slate-500 dark:placeholder:text-ice-white/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
                />
              </div>

              <div
                className="inline-flex items-center gap-1 p-1 rounded-full bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none self-start sm:self-auto"
                role="group"
                aria-label={t("admin.eleves.liste")}
              >
                {(
                  [
                    { key: "all", label: t("admin.eleves.filtreTous"), count: counts.all },
                    { key: "enrolled", label: t("admin.eleves.filtreInscrits"), count: counts.enrolled },
                    { key: "unenrolled", label: t("admin.eleves.filtreSans"), count: counts.unenrolled },
                  ] as Array<{ key: "all" | "enrolled" | "unenrolled"; label: string; count: number }>
                ).map((tab) => {
                  const active = enrollmentFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setEnrollmentFilter(tab.key)}
                      aria-pressed={active}
                      className={`min-h-[44px] px-3 py-1.5 rounded-full font-sans text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
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
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading && students.length === 0 ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl surface-glass border border-[var(--border-subtle)]" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl surface-glass border border-[var(--border-subtle)]">
            <p className="text-slate-600 dark:text-ice-white/55 text-sm">{t("admin.eleves.vide")}</p>
          </div>
        ) : (
          <div className="rounded-2xl surface-glass border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] overflow-hidden">
            {filteredStudents.map((s) => {
              const label = s.displayName || s.email || "B";
              const initial = label.charAt(0).toUpperCase();
              return (
                <div
                  key={s.uid}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 hover:bg-[var(--surface-subtle)] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand/12 border border-brand/25 text-brand font-display font-bold text-sm flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <span className="font-sans font-medium text-ice-white text-sm block truncate">
                        {s.displayName || s.email}
                      </span>
                      <span className="font-mono text-xs text-slate-600 dark:text-ice-white/55 block truncate">
                        {s.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {s.enrollments.length === 0 ? (
                      <span className="text-xs text-slate-600 dark:text-ice-white/45 font-mono">
                        {t("admin.eleves.aucuneInscription")}
                      </span>
                    ) : (
                      s.enrollments.map((e, i) => {
                        const courseName = courseTitleMap.get(e.courseId) || e.courseId;
                        return (
                          <span
                            key={i}
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono border max-w-[220px] truncate ${
                              e.status === "active"
                                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                                : "bg-[var(--surface-well)] text-slate-700 dark:text-ice-white/60 border-[var(--border-subtle)]"
                            }`}
                            title={`${courseName} (${e.status})`}
                          >
                            {courseName}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {nextCursor && (
          <button
            type="button"
            onClick={() => loadStudents(nextCursor)}
            disabled={loading}
            className="w-full min-h-[46px] py-2.5 rounded-full bg-white dark:bg-[var(--surface-elevated)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] text-slate-800 dark:text-ice-white/80 hover:text-slate-950 dark:hover:text-ice-white hover:border-brand/40 font-sans font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {loading ? t("admin.chargement") : t("admin.eleves.voirPlus")}
          </button>
        )}
      </div>
    </div>
  );
}
