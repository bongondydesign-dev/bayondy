"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Search, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/apiClient";
import { computePaymentSummary, filterAdminPayments } from "@/lib/admin/filters";
import {
  buildClearedPaymentsState,
  isPaymentsClearAllowed,
} from "@/lib/admin/paymentDeletion";
import { DeletePaymentsDialog } from "@/components/admin/DeletePaymentsDialog";
import { t } from "@/lib/i18n";

interface PaymentRow {
  id: string;
  uid: string;
  courseId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  merchantReference: string;
  createdAt: string | null;
  paidAt: string | null;
}

type PaymentFilter = "all" | "paid" | "pending" | "failed" | "refunded";

function statusColor(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25";
    case "pending":
    case "awaiting_payment":
      return "bg-amber-50 dark:bg-yellow-500/15 text-amber-800 dark:text-yellow-300 border-amber-300 dark:border-yellow-500/30";
    case "failed":
    case "expired":
      return "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30";
    case "refunded":
      return "bg-[var(--surface-well)] text-ice-white/65 border-[var(--border-subtle)]";
    default:
      return "bg-[var(--surface-well)] text-ice-white/60 border-[var(--border-faint)]";
  }
}

export default function AdminPaiementsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentFilter>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingHistory, setDeletingHistory] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPayments() {
      try {
        const res = await adminFetch("/api/admin/payments");
        if (!res.ok) {
          if (!cancelled) setError(t("admin.erreurChargement"));
          return;
        }
        const data = (await res.json()) as {
          payments: PaymentRow[];
          nextCursor: string | null;
        };
        if (!cancelled) {
          setPayments(data.payments);
          setNextCursor(data.nextCursor);
        }
      } catch {
        if (!cancelled) setError(t("admin.erreurChargement"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPayments();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMore(cursor: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/payments?startAfter=${cursor}`);
      if (!res.ok) {
        setError(t("admin.erreurChargement"));
        return;
      }
      const data = (await res.json()) as {
        payments: PaymentRow[];
        nextCursor: string | null;
      };
      setPayments((prev) => [...prev, ...data.payments]);
      setNextCursor(data.nextCursor);
    } catch {
      setError(t("admin.erreurChargement"));
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => computePaymentSummary(payments), [payments]);
  const filteredPayments = useMemo(
    () => filterAdminPayments(payments, search, statusFilter),
    [payments, search, statusFilter]
  );

  const canClearHistory = isPaymentsClearAllowed(
    payments.length,
    loading,
    deletingHistory
  );

  async function handleConfirmClearHistory() {
    if (!canClearHistory) return;
    setDeletingHistory(true);
    setDeleteError(null);
    setDeleteSuccess(null);

    try {
      const res = await adminFetch("/api/admin/payments", {
        method: "DELETE",
        body: JSON.stringify({ confirm: true }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setDeleteError(data?.error ?? t("admin.paiements.erreurSuppression"));
        return;
      }

      const cleared = buildClearedPaymentsState();
      setPayments(cleared.payments);
      setNextCursor(cleared.nextCursor);
      setSearch(cleared.search);
      setStatusFilter(cleared.statusFilter);
      setConfirmOpen(false);
      setDeleteSuccess(t("admin.paiements.succesSuppression"));
    } catch {
      setDeleteError(t("admin.paiements.erreurSuppression"));
    } finally {
      setDeletingHistory(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white">
            {t("admin.paiements.titre")}
          </h1>
          <p className="font-sans text-ice-white/65 text-sm mt-1">
            {t("admin.paiements.sousTitre")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setConfirmOpen(true);
          }}
          disabled={!canClearHistory}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full border border-red-300 dark:border-red-500/35 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 font-sans font-semibold text-sm transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 shrink-0 whitespace-nowrap self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t("admin.paiements.supprimerHistorique")}</span>
        </button>
      </div>

      {deleteSuccess && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{deleteSuccess}</span>
        </div>
      )}

      {/* Real Payment Summary Strip */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl surface-glass">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ice-white/55 block">
              {t("admin.paiements.totalHTG")}
            </span>
            <span className="font-display font-bold text-xl sm:text-2xl text-ice-white tabular-nums mt-1 block">
              {summary.totalHTG.toLocaleString("fr-FR")} HTG
            </span>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl surface-glass">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ice-white/55 block">
              {t("admin.paiements.totalUSD")}
            </span>
            <span className="font-display font-bold text-xl sm:text-2xl text-ice-white tabular-nums mt-1 block">
              {summary.totalUSD.toLocaleString("fr-FR")} USD
            </span>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl surface-glass">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ice-white/55 block">
              {t("admin.paiements.payes")}
            </span>
            <span className="font-display font-bold text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400 tabular-nums mt-1 block">
              {summary.paidCount}
            </span>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl surface-glass">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ice-white/55 block">
              {t("admin.paiements.enAttente")}
            </span>
            <span className="font-display font-bold text-xl sm:text-2xl text-amber-600 dark:text-amber-300 tabular-nums mt-1 block">
              {summary.pendingCount}
            </span>
          </div>
        </div>
      )}

      {/* Search & Status Filters */}
      {!loading && payments.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-ice-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.paiements.rechercher")}
              aria-label={t("admin.paiements.rechercher")}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl surface-glass text-ice-white placeholder:text-ice-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
          </div>

          <div
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl sm:rounded-full surface-glass self-start lg:self-auto"
            role="group"
            aria-label={t("admin.paiements.titre")}
          >
            {(
              [
                { key: "all", label: t("admin.paiements.filtreTout") },
                { key: "paid", label: t("mesFormations.paiementStatut.paid") },
                { key: "pending", label: t("mesFormations.paiementStatut.pending") },
                { key: "failed", label: t("mesFormations.paiementStatut.failed") },
                { key: "refunded", label: t("mesFormations.paiementStatut.refunded") },
              ] as Array<{ key: PaymentFilter; label: string }>
            ).map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  aria-pressed={active}
                  className={`min-h-[38px] px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                    active
                      ? "bg-[#12141B] text-white dark:bg-brand dark:text-[var(--brand-fg)]"
                      : "text-ice-white/70 hover:text-ice-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && payments.length === 0 ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-2xl surface-glass" />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-10 text-center rounded-2xl surface-glass space-y-3">
          <CreditCard className="w-11 h-11 text-ice-white/25 mx-auto" strokeWidth={1.5} aria-hidden="true" />
          <p className="font-sans text-ice-white/60 text-sm">
            {t("admin.paiements.vide")}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl surface-glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans min-w-[700px]">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left px-4 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/60">
                      {t("admin.paiements.colStatut")}
                    </th>
                    <th className="text-left px-4 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/60">
                      {t("admin.paiements.colMontant")}
                    </th>
                    <th className="text-left px-4 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/60">
                      {t("admin.paiements.colMethode")}
                    </th>
                    <th className="text-left px-4 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/60">
                      {t("admin.paiements.colCours")}
                    </th>
                    <th className="text-left px-4 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/60">
                      {t("admin.paiements.colReference")}
                    </th>
                    <th className="text-left px-4 py-3.5 font-mono text-xs uppercase tracking-wider text-ice-white/60">
                      {t("admin.paiements.colDate")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-faint)]">
                  {filteredPayments.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--surface-subtle)] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono border ${statusColor(
                            p.status
                          )}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-ice-white font-mono font-semibold tabular-nums whitespace-nowrap">
                        {p.amount} {p.currency}
                      </td>
                      <td className="px-4 py-3.5 text-ice-white/75 font-mono text-xs uppercase">
                        {p.method}
                      </td>
                      <td className="px-4 py-3.5 text-ice-white/75 font-mono text-xs truncate max-w-[140px]">
                        {p.courseId}
                      </td>
                      <td className="px-4 py-3.5 text-ice-white/65 font-mono text-xs truncate max-w-[150px]">
                        {p.merchantReference || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-ice-white/60 font-mono text-xs whitespace-nowrap tabular-nums">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString("fr-FR") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {nextCursor && (
            <button
              type="button"
              onClick={() => loadMore(nextCursor)}
              disabled={loading}
              className="w-full min-h-[46px] py-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-ice-white/80 hover:text-ice-white hover:border-brand/40 font-sans text-sm transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              {loading ? t("admin.chargement") : t("admin.paiements.voirPlus")}
            </button>
          )}
        </>
      )}
      <DeletePaymentsDialog
        open={confirmOpen}
        paymentsCount={payments.length}
        hasMore={Boolean(nextCursor)}
        deleting={deletingHistory}
        error={deleteError}
        onCancel={() => {
          if (!deletingHistory) {
            setConfirmOpen(false);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmClearHistory}
      />
    </div>
  );
}
