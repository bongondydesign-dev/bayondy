"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import {
  formatProfileDate,
  getPrimaryAuthProviderLabel,
  getUserInitials,
  isDisplayNameDirty,
} from "@/lib/auth/profile";
import { StudentShell } from "@/components/student/StudentShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { t } from "@/lib/i18n";

export default function ProfilPage() {
  const { user, loading } = useRequireAuth();
  const { signOut, isAdmin, updateDisplayName, resetPassword } = useAuth();
  const router = useRouter();

  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const [resetSending, setResetSending] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  const [emailCopied, setEmailCopied] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayNameInput = displayNameDraft ?? user?.displayName ?? "";
  const isDirty = isDisplayNameDirty(displayNameDraft, user?.displayName);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayNameInput.trim();
    if (!trimmed || !isDirty) return;
    setNameSaving(true);
    setNameFeedback(null);
    try {
      await updateDisplayName(trimmed);
      setDisplayNameDraft(null);
      setNameFeedback({ ok: true, text: t("profil.succesNom") });
    } catch {
      setNameFeedback({ ok: false, text: t("profil.erreurNom") });
    } finally {
      setNameSaving(false);
    }
  };

  const handleCopyEmail = async () => {
    if (!user?.email || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      // Ignore clipboard permission denials cleanly
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetSending(true);
    setResetFeedback(null);
    try {
      await resetPassword(user.email);
      setResetFeedback({ ok: true, text: t("profil.succesMotDePasse") });
    } catch {
      setResetFeedback({ ok: false, text: t("profil.erreurMotDePasse") });
    } finally {
      setResetSending(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      setSigningOut(false);
    }
  };

  const initials = getUserInitials(user?.displayName, user?.email);
  const resolvedName = user?.displayName?.trim() || user?.email?.split("@")[0] || t("profil.titre");
  const createdAtLabel = formatProfileDate(user?.metadata?.creationTime);
  const lastSignInLabel = formatProfileDate(user?.metadata?.lastSignInTime);
  const providerIds = (user?.providerData || [])
    .map((p) => p?.providerId)
    .filter((id): id is string => Boolean(id));
  const providerLabel = getPrimaryAuthProviderLabel(providerIds);

  return (
    <StudentShell pageTitle={t("profil.titre")} pageSubtitle={t("profil.badge")}>
      {loading || !user ? (
        <div className="space-y-8 animate-pulse" aria-hidden="true">
          <div className="h-52 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-80 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
            <div className="lg:col-span-5 space-y-6">
              <div className="h-44 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
              <div className="h-44 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-10">
          {/* Architectural Account Overview Frame: Single Elevation + Integrated Metadata Strip */}
          <section className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] overflow-hidden">
            <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl bg-[var(--surface-well)] border border-[var(--border-strong)] overflow-hidden flex items-center justify-center shrink-0">
                  {user.photoURL && !avatarError ? (
                    <Image
                      src={user.photoURL}
                      alt={resolvedName}
                      fill
                      referrerPolicy="no-referrer"
                      sizes="72px"
                      onError={() => setAvatarError(true)}
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-display font-bold text-2xl text-brand-light">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-light">
                    <span>{t("profil.badge")}</span>
                    {isAdmin && (
                      <>
                        <span className="text-slate-500 dark:text-ice-white/40" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-amber-700 dark:text-amber-300 font-semibold">
                          Admin
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-ice-white truncate">
                    {resolvedName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-sans text-slate-700 dark:text-ice-white/70">
                    <span className="truncate">{user.email || t("profil.nonDefini")}</span>
                    {user.email && (
                      <>
                        <span className="text-slate-500 dark:text-ice-white/35" aria-hidden="true">
                          ·
                        </span>
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-700 dark:text-emerald-300 font-medium whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{t("profil.emailVerifie")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-amber-700 dark:text-amber-300 font-medium whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{t("profil.emailNonVerifie")}</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/mes-formations"
                  className="min-h-[44px] px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-[var(--brand-glow)] transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{t("mesFormations.navTableau")}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Integrated Bottom 3-Column Account Metadata Strip */}
            <dl className="border-t border-[var(--border-subtle)] bg-[var(--surface-well)] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)]">
              <div className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:text-ice-white/55">
                    {t("profil.compteCree")}
                  </dt>
                  <dd className="font-mono text-base sm:text-lg font-semibold text-ice-white mt-1 tabular-nums">
                    {createdAtLabel}
                  </dd>
                </div>
                <Calendar className="w-5 h-5 text-slate-500 dark:text-ice-white/45 shrink-0" aria-hidden="true" />
              </div>

              <div className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:text-ice-white/55">
                    {t("profil.dernierAcces")}
                  </dt>
                  <dd className="font-mono text-base sm:text-lg font-semibold text-ice-white mt-1 tabular-nums">
                    {lastSignInLabel}
                  </dd>
                </div>
                <Clock className="w-5 h-5 text-slate-500 dark:text-ice-white/45 shrink-0" aria-hidden="true" />
              </div>

              <div className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <dt className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:text-ice-white/55">
                    {t("profil.methodeConnexion")}
                  </dt>
                  <dd className="font-mono text-base sm:text-lg font-semibold text-ice-white mt-1 truncate">
                    {providerLabel}
                  </dd>
                </div>
                <Mail className="w-5 h-5 text-brand-light shrink-0" aria-hidden="true" />
              </div>
            </dl>
          </section>

          {/* 12-Column Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 01 — Personal Information (7 cols) */}
            <section className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                    01
                  </span>
                  <span className="w-6 h-px bg-brand/50" aria-hidden="true" />
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/55">
                    {t("profil.badge")}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl tracking-tight text-ice-white">
                  {t("profil.infoPersonnelles")}
                </h2>
              </div>

              <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 space-y-5">
                <form onSubmit={handleSaveName} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="profil-display-name"
                      className="font-mono text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/60 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-brand-light" aria-hidden="true" />
                      <span>{t("profil.nom")}</span>
                    </label>
                    <input
                      id="profil-display-name"
                      type="text"
                      required
                      value={displayNameInput}
                      onChange={(e) => {
                        setDisplayNameDraft(e.target.value);
                        if (nameFeedback) setNameFeedback(null);
                      }}
                      placeholder={t("auth.nomPlaceholder")}
                      className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white dark:bg-[var(--surface-well)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none text-ice-white placeholder:text-slate-500 dark:placeholder:text-ice-white/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="profil-email"
                      className="font-mono text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/60 flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-600 dark:text-ice-white/55" aria-hidden="true" />
                      <span>{t("profil.email")}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="profil-email"
                        type="email"
                        readOnly
                        value={user.email || t("profil.nonDefini")}
                        className="flex-1 min-w-0 min-h-[46px] px-4 py-2.5 rounded-xl bg-[var(--surface-well)] dark:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-slate-700 dark:text-ice-white/70 text-base sm:text-sm cursor-default focus:outline-none"
                      />
                      {user.email && (
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          aria-label={t("profil.copierEmail")}
                          title={t("profil.copierEmail")}
                          className="min-h-[46px] px-3.5 rounded-xl border border-[var(--border-strong)] dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--surface-well)] shadow-2xs dark:shadow-none hover:border-brand/55 text-slate-800 dark:text-ice-white/80 hover:text-ice-white font-mono text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                        >
                          {emailCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                              <span>{t("profil.emailCopie")}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span className="hidden sm:inline">{t("profil.copierEmail")}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {nameFeedback && (
                    <div
                      role="status"
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${
                        nameFeedback.ok
                          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {nameFeedback.ok ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      )}
                      <span>{nameFeedback.text}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[var(--border-faint)] flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={nameSaving || !isDirty}
                      className="min-h-[44px] px-6 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center gap-2 shadow-md shadow-[var(--brand-glow)] disabled:opacity-45 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                    >
                      <span>
                        {nameSaving ? t("profil.enregistrement") : t("profil.enregistrer")}
                      </span>
                      <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Right Column: 02 Security & 03 Preferences (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 02 — Security & Session */}
              <section className="space-y-5">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-brand tabular-nums">
                      02
                    </span>
                    <span className="w-6 h-px bg-brand/50" aria-hidden="true" />
                    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/55">
                      {t("profil.methodeConnexion")} · {providerLabel}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-2xl tracking-tight text-ice-white">
                    {t("profil.securite")}
                  </h2>
                </div>

                <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-brand-light mt-1 shrink-0" aria-hidden="true" />
                    <p className="font-sans text-sm text-slate-700 dark:text-ice-white/75 leading-relaxed">
                      {t("profil.securiteDescription")}
                    </p>
                  </div>

                  {resetFeedback && (
                    <div
                      role="status"
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${
                        resetFeedback.ok
                          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                          : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {resetFeedback.ok ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      )}
                      <span>{resetFeedback.text}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-3">
                    {user.email && (
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetSending}
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-full bg-white dark:bg-[var(--surface-well)] border border-[var(--border-strong)] shadow-2xs dark:shadow-none hover:border-brand/55 text-ice-white font-sans font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                      >
                        <KeyRound className="w-4 h-4 text-brand-light shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {resetSending
                            ? t("auth.chargement")
                            : t("profil.reinitialiserMotDePasse")}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-full border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 font-sans font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>
                        {signingOut ? t("auth.chargement") : t("profil.boutonDeconnexion")}
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              {/* 03 — Preferences & Quick Access */}
              <section className="space-y-4">
                <h2 className="font-display font-bold text-lg tracking-tight text-ice-white">
                  {t("profil.preferences")}
                </h2>

                <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] divide-y divide-[var(--border-subtle)] overflow-hidden">
                  <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <span className="font-sans text-sm font-medium text-slate-800 dark:text-ice-white/85">
                      {t("profil.themeActuel")}
                    </span>
                    <ThemeToggle variant="segmented" />
                  </div>

                  <Link
                    href="/mes-formations"
                    className="px-5 py-3.5 min-h-[48px] flex items-center justify-between gap-3 hover:bg-[var(--surface-subtle)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                  >
                    <span className="flex items-center gap-3 font-sans text-sm font-medium text-ice-white min-w-0">
                      <LayoutDashboard
                        className="w-4 h-4 text-brand-light shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{t("profil.mesFormations")}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 dark:text-ice-white/45 shrink-0" aria-hidden="true" />
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-5 py-3.5 min-h-[48px] flex items-center justify-between gap-3 hover:bg-[var(--surface-subtle)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                    >
                      <span className="flex items-center gap-3 font-sans text-sm font-semibold text-brand-light min-w-0">
                        <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{t("mesFormations.navAdmin")}</span>
                      </span>
                      <ArrowRight
                        className="w-4 h-4 text-brand-light/70 shrink-0"
                        aria-hidden="true"
                      />
                    </Link>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </StudentShell>
  );
}
