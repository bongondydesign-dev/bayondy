"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Lock,
  LogIn,
  Receipt,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";

type VerificationState = "verifying" | "paid" | "pending" | "failed";

interface VerifyApiResponse {
  ok?: boolean;
  status?: "paid" | "pending" | "failed";
  orderId?: string;
  courseId?: string;
  courseSlug?: string | null;
  courseTitle?: string | null;
  amount?: number | null;
  currency?: string | null;
  method?: string | null;
  paidAt?: string | null;
  error?: string;
  code?: string;
  diagnostic?: string;
  upstreamStatus?: number;
}

interface StoredLastOrder {
  orderId?: string;
  courseId?: string;
  courseSlug?: string;
  courseTitle?: string | null;
  amount?: number | null;
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

function humanizeSlug(slug: string): string {
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatReceiptDate(iso: string | null): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatReceiptAmount(amount: number | null, currency: string): string | null {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return `${amount.toLocaleString("fr-FR")} ${currency || "HTG"}`;
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
  const [resolvedCourseTitle, setResolvedCourseTitle] = useState<string>("");
  const [resolvedAmount, setResolvedAmount] = useState<number | null>(null);
  const [resolvedCurrency, setResolvedCurrency] = useState<string>("HTG");
  const [resolvedMethod, setResolvedMethod] = useState<string>("MonCash");
  const [resolvedDateIso, setResolvedDateIso] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [manualChecking, setManualChecking] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loginRedirectHref = useMemo(() => {
    const params = new URLSearchParams();
    if (urlOrderId) params.set("orderId", urlOrderId);
    if (urlCourseSlug) params.set("courseSlug", urlCourseSlug);
    const query = params.toString();
    const target = query ? `/merci?${query}` : "/merci";
    return `/connexion?redirect=${encodeURIComponent(target)}`;
  }, [urlOrderId, urlCourseSlug]);

  useEffect(() => {
    const stored = readStoredOrder();
    let preloadTimer: ReturnType<typeof setTimeout> | null = null;
    if (stored && (stored.courseTitle || stored.amount || stored.orderId)) {
      preloadTimer = setTimeout(() => {
        if (!urlOrderId && stored.orderId) setResolvedOrderId(stored.orderId);
        if (!urlCourseSlug && stored.courseSlug) setResolvedCourseSlug(stored.courseSlug);
        if (stored.courseTitle) setResolvedCourseTitle(stored.courseTitle);
        if (typeof stored.amount === "number") setResolvedAmount(stored.amount);
      }, 0);
    }
    return () => {
      if (preloadTimer) clearTimeout(preloadTimer);
    };
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
        if (data?.courseTitle) setResolvedCourseTitle(data.courseTitle);
        if (typeof data?.amount === "number") setResolvedAmount(data.amount);
        if (data?.currency) setResolvedCurrency(data.currency);
        if (data?.method) {
          setResolvedMethod(
            data.method.toLowerCase() === "moncash" ? "MonCash" : data.method
          );
        }
        if (data?.paidAt) setResolvedDateIso(data.paidAt);

        if (ok && data?.status === "paid") {
          clearStoredOrder();
          setVerificationError(null);
          setState("paid");
          return;
        }

        if (ok && data?.status === "failed") {
          clearStoredOrder();
          setVerificationError(null);
          setState("failed");
          return;
        }

        if (ok && data?.status === "pending" && attempts < MAX_AUTO_POLLS) {
          attempts += 1;
          setVerificationError(null);
          setState("verifying");
          pollTimerRef.current = setTimeout(() => {
            void runAttempt();
          }, AUTO_POLL_INTERVAL_MS);
          return;
        }

        setVerificationError(
          !ok && data?.error
            ? data.error
            : data?.diagnostic
              ? data.diagnostic
              : null
        );
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

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleManualVerify = async () => {
    if (!user || manualChecking) return;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    setManualChecking(true);
    setVerificationError(null);
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
      if (data?.courseTitle) setResolvedCourseTitle(data.courseTitle);
      if (typeof data?.amount === "number") setResolvedAmount(data.amount);
      if (data?.currency) setResolvedCurrency(data.currency);
      if (data?.method) {
        setResolvedMethod(
          data.method.toLowerCase() === "moncash" ? "MonCash" : data.method
        );
      }
      if (data?.paidAt) setResolvedDateIso(data.paidAt);

      if (ok && data?.status === "paid") {
        clearStoredOrder();
        setVerificationError(null);
        setState("paid");
      } else if (ok && data?.status === "failed") {
        clearStoredOrder();
        setVerificationError(null);
        setState("failed");
      } else {
        setVerificationError(
          !ok && data?.error
            ? data.error
            : data?.diagnostic
              ? data.diagnostic
              : null
        );
        setState("pending");
      }
    } catch {
      setState("pending");
    } finally {
      setManualChecking(false);
    }
  };

  const handleCopyOrderId = async () => {
    if (!resolvedOrderId) return;
    let copied = false;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(resolvedOrderId);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = resolvedOrderId;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedRef(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  // Calcul des états visuels unifiés (aucun dédoublement de logique)
  const uiMode: "loading" | "authRequired" | VerificationState = authLoading
    ? "loading"
    : !user
      ? "authRequired"
      : state;

  const displayCourseTitle =
    resolvedCourseTitle ||
    humanizeSlug(resolvedCourseSlug) ||
    t("merci.formationDefaut");

  const formattedAmount = formatReceiptAmount(resolvedAmount, resolvedCurrency);
  const formattedDate = formatReceiptDate(resolvedDateIso);

  const statusConfig = {
    loading: {
      iconBox: "bg-brand/12 border-brand/25 text-brand-light",
      statusText: t("merci.statutLabel.verifying"),
      statusColor: "text-brand-light",
      title: t("merci.titreVerification"),
      subtitle: t("merci.sousTitreVerification"),
      note: t("merci.noteVerification"),
      accentGlow: "rgba(255, 91, 34, 0.08)",
    },
    verifying: {
      iconBox: "bg-brand/12 border-brand/25 text-brand-light",
      statusText: t("merci.statutLabel.verifying"),
      statusColor: "text-brand-light",
      title: t("merci.titreVerification"),
      subtitle: t("merci.sousTitreVerification"),
      note: t("merci.noteVerification"),
      accentGlow: "rgba(255, 91, 34, 0.08)",
    },
    authRequired: {
      iconBox: "bg-amber-500/12 border-amber-500/25 text-amber-600 dark:text-amber-400",
      statusText: t("merci.statutLabel.authRequired"),
      statusColor: "text-amber-700 dark:text-amber-400",
      title: t("merci.titre"),
      subtitle: t("merci.connexionRequise"),
      note: t("merci.noteWebhook"),
      accentGlow: "rgba(245, 158, 11, 0.07)",
    },
    paid: {
      iconBox: "bg-emerald-500/12 border-emerald-500/25 text-emerald-600 dark:text-emerald-400",
      statusText: t("merci.statutLabel.paid"),
      statusColor: "text-emerald-700 dark:text-emerald-400",
      title: t("merci.titreConfirme"),
      subtitle: t("merci.sousTitreConfirme"),
      note: t("merci.noteConfirme"),
      accentGlow: "rgba(16, 185, 129, 0.09)",
    },
    pending: {
      iconBox: "bg-amber-500/12 border-amber-500/25 text-amber-600 dark:text-amber-400",
      statusText: t("merci.statutLabel.pending"),
      statusColor: "text-amber-700 dark:text-amber-400",
      title: t("merci.titre"),
      subtitle: t("merci.sousTitre"),
      note: verificationError || t("merci.noteDelai"),
      accentGlow: "rgba(245, 158, 11, 0.07)",
    },
    failed: {
      iconBox: "bg-red-500/12 border-red-500/25 text-red-600 dark:text-red-400",
      statusText: t("merci.statutLabel.failed"),
      statusColor: "text-red-700 dark:text-red-400",
      title: t("merci.titreEchoue"),
      subtitle: t("merci.sousTitreEchoue"),
      note: t("merci.noteEchoue"),
      accentGlow: "rgba(239, 68, 68, 0.08)",
    },
  }[uiMode];

  const renderStatusIcon = (sizeClass: string) => {
    if (uiMode === "loading" || uiMode === "verifying" || manualChecking) {
      return <Loader2 className={`${sizeClass} animate-spin`} aria-hidden="true" />;
    }
    if (uiMode === "paid") {
      return <CheckCircle2 className={sizeClass} aria-hidden="true" />;
    }
    if (uiMode === "failed") {
      return <XCircle className={sizeClass} aria-hidden="true" />;
    }
    return <Clock className={sizeClass} aria-hidden="true" />;
  };

  const courseAccessHref = resolvedCourseSlug
    ? `/mes-formations/${encodeURIComponent(resolvedCourseSlug)}`
    : "/mes-formations";
  const courseRetryHref = resolvedCourseSlug
    ? `/formations/${encodeURIComponent(resolvedCourseSlug)}`
    : "/formations";

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
      {/* Colonne principale : Statut, progression 3 étapes et actions */}
      <section className="lg:col-span-7 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] flex flex-col justify-between overflow-hidden relative">
        <div
          className="absolute inset-x-0 top-0 h-44 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 75% 80% at 15% 0%, ${statusConfig.accentGlow} 0%, transparent 72%)`,
          }}
          aria-hidden="true"
        />

        {/* En-tête statut & message */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-6 flex-1">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${statusConfig.iconBox}`}
            >
              {renderStatusIcon("w-6 h-6")}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-sans">
                <span className={`font-semibold whitespace-nowrap ${statusConfig.statusColor}`}>
                  {statusConfig.statusText}
                </span>
                <span className="text-slate-500 dark:text-ice-white/30" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono text-slate-700 dark:text-ice-white/70 whitespace-nowrap">
                  {resolvedMethod}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-[34px] tracking-tight leading-[1.16] text-ice-white text-balance">
              {statusConfig.title}
            </h1>
            <p className="font-sans text-sm sm:text-base text-slate-700 dark:text-ice-white/75 leading-relaxed max-w-xl">
              {statusConfig.subtitle}
            </p>
          </div>

          <p
            className={`pt-4 border-t border-[var(--border-subtle)] font-sans text-xs sm:text-sm leading-relaxed ${
              uiMode === "pending" && verificationError
                ? "text-amber-800 dark:text-amber-300 font-medium"
                : "text-slate-700 dark:text-ice-white/60"
            }`}
          >
            {statusConfig.note}
          </p>
        </div>

        {/* Pipeline 3 étapes (sans cartes imbriquées) */}
        <div className="relative z-10 px-6 sm:px-8 lg:px-10 py-5 border-t border-[var(--border-subtle)] bg-[var(--surface-well)]">
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Étape 01 : Commande créée */}
            <li className="flex items-center gap-3 min-w-0">
              <span
                className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <span className="block font-mono text-[10px] text-slate-600 dark:text-ice-white/50 tabular-nums font-medium">
                  01
                </span>
                <span className="block font-sans text-xs font-medium text-ice-white leading-snug">
                  {t("merci.etapeCommande")}
                </span>
              </div>
            </li>

            {/* Étape 02 : Vérification MonCash */}
            <li className="flex items-center gap-3 min-w-0">
              <span
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                  uiMode === "paid"
                    ? "bg-emerald-500/15 border-emerald-600/30 text-emerald-700 dark:text-emerald-400"
                    : uiMode === "failed"
                      ? "bg-red-500/15 border-red-600/30 text-red-700 dark:text-red-400"
                      : uiMode === "loading" || uiMode === "verifying"
                        ? "bg-brand/15 border-brand/35 text-brand-light"
                        : "bg-amber-500/15 border-amber-600/30 text-amber-700 dark:text-amber-400"
                }`}
                aria-hidden="true"
              >
                {uiMode === "paid" ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : uiMode === "failed" ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : uiMode === "loading" || uiMode === "verifying" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
              </span>
              <div className="min-w-0">
                <span className="block font-mono text-[10px] text-slate-600 dark:text-ice-white/50 tabular-nums font-medium">
                  02
                </span>
                <span className="block font-sans text-xs font-medium text-ice-white leading-snug">
                  {t("merci.etapeVerification")}
                </span>
              </div>
            </li>

            {/* Étape 03 : Accès formation */}
            <li className="flex items-center gap-3 min-w-0">
              <span
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                  uiMode === "paid"
                    ? "bg-emerald-500/15 border-emerald-600/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-white dark:bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-slate-600 dark:text-ice-white/40"
                }`}
                aria-hidden="true"
              >
                {uiMode === "paid" ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </span>
              <div className="min-w-0">
                <span className="block font-mono text-[10px] text-slate-600 dark:text-ice-white/50 tabular-nums font-medium">
                  03
                </span>
                <span
                  className={`block font-sans text-xs font-medium leading-snug ${
                    uiMode === "paid" ? "text-ice-white" : "text-slate-700 dark:text-ice-white/55"
                  }`}
                >
                  {t("merci.etapeAcces")}
                </span>
              </div>
            </li>
          </ol>
        </div>

        {/* Barre d'actions contextuelle */}
        <div className="relative z-10 px-6 sm:px-8 lg:px-10 py-5 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-3">
          {uiMode === "authRequired" ? (
            <>
              <Link
                href={loginRedirectHref}
                className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t("merci.boutonConnexion")}</span>
              </Link>
              <Link
                href="/formations"
                className="min-h-[48px] px-5 py-3 rounded-full bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none hover:border-brand/55 hover:bg-slate-50 dark:hover:bg-[var(--surface-elevated)] text-slate-800 dark:text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t("merci.boutonCatalogue")}</span>
              </Link>
            </>
          ) : uiMode === "paid" ? (
            <>
              <Link
                href={courseAccessHref}
                className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <span>
                  {resolvedCourseSlug
                    ? t("merci.boutonAccederCours")
                    : t("merci.boutonMesFormations")}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                href={resolvedCourseSlug ? "/mes-formations" : "/formations"}
                className="min-h-[48px] px-5 py-3 rounded-full bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none hover:border-brand/55 hover:bg-slate-50 dark:hover:bg-[var(--surface-elevated)] text-slate-800 dark:text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                {resolvedCourseSlug
                  ? t("merci.boutonMesFormations")
                  : t("merci.boutonCatalogue")}
              </Link>
            </>
          ) : uiMode === "failed" ? (
            <>
              <Link
                href={courseRetryHref}
                className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <span>
                  {resolvedCourseSlug
                    ? t("merci.boutonReessayer")
                    : t("merci.boutonCatalogue")}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                href="/mes-formations"
                className="min-h-[48px] px-5 py-3 rounded-full bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none hover:border-brand/55 hover:bg-slate-50 dark:hover:bg-[var(--surface-elevated)] text-slate-800 dark:text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                {t("merci.boutonMesFormations")}
              </Link>
            </>
          ) : uiMode === "pending" ? (
            <>
              <button
                type="button"
                onClick={handleManualVerify}
                disabled={manualChecking}
                className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light disabled:opacity-60 text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-md shadow-[var(--brand-glow)] transition-all cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
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
              <Link
                href="/mes-formations"
                className="min-h-[48px] px-5 py-3 rounded-full bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none hover:border-brand/55 hover:bg-slate-50 dark:hover:bg-[var(--surface-elevated)] text-slate-800 dark:text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                {t("merci.boutonMesFormations")}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/mes-formations"
                className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 shadow-md shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <span>{t("merci.boutonMesFormations")}</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>
              <Link
                href="/formations"
                className="min-h-[48px] px-5 py-3 rounded-full bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none hover:border-brand/55 hover:bg-slate-50 dark:hover:bg-[var(--surface-elevated)] text-slate-800 dark:text-ice-white/85 font-sans font-medium text-sm inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                {t("merci.boutonCatalogue")}
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Colonne secondaire : Reçu numérique structuré */}
      <aside className="lg:col-span-5 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] flex flex-col justify-between overflow-hidden">
        {/* En-tête du reçu */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-well)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Receipt className="w-4 h-4 text-brand-light shrink-0" aria-hidden="true" />
            <span className="font-sans font-semibold text-sm text-ice-white truncate">
              {t("merci.resiTitre")}
            </span>
          </div>
          <span className="font-mono text-xs font-medium text-slate-600 dark:text-ice-white/55 shrink-0">
            {SITE_NAME}
          </span>
        </div>

        {/* Résumé formation & montant */}
        <div className="px-6 py-6 border-b border-[var(--border-subtle)] space-y-2">
          <p className="font-sans text-xs font-medium text-slate-600 dark:text-ice-white/55">
            {t("admin.paiements.colCours")}
          </p>
          <p className="font-display font-semibold text-lg text-ice-white leading-snug line-clamp-2">
            {displayCourseTitle}
          </p>
          {formattedAmount && (
            <p className="pt-2 font-display font-bold text-3xl text-ice-white tabular-nums tracking-tight">
              {formattedAmount}
            </p>
          )}
        </div>

        {/* Tableau de détails (lignes hairline) */}
        <dl className="px-6 py-2 divide-y divide-[var(--border-subtle)] flex-1 text-sm">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <dt className="font-sans text-slate-600 dark:text-ice-white/60 shrink-0">
              {t("merci.estatiLabel")}
            </dt>
            <dd
              className={`font-sans font-semibold inline-flex items-center gap-1.5 text-right ${statusConfig.statusColor}`}
            >
              {renderStatusIcon("w-3.5 h-3.5 shrink-0")}
              <span>{statusConfig.statusText}</span>
            </dd>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <dt className="font-sans text-slate-600 dark:text-ice-white/60 shrink-0">
              {t("merci.metodLabel")}
            </dt>
            <dd className="font-mono text-xs sm:text-sm font-medium text-ice-white">
              {resolvedMethod}
            </dd>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-3">
            <dt className="font-sans text-slate-600 dark:text-ice-white/60 shrink-0">
              {t("merci.referenceLabel")}
            </dt>
            <dd className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-xs font-medium text-slate-800 dark:text-ice-white/85 truncate max-w-[170px] tabular-nums">
                {resolvedOrderId || "—"}
              </span>
              {resolvedOrderId && (
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  aria-label={t("merci.kopyeReferans")}
                  className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white dark:bg-[var(--surface-well)] hover:bg-slate-50 dark:hover:bg-[var(--surface-subtle)] border border-[var(--border-strong)] dark:border-[var(--border-subtle)] text-slate-800 dark:text-ice-white/75 hover:text-ice-white font-sans text-xs font-medium inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  {copiedRef ? (
                    <>
                      <Check
                        className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                      <span>{t("merci.referansKopye")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" aria-hidden="true" />
                      <span>{t("merci.kopyeReferans")}</span>
                    </>
                  )}
                </button>
              )}
            </dd>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <dt className="font-sans text-slate-600 dark:text-ice-white/60 shrink-0">
              {t("merci.datLabel")}
            </dt>
            <dd className="font-mono text-xs sm:text-sm text-slate-800 dark:text-ice-white/80 tabular-nums">
              {formattedDate}
            </dd>
          </div>
        </dl>

        {/* Pied sécurité & assistance */}
        <div className="px-6 py-4 bg-[var(--surface-well)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-ice-white/60">
          <span className="inline-flex items-center gap-2 min-w-0">
            <ShieldCheck
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{t("merci.sekiriteNote")}</span>
          </span>
          <Link
            href="/faq"
            className="font-sans font-semibold text-slate-800 dark:text-ice-white/80 hover:text-brand-light whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded"
          >
            {t("merci.besoinAide")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
