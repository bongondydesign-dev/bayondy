"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  GraduationCap,
  Plus,
  Receipt,
  Search,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { adminFetch } from "@/lib/admin/apiClient";
import {
  filterRecentDashboardPayments,
  type MonthlyActivityPoint,
  type RecentAdminPayment,
} from "@/lib/admin/stats";
import { t } from "@/lib/i18n";

interface StatsResponse {
  courses: { published: number; draft: number };
  enrollments: { active: number };
  students: { unique: number };
  payments: Record<string, number>;
  revenue?: { HTG: number; USD: number };
  monthlyActivity?: MonthlyActivityPoint[];
  recentPayments?: RecentAdminPayment[];
}

const PAYMENT_STATUS_ORDER = [
  "paid",
  "pending",
  "awaiting_payment",
  "failed",
  "expired",
  "refunded",
];

function barColor(status: string): string {
  switch (status) {
    case "paid":
      return "bg-[#F04E18] dark:bg-[#FF5B22]";
    case "pending":
    case "awaiting_payment":
      return "bg-amber-400";
    case "failed":
    case "expired":
      return "bg-red-500";
    default:
      return "bg-slate-400";
  }
}

function TransactionStatus({ status }: { status: string }) {
  const label = t(`mesFormations.paiementStatut.${status}`);
  const displayLabel = label.startsWith("mesFormations.paiementStatut.") ? status : label;

  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{displayLabel}</span>
        </span>
      );
    case "pending":
    case "awaiting_payment":
      return (
        <span className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-amber-700 dark:text-amber-300 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{displayLabel}</span>
        </span>
      );
    case "failed":
    case "expired":
      return (
        <span className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-red-700 dark:text-red-300 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{displayLabel}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-ice-white/70 whitespace-nowrap">
          <Receipt className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{displayLabel}</span>
        </span>
      );
  }
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencyView, setCurrencyView] = useState<"HTG" | "USD">("HTG");
  const [recentSearch, setRecentSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await adminFetch("/api/admin/stats");
        if (!res.ok) {
          if (!cancelled) setError(t("admin.erreurChargement"));
          return;
        }
        const data = (await res.json()) as StatsResponse;
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

  const paymentEntries = useMemo(() => {
    if (!stats?.payments) return [];
    return Object.entries(stats.payments).sort((a, b) => {
      const idxA = PAYMENT_STATUS_ORDER.indexOf(a[0]);
      const idxB = PAYMENT_STATUS_ORDER.indexOf(b[0]);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [stats]);

  const totalPayments = paymentEntries.reduce((sum, [, count]) => sum + count, 0);
  const paidCount = stats?.payments?.paid ?? 0;
  const pendingCount =
    (stats?.payments?.pending ?? 0) + (stats?.payments?.awaiting_payment ?? 0);

  const revenueHTG = stats?.revenue?.HTG ?? 0;
  const revenueUSD = stats?.revenue?.USD ?? 0;
  const displayedRevenue = currencyView === "HTG" ? revenueHTG : revenueUSD;

  const monthlyActivity = stats?.monthlyActivity ?? [];
  const maxMonthlyCount = Math.max(
    1,
    ...monthlyActivity.map((m) => m.totalCount)
  );
  const hasAnyMonthlyData = monthlyActivity.some((m) => m.totalCount > 0);

  const recentPayments = useMemo(
    () => filterRecentDashboardPayments(stats?.recentPayments ?? [], recentSearch),
    [stats, recentSearch]
  );

  const adminName = user?.displayName?.trim() || user?.email?.split("@")[0] || "Admin";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Greeting Header — clean canvas typography matching Finexy reference */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-[2rem] tracking-tight text-ice-white">
            {t("admin.tableau.bonjour")} {adminName}
          </h1>
          <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-ice-white/65">
            {t("admin.tableau.sousTitre")}
          </p>
        </div>

        <Link
          href="/admin/formations/new"
          className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#12141B] hover:bg-[#1E222B] dark:bg-brand dark:hover:bg-brand-light text-white dark:text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0 self-start sm:self-auto whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          <Plus className="w-4 h-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
          <span>{t("admin.formations.nouvelle")}</span>
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300 text-sm"
        >
          {error}
        </div>
      )}

      {/* Top 3-Column Bento Row (4 + 4 + 4) */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 animate-pulse" aria-busy="true">
          <div className="xl:col-span-4 h-72 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          <div className="xl:col-span-4 grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[134px] rounded-2xl bg-deep-navy border border-[var(--border-subtle)]"
              />
            ))}
          </div>
          <div className="xl:col-span-4 h-72 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          {/* Col 1 (4 cols): Revenue & Catalog Summary Card */}
          <section className="xl:col-span-4 rounded-2xl surface-glass p-5 sm:p-6 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans font-medium text-sm text-slate-600 dark:text-ice-white/70">
                  {t("admin.tableau.revniKonfime")}
                </span>
                <div
                  role="group"
                  aria-label="Deviz"
                  className="inline-flex items-center p-0.5 rounded-full bg-[var(--surface-well)] border border-[var(--border-subtle)]"
                >
                  {(["HTG", "USD"] as const).map((curr) => {
                    const active = currencyView === curr;
                    return (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setCurrencyView(curr)}
                        aria-pressed={active}
                        className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                          active
                            ? "bg-deep-navy dark:bg-[var(--surface-elevated)] text-ice-white shadow-2xs"
                            : "text-ice-white/55 hover:text-ice-white"
                        }`}
                      >
                        {curr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="font-display font-bold text-3xl sm:text-[2.125rem] tracking-tight text-ice-white tabular-nums leading-none">
                  {displayedRevenue.toLocaleString("fr-FR")}{" "}
                  <span className="text-lg font-mono font-semibold text-ice-white/55">
                    {currencyView}
                  </span>
                </p>
                <p className="mt-2 font-sans text-xs text-slate-600 dark:text-ice-white/60 tabular-nums">
                  {paidCount} {t("admin.paiements.payes").toLowerCase()} · {pendingCount}{" "}
                  {t("admin.paiements.enAttente").toLowerCase()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/admin/formations"
                  className="min-h-[42px] px-4 py-2 rounded-full bg-[#12141B] hover:bg-[#1E222B] dark:bg-brand dark:hover:bg-brand-light text-white dark:text-[var(--brand-fg)] font-sans font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{t("admin.nav.formations")}</span>
                </Link>
                <Link
                  href="/admin/eleves"
                  className="min-h-[42px] px-4 py-2 rounded-full bg-[var(--surface-well)] hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-ice-white font-sans font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{t("admin.nav.eleves")}</span>
                </Link>
              </div>
            </div>

            {/* Integrated 3-column recessed strip */}
            <div className="rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)] grid grid-cols-3 divide-x divide-[var(--border-faint)]">
              <div className="p-3">
                <span className="block font-sans text-[11px] text-slate-600 dark:text-ice-white/55 truncate">
                  {t("admin.statut.publie")}
                </span>
                <span className="font-display font-bold text-base sm:text-lg text-ice-white tabular-nums mt-0.5 block">
                  {stats?.courses.published ?? 0}
                </span>
              </div>
              <div className="p-3">
                <span className="block font-sans text-[11px] text-slate-600 dark:text-ice-white/55 truncate">
                  {t("admin.tableau.formationsDraft")}
                </span>
                <span className="font-display font-bold text-base sm:text-lg text-ice-white tabular-nums mt-0.5 block">
                  {stats?.courses.draft ?? 0}
                </span>
              </div>
              <div className="p-3">
                <span className="block font-sans text-[11px] text-slate-600 dark:text-ice-white/55 truncate">
                  {t("admin.tableau.tranzaksyonTotal")}
                </span>
                <span className="font-display font-bold text-base sm:text-lg text-ice-white tabular-nums mt-0.5 block">
                  {totalPayments}
                </span>
              </div>
            </div>
          </section>

          {/* Col 2 (4 cols): 2x2 Asymmetric KPI Bento Grid (Hero Coral Card + 3 Crisp Cards) */}
          <div className="xl:col-span-4 grid grid-cols-2 gap-4">
            {/* Hero KPI Tile (Coral-Orange Gradient Anchor) */}
            <Link
              href="/admin/eleves"
              className="group rounded-2xl p-5 flex flex-col justify-between gap-4 text-white bg-gradient-to-br from-[#FF6A36] via-[#F04E18] to-[#D63E0C] shadow-[0_12px_28px_-10px_rgba(240,78,24,0.45)] hover:-translate-y-0.5 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans font-medium text-xs sm:text-sm text-white/90 leading-snug">
                  {t("admin.tableau.inscriptionsActives")}
                </span>
                <span className="w-9 h-9 rounded-full bg-white/18 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-white" aria-hidden="true" />
                </span>
              </div>
              <div>
                <span className="font-display font-bold text-3xl text-white tabular-nums block leading-none">
                  {stats?.enrollments.active ?? 0}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 font-sans text-[11px] text-white/85">
                  <span>{t("admin.nav.eleves")}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </span>
              </div>
            </Link>

            {/* Tile 2: Unique Students */}
            <Link
              href="/admin/eleves"
              className="group rounded-2xl surface-glass hover:border-brand/40 p-5 flex flex-col justify-between gap-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans font-medium text-xs sm:text-sm text-slate-600 dark:text-ice-white/75 leading-snug">
                  {t("admin.tableau.elevesUniques")}
                </span>
                <span className="w-9 h-9 rounded-full bg-[var(--surface-well)] border border-[var(--border-faint)] text-ice-white/75 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <div>
                <span className="font-display font-bold text-3xl text-ice-white tabular-nums block leading-none">
                  {stats?.students.unique ?? 0}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 font-sans text-[11px] text-slate-500 dark:text-ice-white/55">
                  <span>{t("admin.eleves.filtreInscrits")}</span>
                </span>
              </div>
            </Link>

            {/* Tile 3: Published Courses */}
            <Link
              href="/admin/formations"
              className="group rounded-2xl surface-glass hover:border-brand/40 p-5 flex flex-col justify-between gap-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans font-medium text-xs sm:text-sm text-slate-600 dark:text-ice-white/75 leading-snug">
                  {t("admin.tableau.formationsPubliees")}
                </span>
                <span className="w-9 h-9 rounded-full bg-[var(--surface-well)] border border-[var(--border-faint)] text-ice-white/75 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <div>
                <span className="font-display font-bold text-3xl text-ice-white tabular-nums block leading-none">
                  {stats?.courses.published ?? 0}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 font-sans text-[11px] text-slate-500 dark:text-ice-white/55 tabular-nums">
                  <span>{stats?.courses.draft ?? 0} {t("admin.tableau.formationsDraft").toLowerCase()}</span>
                </span>
              </div>
            </Link>

            {/* Tile 4: Confirmed Payments */}
            <Link
              href="/admin/paiements"
              className="group rounded-2xl surface-glass hover:border-brand/40 p-5 flex flex-col justify-between gap-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans font-medium text-xs sm:text-sm text-slate-600 dark:text-ice-white/75 leading-snug">
                  {t("admin.tableau.pemanKonfime")}
                </span>
                <span className="w-9 h-9 rounded-full bg-[var(--surface-well)] border border-[var(--border-faint)] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <div>
                <span className="font-display font-bold text-3xl text-ice-white tabular-nums block leading-none">
                  {paidCount}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 font-sans text-[11px] text-slate-500 dark:text-ice-white/55 tabular-nums">
                  <span>{pendingCount} {t("admin.paiements.enAttente").toLowerCase()}</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Col 3 (4 cols): Monthly Activity Stacked Bar Chart */}
          <section className="xl:col-span-4 rounded-2xl surface-glass p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-semibold text-base text-ice-white">
                  {t("admin.tableau.aktiviteMansyel")}
                </h2>
                <p className="font-sans text-xs text-slate-600 dark:text-ice-white/60 mt-0.5">
                  {t("admin.tableau.aktiviteMansyelSousTitre")}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-sans text-slate-600 dark:text-ice-white/70 shrink-0">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F04E18] dark:bg-[#FF5B22]" aria-hidden="true" />
                  <span>{t("admin.tableau.legendeKonfime")}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#12141B] dark:bg-white/70" aria-hidden="true" />
                  <span>{t("admin.tableau.legendeLot")}</span>
                </span>
              </div>
            </div>

            {!hasAnyMonthlyData ? (
              <div className="flex-1 flex flex-col items-center justify-center rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)] p-6 text-center min-h-[168px]">
                <p className="font-sans text-xs sm:text-sm text-ice-white/60">
                  {t("admin.tableau.aucunPaiementStat")}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex items-end justify-between gap-3 pt-4 min-h-[172px]">
                {monthlyActivity.map((bucket) => {
                  const totalPct = Math.round((bucket.totalCount / maxMonthlyCount) * 100);
                  const paidPct =
                    bucket.paidCount > 0
                      ? Math.max(8, Math.round((bucket.paidCount / maxMonthlyCount) * 100))
                      : 0;
                  const otherPct =
                    bucket.otherCount > 0
                      ? Math.max(
                          8,
                          Math.min(
                            100 - paidPct,
                            Math.round((bucket.otherCount / maxMonthlyCount) * 100)
                          )
                        )
                      : 0;
                  const adjustedPaidPct =
                    paidPct + otherPct > 100 ? Math.max(8, totalPct - otherPct) : paidPct;
                  return (
                    <div
                      key={bucket.monthKey}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                      title={`${bucket.label}: ${bucket.paidCount} ${t("admin.tableau.legendeKonfime").toLowerCase()}, ${bucket.otherCount} ${t("admin.tableau.legendeLot").toLowerCase()}`}
                    >
                      <span className="font-mono text-[11px] text-ice-white/55 tabular-nums">
                        {bucket.totalCount > 0 ? bucket.totalCount : ""}
                      </span>
                      <div className="w-full max-w-[34px] h-28 flex flex-col justify-end gap-1 rounded-lg bg-[var(--surface-well)] p-1 overflow-hidden">
                        {bucket.paidCount > 0 && (
                          <div
                            className="w-full rounded-md bg-gradient-to-t from-[#E54813] to-[#FF7442] transition-all duration-300"
                            style={{ height: `${adjustedPaidPct}%` }}
                          />
                        )}
                        {bucket.otherCount > 0 && (
                          <div
                            className="w-full rounded-md bg-[#12141B] dark:bg-white/75 transition-all duration-300"
                            style={{ height: `${otherPct}%` }}
                          />
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-600 dark:text-ice-white/65">
                        {bucket.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Bottom Workspace Grid (8 cols Recent Transactions + 4 cols Status Breakdown & Quick Actions) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Recent Transactions (8 cols) */}
        <section className="xl:col-span-8 rounded-2xl surface-glass overflow-hidden">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-faint)]">
            <h2 className="font-display font-semibold text-lg text-ice-white">
              {t("admin.tableau.denyeTranzaksyon")}
            </h2>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search
                  className="w-3.5 h-3.5 text-ice-white/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={recentSearch}
                  onChange={(e) => setRecentSearch(e.target.value)}
                  placeholder={t("admin.paiements.rechercher")}
                  aria-label={t("admin.paiements.rechercher")}
                  className="w-full min-h-[38px] pl-8 pr-3 py-1.5 rounded-full bg-[var(--surface-well)] border border-[var(--border-subtle)] text-ice-white placeholder:text-ice-white/45 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-brand-light"
                />
              </div>

              <Link
                href="/admin/paiements"
                className="font-sans text-xs font-semibold text-brand-light hover:underline whitespace-nowrap shrink-0 inline-flex items-center gap-1 min-h-[38px]"
              >
                <span>{t("admin.tableau.weTout")}</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-[var(--surface-well)]" />
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="font-sans text-sm text-ice-white/60">
                {t("admin.tableau.aucunPaiementStat")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans min-w-[580px]">
                <thead>
                  <tr className="bg-[var(--surface-well)] border-b border-[var(--border-faint)]">
                    <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ice-white/55">
                      {t("admin.paiements.colReference")}
                    </th>
                    <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ice-white/55">
                      {t("admin.paiements.colCours")}
                    </th>
                    <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ice-white/55">
                      {t("admin.paiements.colMontant")}
                    </th>
                    <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ice-white/55">
                      {t("admin.paiements.colStatut")}
                    </th>
                    <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-ice-white/55">
                      {t("admin.paiements.colDate")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-faint)]">
                  {recentPayments.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--surface-well)]/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-ice-white/70 truncate max-w-[140px]">
                        {p.merchantReference || p.id.slice(0, 10)}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-ice-white truncate max-w-[200px]">
                        {p.courseTitle}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-ice-white tabular-nums whitespace-nowrap">
                        {p.amount.toLocaleString("fr-FR")} {p.currency}
                      </td>
                      <td className="px-5 py-3.5">
                        <TransactionStatus status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-ice-white/60 whitespace-nowrap tabular-nums">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Status Breakdown + Quick Actions (4 cols) */}
        <div className="xl:col-span-4 space-y-5">
          <section className="rounded-2xl surface-glass p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display font-semibold text-base text-ice-white">
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
                  <div key={i} className="h-9 rounded-xl bg-[var(--surface-well)]" />
                ))}
              </div>
            ) : paymentEntries.length === 0 ? (
              <p className="font-sans text-xs sm:text-sm text-ice-white/60 py-3 text-center">
                {t("admin.tableau.aucunPaiementStat")}
              </p>
            ) : (
              <div className="space-y-3.5">
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

          <section className="rounded-2xl surface-glass p-5 sm:p-6 space-y-3">
            <h2 className="font-display font-semibold text-base text-ice-white">
              {t("admin.tableau.actionsRapides")}
            </h2>

            <div className="divide-y divide-[var(--border-faint)]">
              <Link
                href="/admin/formations/new"
                className="group py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 min-h-[46px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[var(--surface-well)] border border-[var(--border-faint)] text-brand flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="font-sans font-medium text-sm text-ice-white group-hover:text-brand-light transition-colors truncate">
                    {t("admin.tableau.actionNouvelleFormation")}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-ice-white/45 group-hover:text-brand-light shrink-0" aria-hidden="true" />
              </Link>

              <Link
                href="/admin/eleves"
                className="group py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 min-h-[46px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[var(--surface-well)] border border-[var(--border-faint)] text-brand flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="font-sans font-medium text-sm text-ice-white group-hover:text-brand-light transition-colors truncate">
                    {t("admin.tableau.actionGererEleves")}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-ice-white/45 group-hover:text-brand-light shrink-0" aria-hidden="true" />
              </Link>

              <Link
                href="/admin/paiements"
                className="group py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 min-h-[46px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-[var(--surface-well)] border border-[var(--border-faint)] text-ice-white/75 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="font-sans font-medium text-sm text-ice-white group-hover:text-brand-light transition-colors truncate">
                    {t("admin.tableau.actionVoirPaiements")}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-ice-white/45 group-hover:text-brand-light shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
