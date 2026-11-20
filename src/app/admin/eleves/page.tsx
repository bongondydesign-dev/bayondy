"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/apiClient";
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
      if (!res.ok) { setError(t("admin.erreurChargement")); return; }
      const data = (await res.json()) as { students: StudentRow[]; nextCursor: string | null };
      setStudents((prev) => cursor ? [...prev, ...data.students] : data.students);
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
          const sData = (await studRes.json()) as { students: StudentRow[]; nextCursor: string | null };
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
          message: accessAction === "grant"
            ? t("admin.eleves.accesBay")
            : t("admin.eleves.accesRetire"),
        });
        // Recharger la liste des élèves
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          {t("admin.eleves.titre")}
        </h1>
        <p className="font-sans text-ice-white/60 text-sm mt-1">
          {t("admin.eleves.sousTitre")}
        </p>
      </div>

      {/* Formulaire accès manuel */}
      <div className="p-6 rounded-2xl bg-deep-navy border border-white/10 space-y-5">
        <h2 className="font-display font-semibold text-white text-base">
          {t("admin.eleves.accesManuel")}
        </h2>

        <form onSubmit={handleAccessSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-ice-white/60 block">
                {t("auth.email")}
              </label>
              <input
                type="email"
                required
                value={accessEmail}
                onChange={(e) => setAccessEmail(e.target.value)}
                placeholder="eleve@exemple.com"
                className="w-full px-4 py-3 rounded-xl bg-obsidian border border-white/10 text-ice-white placeholder:text-ice-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-aurora min-h-[48px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-ice-white/60 block">
                {t("admin.eleves.formation")}
              </label>
              <select
                value={accessCourseId}
                onChange={(e) => setAccessCourseId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-obsidian border border-white/10 text-ice-white text-sm focus:outline-none focus:ring-2 focus:ring-aurora min-h-[48px]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-ice-white/60 block">
                {t("admin.eleves.action")}
              </label>
              <select
                value={accessAction}
                onChange={(e) => setAccessAction(e.target.value as "grant" | "revoke")}
                className="w-full px-4 py-3 rounded-xl bg-obsidian border border-white/10 text-ice-white text-sm focus:outline-none focus:ring-2 focus:ring-aurora min-h-[48px]"
              >
                <option value="grant">{t("admin.eleves.donner")}</option>
                <option value="revoke">{t("admin.eleves.retirer")}</option>
              </select>
            </div>
          </div>

          {accessResult && (
            <div
              className={`p-3 rounded-xl border text-sm ${
                accessResult.ok
                  ? "bg-aurora/10 border-aurora/30 text-aurora"
                  : "bg-red-500/10 border-red-500/20 text-red-300"
              }`}
            >
              {accessResult.message}
            </div>
          )}

          <button
            type="submit"
            disabled={accessLoading || !accessCourseId}
            className="min-h-[48px] px-6 py-3 rounded-2xl bg-ion-blue text-white font-sans font-semibold text-sm hover:bg-ion-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
          >
            {accessLoading ? t("admin.enregistrement") : t("admin.eleves.appliquer")}
          </button>
        </form>
      </div>

      {/* Liste des élèves */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-white text-base">
          {t("admin.eleves.liste")}
        </h2>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading && students.length === 0 ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-deep-navy/60 border border-white/5" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <p className="text-ice-white/40 text-sm text-center py-8">
            {t("admin.eleves.vide")}
          </p>
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <div
                key={s.uid}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 rounded-2xl bg-deep-navy border border-white/10"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-sans font-medium text-white text-sm block truncate">
                    {s.displayName || s.email}
                  </span>
                  <span className="font-mono text-xs text-ice-white/40 block truncate">
                    {s.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {s.enrollments.length === 0 ? (
                    <span className="text-xs text-ice-white/30 font-mono">
                      {t("admin.eleves.aucuneInscription")}
                    </span>
                  ) : (
                    s.enrollments.map((e, i) => (
                      <span
                        key={i}
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono border ${
                          e.status === "active"
                            ? "bg-aurora/10 text-aurora border-aurora/20"
                            : "bg-white/5 text-ice-white/40 border-white/10"
                        }`}
                      >
                        {e.status}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {nextCursor && (
          <button
            type="button"
            onClick={() => loadStudents(nextCursor)}
            disabled={loading}
            className="w-full min-h-[48px] py-3 rounded-2xl bg-white/5 border border-white/10 text-ice-white/70 hover:text-white hover:bg-white/10 font-sans text-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
          >
            {loading ? t("admin.chargement") : t("admin.eleves.voirPlus")}
          </button>
        )}
      </div>
    </div>
  );
}
