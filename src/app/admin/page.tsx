"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin/apiClient";
import { t } from "@/lib/i18n";

interface Stats {
  courses: { published: number; draft: number };
  enrollments: { active: number };
  students: { unique: number };
  payments: Record<string, number>;
}

function StatCard({
  label,
  value,
  href,
  color = "brand",
}: {
  label: string;
  value: number | string;
  href?: string;
  color?: "brand" | "light" | "white";
}) {
  const colorClass =
    color === "brand"
      ? "text-brand"
      : color === "light"
      ? "text-brand-light"
      : "text-white";

  const content = (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0E11] border border-white/[0.08] hover:border-white/[0.16] transition-colors space-y-2">
      <span className="font-mono text-xs uppercase tracking-wider text-ice-white/55 block">
        {label}
      </span>
      <span className={`font-display font-bold text-3xl sm:text-4xl tabular-nums ${colorClass}`}>
        {value}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-2xl">
        {content}
      </Link>
    );
  }
  return content;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await adminFetch("/api/admin/stats");
        if (!res.ok) {
          setError(t("admin.erreurChargement"));
          return;
        }
        const data = (await res.json()) as Stats;
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setError(t("admin.erreurChargement"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          {t("admin.tableau.titre")}
        </h1>
        <p className="font-sans text-ice-white/60 text-sm mt-1">
          {t("admin.tableau.sousTitre")}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#0D0E11] border border-white/[0.06]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label={t("admin.tableau.formationsPubliees")}
            value={stats.courses.published}
            href="/admin/formations"
            color="brand"
          />
          <StatCard
            label={t("admin.tableau.formationsDraft")}
            value={stats.courses.draft}
            href="/admin/formations"
            color="white"
          />
          <StatCard
            label={t("admin.tableau.inscriptionsActives")}
            value={stats.enrollments.active}
            href="/admin/eleves"
            color="light"
          />
          <StatCard
            label={t("admin.tableau.elevesUniques")}
            value={stats.students.unique}
            href="/admin/eleves"
            color="brand"
          />
        </div>
      ) : null}

      {/* Liens rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/formations"
          className="group flex items-center gap-4 p-5 rounded-2xl bg-[#0D0E11] border border-white/[0.08] hover:border-brand/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light min-h-[64px]"
        >
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
            <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-sans font-medium text-ice-white/85 group-hover:text-white transition-colors text-sm">
            {t("admin.nav.formations")}
          </span>
        </Link>

        <Link
          href="/admin/eleves"
          className="group flex items-center gap-4 p-5 rounded-2xl bg-[#0D0E11] border border-white/[0.08] hover:border-brand/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light min-h-[64px]"
        >
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
            <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="font-sans font-medium text-ice-white/85 group-hover:text-white transition-colors text-sm">
            {t("admin.nav.eleves")}
          </span>
        </Link>

        <Link
          href="/admin/paiements"
          className="group flex items-center gap-4 p-5 rounded-2xl bg-[#0D0E11] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light min-h-[64px]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shrink-0 group-hover:bg-white/[0.1] transition-colors">
            <svg className="w-5 h-5 text-ice-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="font-sans font-medium text-ice-white/85 group-hover:text-white transition-colors text-sm">
            {t("admin.nav.paiements")}
          </span>
        </Link>
      </div>
    </div>
  );
}
