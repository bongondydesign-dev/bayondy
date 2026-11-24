"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/apiClient";
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

function statusColor(status: string) {
  switch (status) {
    case "paid": return "bg-brand/15 text-brand-light border-brand/30";
    case "pending": return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
    case "failed":
    case "expired": return "bg-red-500/15 text-red-300 border-red-500/30";
    case "refunded": return "bg-white/10 text-ice-white/50 border-white/10";
    default: return "bg-white/5 text-ice-white/40 border-white/5";
  }
}

export default function AdminPaiementsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPayments() {
      try {
        const res = await adminFetch("/api/admin/payments");
        if (!res.ok) {
          if (!cancelled) setError(t("admin.erreurChargement"));
          return;
        }
        const data = (await res.json()) as { payments: PaymentRow[]; nextCursor: string | null };
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
      const data = (await res.json()) as { payments: PaymentRow[]; nextCursor: string | null };
      setPayments((prev) => [...prev, ...data.payments]);
      setNextCursor(data.nextCursor);
    } catch {
      setError(t("admin.erreurChargement"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          {t("admin.paiements.titre")}
        </h1>
        <p className="font-sans text-ice-white/60 text-sm mt-1">
          {t("admin.paiements.sousTitre")}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && payments.length === 0 ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-[#0D0E11] border border-white/[0.06]" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#0D0E11] border border-white/[0.08] space-y-3">
          <svg className="w-12 h-12 text-ice-white/20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="font-sans text-ice-white/55 text-sm">
            {t("admin.paiements.vide")}
          </p>
        </div>
      ) : (
        <>
          {/* Tableau avec défilement horizontal interne — jamais sur la page */}
          <div className="rounded-2xl bg-[#0D0E11] border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-ice-white/50">
                      {t("admin.paiements.colStatut")}
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-ice-white/50">
                      {t("admin.paiements.colMontant")}
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-ice-white/50">
                      {t("admin.paiements.colMethode")}
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-ice-white/50">
                      {t("admin.paiements.colCours")}
                    </th>
                    <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-ice-white/50">
                      {t("admin.paiements.colDate")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-white/5 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono border ${statusColor(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        {p.amount} {p.currency}
                      </td>
                      <td className="px-4 py-3 text-ice-white/70 font-mono text-xs">
                        {p.method}
                      </td>
                      <td className="px-4 py-3 text-ice-white/70 font-mono text-xs truncate max-w-[140px]">
                        {p.courseId}
                      </td>
                      <td className="px-4 py-3 text-ice-white/50 font-mono text-xs whitespace-nowrap">
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
              className="w-full min-h-[48px] py-3 rounded-full bg-[#13151B] border border-white/[0.1] text-ice-white/80 hover:text-white hover:border-white/[0.2] font-sans text-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              {loading ? t("admin.chargement") : t("admin.paiements.voirPlus")}
            </button>
          )}
        </>
      )}
    </div>
  );
}
