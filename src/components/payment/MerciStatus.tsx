"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";

type VerificationState = "verifying" | "paid" | "pending" | "failed";

interface VerifyApiResponse {
  ok?: boolean;
  status?: "paid" | "pending" | "failed";
  orderId?: string;
  courseId?: string;
  courseSlug?: string | null;
  error?: string;
  code?: string;
}

interface StoredLastOrder {
  orderId?: string;
  courseId?: string;
  courseSlug?: string;
}

const MAX_AUTO_POLLS = 5;
const AUTO_POLL_INTERVAL_MS = 2500;

function readStoredOrder(): StoredLastOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("bayondy_last_order");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as StoredLastOrder;
    }
    return null;
  } catch {
    return null;
  }
}

function clearStoredOrder() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem("bayondy_last_order");
  } catch {
    // Ignorer si sessionStorage est indisponible
  }
}

async function requestPaymentVerification(
  idToken: string,
  orderId: string
): Promise<{ ok: boolean; data: VerifyApiResponse | null }> {
  const res = await fetch("/api/moncash/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(orderId ? { orderId } : {}),
  });
  const data = (await res.json().catch(() => null)) as VerifyApiResponse | null;
  return { ok: res.ok, data };
}

export function MerciStatus() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const urlOrderId =
    searchParams.get("orderId")?.trim() ||
    searchParams.get("referenceId")?.trim() ||
    searchParams.get("reference")?.trim() ||
    "";
  const urlCourseSlug = searchParams.get("courseSlug")?.trim() || "";

  const [state, setState] = useState<VerificationState>("verifying");
  const [resolvedOrderId, setResolvedOrderId] = useState<string>(urlOrderId);
  const [resolvedCourseSlug, setResolvedCourseSlug] = useState<string>(urlCourseSlug);
  const [manualChecking, setManualChecking] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loginRedirectHref = useMemo(() => {
    const params = new URLSearchParams();
    if (urlOrderId) params.set("orderId", urlOrderId);
    if (urlCourseSlug) params.set("courseSlug", urlCourseSlug);
    const query = params.toString();
    const target = query ? `/merci?${query}` : "/merci";
    return `/connexion?redirect=${encodeURIComponent(target)}`;
  }, [urlOrderId, urlCourseSlug]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function runAttempt() {
      if (cancelled || !user) return;
      const stored = readStoredOrder();
      const targetOrderId = urlOrderId || stored?.orderId || "";
      const fallbackSlug = urlCourseSlug || stored?.courseSlug || "";

      try {
        const idToken = await user.getIdToken();
        if (cancelled) return;

        const { ok, data } = await requestPaymentVerification(
          idToken,
          targetOrderId
        );
        if (cancelled) return;

        const effectiveOrderId = data?.orderId || targetOrderId;
        const effectiveSlug = data?.courseSlug || fallbackSlug;
        if (effectiveOrderId) setResolvedOrderId(effectiveOrderId);
        if (effectiveSlug) setResolvedCourseSlug(effectiveSlug);

        if (ok && data?.status === "paid") {
          clearStoredOrder();
          setState("paid");
          return;
        }

        if (ok && data?.status === "failed") {
          clearStoredOrder();
          setState("failed");
          return;
        }

        if (ok && data?.status === "pending" && attempts < MAX_AUTO_POLLS) {
          attempts += 1;
          setState("verifying");
          pollTimerRef.current = setTimeout(() => {
            void runAttempt();
          }, AUTO_POLL_INTERVAL_MS);
          return;
        }

        setState("pending");
      } catch {
        if (!cancelled) {
          setState("pending");
        }
      }
    }

    const startTimer = setTimeout(() => {
      void runAttempt();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [authLoading, user, urlOrderId, urlCourseSlug]);

  const handleManualVerify = async () => {
    if (!user || manualChecking) return;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    setManualChecking(true);
    const stored = readStoredOrder();
    const targetOrderId = urlOrderId || stored?.orderId || "";
    const fallbackSlug = urlCourseSlug || stored?.courseSlug || "";

    try {
      const idToken = await user.getIdToken();
      const { ok, data } = await requestPaymentVerification(
        idToken,
        targetOrderId
      );

      const effectiveOrderId = data?.orderId || targetOrderId;
      const effectiveSlug = data?.courseSlug || fallbackSlug;
      if (effectiveOrderId) setResolvedOrderId(effectiveOrderId);
      if (effectiveSlug) setResolvedCourseSlug(effectiveSlug);

      if (ok && data?.status === "paid") {
        clearStoredOrder();
        setState("paid");
      } else if (ok && data?.status === "failed") {
        clearStoredOrder();
        setState("failed");
      } else {
        setState("pending");
      }
    } catch {
      setState("pending");
    } finally {
      setManualChecking(false);
    }
  };

  // 1. Chargement auth initial
  if (authLoading) {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-deep-navy border border-[var(--border-subtle)] p-7 sm:p-10 shadow-[var(--card-shadow)] text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand/15 border border-brand/30 text-brand-light flex items-center justify-center mx-auto">
          <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light">
            {t("merci.badge")}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
            {t("merci.titreVerification")}
          </h1>
          <p className="font-sans text-sm sm:text-base text-ice-white/75 leading-relaxed">
            {t("merci.sousTitreVerification")}
          </p>
        </div>
      </div>
    );
  }

  // 2. Utilisateur non connecté au retour de MonCash
  if (!user) {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-deep-navy border border-[var(--border-subtle)] p-7 sm:p-10 shadow-[var(--card-shadow)] text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light">
            {t("merci.badge")}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
            {t("merci.titre")}
          </h1>
          <p className="font-sans text-sm sm:text-base text-ice-white/75 leading-relaxed">
            {t("merci.connexionRequise")}
          </p>
        </div>

        {urlOrderId && (
          <div className="rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-4 text-xs font-mono text-ice-white/65">
            {t("merci.referenceLabel")}: <span className="text-ice-white">{urlOrderId}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={loginRedirectHref}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 sm:whitespace-nowrap shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t("merci.boutonConnexion")}</span>
          </Link>
          <Link
            href="/formations"
            className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:border-brand/40 text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center sm:whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("merci.boutonCatalogue")}
          </Link>
        </div>
      </div>
    );
  }

  // 3. Paiement confirmé & formation débloquée
  if (state === "paid") {
    const primaryHref = resolvedCourseSlug
      ? `/mes-formations/${encodeURIComponent(resolvedCourseSlug)}`
      : "/mes-formations";
    const primaryLabel = resolvedCourseSlug
      ? t("merci.boutonAccederCours")
      : t("merci.boutonMesFormations");

    return (
      <div className="w-full max-w-xl rounded-3xl bg-deep-navy border border-[var(--border-subtle)] p-7 sm:p-10 shadow-[var(--card-shadow)] text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400">
            {t("merci.badge")}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
            {t("merci.titreConfirme")}
          </h1>
          <p className="font-sans text-sm sm:text-base text-ice-white/75 leading-relaxed">
            {t("merci.sousTitreConfirme")}
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-4 space-y-1.5 text-xs sm:text-sm font-sans text-ice-white/70 leading-relaxed">
          <p>{t("merci.noteConfirme")}</p>
          {resolvedOrderId && (
            <p className="font-mono text-xs text-ice-white/55">
              {t("merci.referenceLabel")}: {resolvedOrderId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={primaryHref}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 sm:whitespace-nowrap shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <span>{primaryLabel}</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </Link>
          <Link
            href={resolvedCourseSlug ? "/mes-formations" : "/formations"}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:border-brand/40 text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center sm:whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {resolvedCourseSlug
              ? t("merci.boutonMesFormations")
              : t("merci.boutonCatalogue")}
          </Link>
        </div>
      </div>
    );
  }

  // 4. Paiement échoué / annulé
  if (state === "failed") {
    const retryHref = resolvedCourseSlug
      ? `/formations/${encodeURIComponent(resolvedCourseSlug)}`
      : "/formations";

    return (
      <div className="w-full max-w-xl rounded-3xl bg-deep-navy border border-[var(--border-subtle)] p-7 sm:p-10 shadow-[var(--card-shadow)] text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-red-400">
            {t("merci.badge")}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
            {t("merci.titreEchoue")}
          </h1>
          <p className="font-sans text-sm sm:text-base text-ice-white/75 leading-relaxed">
            {t("merci.sousTitreEchoue")}
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-4 space-y-1.5 text-xs sm:text-sm font-sans text-ice-white/70 leading-relaxed">
          <p>{t("merci.noteEchoue")}</p>
          {resolvedOrderId && (
            <p className="font-mono text-xs text-ice-white/55">
              {t("merci.referenceLabel")}: {resolvedOrderId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={retryHref}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center sm:whitespace-nowrap shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {resolvedCourseSlug
              ? t("merci.boutonReessayer")
              : t("merci.boutonCatalogue")}
          </Link>
          <Link
            href="/mes-formations"
            className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:border-brand/40 text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center sm:whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("merci.boutonMesFormations")}
          </Link>
        </div>
      </div>
    );
  }

  // 5. Vérification en cours ou en attente côté opérateur
  const isVerifying = state === "verifying";

  return (
    <div className="w-full max-w-xl rounded-3xl bg-deep-navy border border-[var(--border-subtle)] p-7 sm:p-10 shadow-[var(--card-shadow)] text-center space-y-6">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
          isVerifying
            ? "bg-brand/15 border-brand/30 text-brand-light"
            : "bg-amber-500/15 border-amber-500/30 text-amber-400"
        }`}
      >
        {isVerifying || manualChecking ? (
          <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
        ) : (
          <Clock className="w-8 h-8" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light">
          {t("merci.badge")}
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white">
          {isVerifying ? t("merci.titreVerification") : t("merci.titre")}
        </h1>
        <p className="font-sans text-sm sm:text-base text-ice-white/75 leading-relaxed">
          {isVerifying ? t("merci.sousTitreVerification") : t("merci.sousTitre")}
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-4 space-y-1.5 text-xs sm:text-sm font-sans text-ice-white/70 leading-relaxed">
        <p>{isVerifying ? t("merci.noteVerification") : t("merci.noteDelai")}</p>
        {resolvedOrderId && (
          <p className="font-mono text-xs text-ice-white/55">
            {t("merci.referenceLabel")}: {resolvedOrderId}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {!isVerifying && (
          <button
            type="button"
            onClick={handleManualVerify}
            disabled={manualChecking}
            className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-60 text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 sm:whitespace-nowrap shadow-md shadow-[var(--brand-glow)] transition-all cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <RefreshCw
              className={`w-4 h-4 shrink-0 ${manualChecking ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>
              {manualChecking
                ? t("merci.boutonVerificationEnCours")
                : t("merci.boutonVerifier")}
            </span>
          </button>
        )}
        <Link
          href="/mes-formations"
          className={`flex-1 min-h-[48px] px-5 py-3 rounded-full font-sans text-sm inline-flex items-center justify-center sm:whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
            isVerifying
              ? "bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-semibold shadow-md shadow-[var(--brand-glow)]"
              : "bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:border-brand/40 text-ice-white/85 font-medium"
          }`}
        >
          {t("merci.boutonMesFormations")}
        </Link>
        {isVerifying && (
          <Link
            href="/formations"
            className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] hover:border-brand/40 text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center sm:whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("merci.boutonCatalogue")}
          </Link>
        )}
      </div>
    </div>
  );
}
