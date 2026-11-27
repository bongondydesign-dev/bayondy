"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getEnrollmentForCourse } from "@/lib/learning/queries";
import { t } from "@/lib/i18n";
import type { TranzakPaymentMethod } from "@/lib/tranzak/types";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  priceUSD?: number | null;
  priceHTG?: number | null;
  className?: string;
}

export function EnrollButton({
  courseId,
  courseSlug,
  priceUSD,
  priceHTG,
  className = "",
}: EnrollButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(Boolean(user?.uid && courseId));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<TranzakPaymentMethod>("moncash");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vérifier si l'utilisateur connecté est déjà inscrit au cours
  useEffect(() => {
    if (!user?.uid || !courseId) {
      return;
    }

    let cancelled = false;
    getEnrollmentForCourse(user.uid, courseId)
      .then((enr) => {
        if (!cancelled) {
          setEnrolled(enr?.status === "active");
          setCheckingEnrollment(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEnrolled(false);
          setCheckingEnrollment(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, courseId]);

  // 1. État de chargement initial
  if (authLoading || (user && checkingEnrollment)) {
    return (
      <div
        className={`w-full h-12 rounded-2xl bg-[var(--surface-well)] animate-pulse border border-[var(--border-subtle)] ${className}`}
        aria-hidden="true"
      />
    );
  }

  // 2. Visiteur non connecté : invitation à se connecter
  if (!user) {
    return (
      <Link
        href={`/connexion?redirect=/formations/${encodeURIComponent(courseSlug)}`}
        className={`w-full min-h-[48px] px-6 py-3.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian ${className}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
        <span>{t("catalogue.boutonInscrireConnexion")}</span>
      </Link>
    );
  }

  // 3. Élève déjà inscrit avec accès actif
  if (enrolled) {
    return (
      <Link
        href={`/mes-formations/${courseSlug}`}
        className={`w-full min-h-[48px] px-6 py-3.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${className}`}
      >
        <span className="w-5 h-5 rounded-full bg-[var(--brand-fg)]/15 flex items-center justify-center text-xs">
          ✓
        </span>
        <span>{t("catalogue.boutonAcceder")}</span>
      </Link>
    );
  }

  // 4. Élève connecté mais pas encore inscrit : déclenchement du paiement
  const handlePayment = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Peman an pa t kapab kòmanse.");
        setSubmitting(false);
        return;
      }

      // Redirection sécurisée vers la page de paiement Tranzak (Section 4.1)
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setErrorMessage("Lyen peman an pa disponib.");
        setSubmitting(false);
      }
    } catch {
      setErrorMessage("Erè pandan n ap kontakte sèvè a. Tanpri re-eseye.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`w-full min-h-[48px] px-6 py-3.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian ${className}`}
      >
        <svg
          className="w-5 h-5 text-[var(--brand-fg)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <span>{t("catalogue.boutonAcheter")}</span>
      </button>

      {/* Modal de sélection du moyen de paiement Tranzak */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-obsidian/80 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-deep-navy border border-[var(--border-subtle)] p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="font-display font-bold text-lg sm:text-xl text-ice-white">
                {t("catalogue.modalTitre")}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-ice-white/60 hover:text-ice-white transition-colors p-1 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg"
                aria-label={t("catalogue.fermer")}
              >
                ✕
              </button>
            </div>

            {/* Affichage des montants */}
            <div className="rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-4 flex items-center justify-between">
              <span className="font-sans text-sm text-ice-white/75">Pri total :</span>
              <div className="text-right">
                {priceHTG && priceHTG > 0 && (
                  <span className="block font-mono font-bold text-lg text-brand-light">
                    {priceHTG.toLocaleString()} HTG
                  </span>
                )}
                {priceUSD && priceUSD > 0 && (
                  <span className="block font-mono text-xs text-ice-white/65">
                    (${priceUSD.toFixed(2)} USD)
                  </span>
                )}
              </div>
            </div>

            {/* Options de paiement Tranzak */}
            <div className="space-y-3">
              {/* MonCash */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedMethod === "moncash"
                    ? "bg-brand/10 border-brand text-ice-white"
                    : "bg-[var(--surface-well)] border-[var(--border-subtle)] text-ice-white/80 hover:border-[var(--border-strong)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="moncash"
                    checked={selectedMethod === "moncash"}
                    onChange={() => setSelectedMethod("moncash")}
                    className="accent-brand w-4 h-4"
                  />
                  <div>
                    <span className="font-sans font-semibold block text-sm">MonCash</span>
                    <span className="font-mono text-xs text-ice-white/60">Digicel Haiti</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-subtle)] text-ice-white/80 border border-[var(--border-subtle)]">
                  HTG
                </span>
              </label>

              {/* NatCash */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedMethod === "natcash"
                    ? "bg-brand/10 border-brand text-ice-white"
                    : "bg-[var(--surface-well)] border-[var(--border-subtle)] text-ice-white/80 hover:border-[var(--border-strong)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="natcash"
                    checked={selectedMethod === "natcash"}
                    onChange={() => setSelectedMethod("natcash")}
                    className="accent-brand w-4 h-4"
                  />
                  <div>
                    <span className="font-sans font-semibold block text-sm">NatCash</span>
                    <span className="font-mono text-xs text-ice-white/60">Natcom Haiti</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-subtle)] text-ice-white/80 border border-[var(--border-subtle)]">
                  HTG
                </span>
              </label>

              {/* Carte Bancaire */}
              <label
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedMethod === "card"
                    ? "bg-brand/10 border-brand text-ice-white"
                    : "bg-[var(--surface-well)] border-[var(--border-subtle)] text-ice-white/80 hover:border-[var(--border-strong)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={selectedMethod === "card"}
                    onChange={() => setSelectedMethod("card")}
                    className="accent-brand w-4 h-4"
                  />
                  <div>
                    <span className="font-sans font-semibold block text-sm">Kat labank</span>
                    <span className="font-mono text-xs text-ice-white/60">Visa / Mastercard</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-subtle)] text-ice-white/80 border border-[var(--border-subtle)]">
                  USD/HTG
                </span>
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-xs text-left">
                {errorMessage}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-full border border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:border-brand/40 text-ice-white/85 font-sans text-sm transition-colors"
              >
                {t("catalogue.fermer")}
              </button>

              <button
                type="button"
                onClick={handlePayment}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-50 text-[var(--brand-fg)] font-sans font-semibold text-sm transition-all shadow-lg shadow-[var(--brand-glow)] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[var(--brand-fg)]/30 border-t-[var(--brand-fg)] rounded-full animate-spin" />
                    <span>{t("catalogue.traitementEnCours")}</span>
                  </>
                ) : (
                  <span>{t("catalogue.peyeKounyea")}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
