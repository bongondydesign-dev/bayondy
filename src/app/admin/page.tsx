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

const PAYMENT_STATUS_ORDER = ["paid", "pending", "failed", "expired", "refunded"];

function barColor(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-500";
    case "pending":
      return "bg-amber-400";
    case "failed":
    case "expired":
      return "bg-red-500";
    default:
      return "bg-slate-400";
  }
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
          if (!cancelled) setError(t("admin.erreurChargement"));
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
    return () => {
      cancelled = true;
    };
  }, []);

  const paymentEntries = stats
    ? Object.entries(stats.payments || {}).sort((a, b) => {
        const idxA = PAYMENT_STATUS_ORDER.indexOf(a[0]);
        const idxB = PAYMENT_STATUS_ORDER.indexOf(b[0]);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      })
    : [];

  const totalPayments = paymentEntries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="space-y-8">
      {/* Architectural Admin Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-deep-navy dark:bg-[#0A0B0F] border border-[var(--border-subtle)] dark:border-white/10 p-6 sm:p-8 text-ice-white dark:text-[#F4F5F7] space-y-6 shadow-[var(--card-shadow)] dark:shadow-xl">
        <div
          className="pointer-events-none absolute -bottom-24 right-12 w-96 h-96 rounded-full opacity-20 dark:opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,91,34,0.34) 0%, rgba(201,62,14,0.08) 55%, transparent 75%)",
          }}
          aria-hidden="true"
        />
        <svg
          className="pointer-events-none absolute -top-16 -right-12 w-72 h-72 opacity-25 dark:opacity-45 text-slate-900/15 dark:text-white/15"
          viewBox="0 0 240 240"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="120"
            cy="120"
            r="96"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <circle cx="52" cy="70" r="2.5" fill="#FF885C" />
          <circle cx="176" cy="148" r="2.5" fill="#FF5B22" />
        </svg>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-light dark:text-[#FF885C]">
              {t("admin.navigation")}
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-4xl tracking-tight text-ice-white dark:text-white">
              {t("admin.tableau.titre")}
            </h1>
            <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-slate-300/80">
              {t("admin.tableau.sousTitre")}
            </p>
          </div>

          <Link
            href="/admin/formations/new"
            className="min-h-[44px] px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:bg-[#FF5B22] dark:hover:bg-[#FF885C] text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[var(--brand-glow)] shrink-0 self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{t("admin.formations.nouvelle")}</span>
          </Link>
        </div>

        {/* 4 Real KPI Tiles */}
        {loading ? (
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-[var(--surface-well)] dark:bg-white/[0.06] border border-[var(--border-subtle)] dark:border-white/10"
              />
            ))}
          </div>
        ) : error ? (
          <div className="relative z-10 p-4 rounded-xl bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-400/30 text-red-700 dark:text-red-200 text-sm">
            {error}
          </div>
        ) : stats ? (
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Link
              href="/admin/formations"
              className="rounded-2xl bg-[var(--surface-well)] hover:bg-[var(--surface-active)] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[var(--border-subtle)] dark:border-white/10 p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                {t("admin.tableau.formationsPubliees")}
              </span>
              <span className="font-display font-bold text-2xl sm:text-3xl text-brand dark:text-[#FF885C] tabular-nums mt-1 block">
                {stats.courses.published}
              </span>
            </Link>

            <Link
              href="/admin/formations"
              className="rounded-2xl bg-[var(--surface-well)] hover:bg-[var(--surface-active)] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[var(--border-subtle)] dark:border-white/10 p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                {t("admin.tableau.formationsDraft")}
              </span>
              <span className="font-display font-bold text-2xl sm:text-3xl text-ice-white dark:text-white tabular-nums mt-1 block">
                {stats.courses.draft}
              </span>
            </Link>

            <Link
              href="/admin/eleves"
              className="rounded-2xl bg-[var(--surface-well)] hover:bg-[var(--surface-active)] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[var(--border-subtle)] dark:border-white/10 p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                {t("admin.tableau.inscriptionsActives")}
              </span>
              <span className="font-display font-bold text-2xl sm:text-3xl text-amber-600 dark:text-amber-300 tabular-nums mt-1 block">
                {stats.enrollments.active}
              </span>
            </Link>

            <Link
              href="/admin/eleves"
              className="rounded-2xl bg-[var(--surface-well)] hover:bg-[var(--surface-active)] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-[var(--border-subtle)] dark:border-white/10 p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                {t("admin.tableau.elevesUniques")}
              </span>
              <span className="font-display font-bold text-2xl sm:text-3xl text-ice-white dark:text-white tabular-nums mt-1 block">
                {stats.students.unique}
              </span>
            </Link>
          </div>
        ) : null}
      </section>

      {/* 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Payment Breakdown (7 cols) */}
        <section className="lg:col-span-7 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display font-semibold text-lg text-ice-white">
              {t("admin.tableau.repartitionPaiements")}
            </h2>
            <Link
              href="/admin/paiements"
              className="font-mono text-xs text-brand-light hover:underline"
            >
              {t("admin.nav.paiements")} →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-[var(--surface-well)]" />
              ))}
            </div>
          ) : paymentEntries.length === 0 ? (
            <p className="font-sans text-sm text-ice-white/60 py-6 text-center">
              {t("admin.tableau.aucunPaiementStat")}
            </p>
          ) : (
            <div className="space-y-4">
              {paymentEntries.map(([status, count]) => {
                const pct =
                  totalPayments > 0 ? Math.round((count / totalPayments) * 100) : 0;
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="uppercase tracking-wider text-ice-white/75">
                        {status}
                      </span>
                      <span className="text-ice-white font-semibold tabular-nums">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--surface-well)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor(
                          status
                        )}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Actions (5 cols) */}
        <section className="lg:col-span-5 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg text-ice-white">
            {t("admin.tableau.actionsRapides")}
          </h2>

          <div className="space-y-3">
            <Link
              href="/admin/formations/new"
              className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] hover:border-brand/45 transition-colors min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg bg-brand/12 border border-brand/25 text-brand flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <span className="font-sans font-medium text-sm text-ice-white truncate">
                  {t("admin.tableau.actionNouvelleFormation")}
                </span>
              </span>
              <svg className="w-4 h-4 text-ice-white/45 group-hover:text-brand-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/eleves"
              className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] hover:border-brand/45 transition-colors min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg bg-brand/12 border border-brand/25 text-brand flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
                <span className="font-sans font-medium text-sm text-ice-white truncate">
                  {t("admin.tableau.actionGererEleves")}
                </span>
              </span>
              <svg className="w-4 h-4 text-ice-white/45 group-hover:text-brand-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/admin/paiements"
              className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] hover:border-brand/45 transition-colors min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-lg bg-deep-navy border border-[var(--border-subtle)] text-ice-white/75 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </span>
                <span className="font-sans font-medium text-sm text-ice-white truncate">
                  {t("admin.tableau.actionVoirPaiements")}
                </span>
              </span>
              <svg className="w-4 h-4 text-ice-white/45 group-hover:text-brand-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
