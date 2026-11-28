"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Clock, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasCourseAccess } from "@/lib/learning/access";
import { getEnrollmentForCourse } from "@/lib/learning/queries";
import { t } from "@/lib/i18n";
import {
  createMonCashOrderId,
  isSafePaymentRedirectUrl,
} from "@/lib/moncash/validation";
import { MonCashMark, MonCashPayButton } from "@/components/payment/MonCashPayButton";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  courseTitle?: string;
  priceUSD?: number | null;
  priceHTG?: number | null;
  className?: string;
}

export function EnrollButton({
  courseId,
  courseSlug,
  courseTitle,
  priceHTG,
  className = "",
}: EnrollButtonProps) {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(
    Boolean(user?.uid && courseId && !isAdmin)
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const amountHTG =
    typeof priceHTG === "number" && Number.isFinite(priceHTG)
      ? Math.round(priceHTG)
      : 0;

  // Vérifier si l'utilisateur connecté est déjà inscrit au cours (inutile pour admin)
  useEffect(() => {
    if (!user?.uid || !courseId || isAdmin) {
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
  }, [user?.uid, courseId, isAdmin]);

  // 1. État de chargement initial
  if (authLoading || (user && !isAdmin && checkingEnrollment)) {
    return (
      <div
        className={`w-full h-12 rounded-2xl bg-[var(--surface-well)] animate-pulse border border-[var(--border-subtle)] ${className}`}
        aria-hidden="true"
      />
    );
  }

  // 2. Visiteur non connecté : invitation à se connecter (+ aperçu MonCash prêt)
  if (!user) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Link
          href={`/connexion?redirect=/formations/${encodeURIComponent(courseSlug)}`}
          className="w-full min-h-[48px] px-6 py-3.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
        >
          <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t("catalogue.boutonInscrireConnexion")}</span>
        </Link>
        {amountHTG > 0 && (
          <div className="pt-1 flex items-center justify-between gap-3">
            <span className="font-sans text-xs text-slate-600 dark:text-zinc-400 truncate">
              {t("paiement.payerMonCash")}
            </span>
            <MonCashMark size="sm" />
          </div>
        )}
      </div>
    );
  }

  // 3. Administrateur ou élève déjà inscrit avec accès actif
  const canAccessDirectly = hasCourseAccess({
    isAdmin,
    enrollmentStatus: enrolled ? "active" : null,
  });

  if (canAccessDirectly) {
    return (
      <div className={`space-y-2.5 ${className}`}>
        <Link
          href={`/mes-formations/${courseSlug}`}
          className="w-full min-h-[48px] px-6 py-3.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          <span className="w-5 h-5 rounded-full bg-[var(--brand-fg)]/15 flex items-center justify-center" aria-hidden="true">
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
          <span>{t("catalogue.boutonAcceder")}</span>
        </Link>
        {isAdmin && !enrolled && (
          <p className="text-center font-mono text-[11px] font-medium text-brand-light">
            {t("catalogue.accesAdminGratuit")}
          </p>
        )}
      </div>
    );
  }

  // 4. Élève connecté mais pas encore inscrit : paiement MonCash (HTG entier)
  if (amountHTG <= 0) {
    return (
      <div
        className={`w-full min-h-[48px] px-5 py-3.5 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-strong)] dark:border-[var(--border-subtle)] text-slate-800 dark:text-ice-white/85 font-sans font-medium text-sm flex items-center justify-center gap-2.5 text-center ${className}`}
        role="status"
      >
        <Clock className="w-4 h-4 text-brand-light flex-shrink-0" aria-hidden="true" />
        <span>{t("catalogue.peyemanBientot")}</span>
      </div>
    );
  }

  const handlePayMonCash = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const token = await user.getIdToken();
      const orderId = createMonCashOrderId(courseId);
      const returnUrl = `${window.location.origin}/merci?orderId=${encodeURIComponent(
        orderId
      )}&courseSlug=${encodeURIComponent(courseSlug)}`;

      try {
        window.sessionStorage.setItem(
          "bayondy_last_order",
          JSON.stringify({
            orderId,
            courseId,
            courseSlug,
            courseTitle: courseTitle || null,
            amount: amountHTG,
          })
        );
      } catch {
        // Ignorer si sessionStorage est bloqué en navigation privée
      }

      const res = await fetch("/api/moncash/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountHTG,
          orderId,
          returnUrl,
          courseId,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        paymentUrl?: string;
        error?: string;
        code?: string;
      } | null;

      if (!res.ok || !data?.paymentUrl || !isSafePaymentRedirectUrl(data.paymentUrl)) {
        setErrorMessage(data?.error || t("paiement.erreurCreation"));
        setSubmitting(false);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch {
      setErrorMessage(t("paiement.erreurCreation"));
      setSubmitting(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <MonCashPayButton
        onClick={handlePayMonCash}
        loading={submitting}
        amountHTG={amountHTG}
      />

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-950/35 border border-red-200/85 dark:border-red-500/25 text-red-700 dark:text-red-300 text-xs sm:text-[13px] leading-snug text-left"
        >
          <AlertCircle
            className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
          <span className="min-w-0 break-words">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
