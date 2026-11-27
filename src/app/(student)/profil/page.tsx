"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
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

  const [signingOut, setSigningOut] = useState(false);

  const displayNameInput = displayNameDraft ?? user?.displayName ?? "";

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayNameInput.trim();
    if (!trimmed) return;
    setNameSaving(true);
    setNameFeedback(null);
    try {
      await updateDisplayName(trimmed);
      setDisplayNameDraft(trimmed);
      setNameFeedback({ ok: true, text: t("profil.succesNom") });
    } catch {
      setNameFeedback({ ok: false, text: t("profil.erreurNom") });
    } finally {
      setNameSaving(false);
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

  const initial = (user?.displayName || user?.email || "B").charAt(0).toUpperCase();
  const createdAtLabel = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("fr-FR")
    : "—";
  const lastSignInLabel = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString("fr-FR")
    : "—";

  return (
    <StudentShell
      pageTitle={t("profil.titre")}
      pageSubtitle={t("profil.badge")}
    >
      {loading || !user ? (
        <div className="space-y-6 animate-pulse" aria-hidden="true">
          <div className="h-44 rounded-3xl bg-deep-navy border border-[var(--border-subtle)]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
            <div className="h-64 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Theme-adaptive Profile Hero Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-deep-navy dark:bg-[#0A0B0F] border border-[var(--border-subtle)] dark:border-white/10 p-6 sm:p-8 text-ice-white dark:text-[#F4F5F7] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[var(--card-shadow)] dark:shadow-xl">
            <div
              className="pointer-events-none absolute -bottom-24 left-1/3 w-80 h-80 rounded-full opacity-25 dark:opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(229,72,19,0.28) 0%, rgba(186,52,8,0.06) 55%, transparent 75%)",
              }}
              aria-hidden="true"
            />
            <svg
              className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 opacity-45"
              viewBox="0 0 240 240"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="120"
                cy="120"
                r="94"
                className="stroke-slate-900/10 dark:stroke-white/15"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <circle cx="58" cy="84" r="2.5" className="fill-brand dark:fill-[#FF885C]" />
            </svg>

            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-light dark:text-[#FF885C]">
                  {t("profil.badge")}
                </span>
                {isAdmin && (
                  <span className="font-mono text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold">
                    · Admin
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-4xl tracking-tight text-ice-white dark:text-white">
                {t("profil.titre")}
              </h1>
              <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-slate-300/80 max-w-lg">
                {t("profil.sousTitre")}
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4 shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--surface-active)] dark:bg-[#151821] border-2 border-brand/45 dark:border-[#FF5B22]/60 flex items-center justify-center font-display font-bold text-2xl sm:text-3xl text-brand dark:text-[#FF885C] shadow-inner">
                {initial}
              </div>
            </div>
          </section>

          {/* 2-Column Settings Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Personal Info Card (Editable Display Name + Readonly Email) */}
            <section className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand/12 border border-brand/25 text-brand flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="font-display font-semibold text-lg text-ice-white">
                  {t("profil.infoPersonnelles")}
                </h2>
              </div>

              <form onSubmit={handleSaveName} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="profil-display-name"
                    className="font-mono text-xs uppercase tracking-wider text-ice-white/60 block"
                  >
                    {t("profil.nom")}
                  </label>
                  <input
                    id="profil-display-name"
                    type="text"
                    required
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameDraft(e.target.value)}
                    placeholder={t("auth.nomPlaceholder")}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#FAFAF8] dark:bg-[var(--surface-well)] border border-slate-300 dark:border-[var(--border-strong)] text-ice-white placeholder:text-slate-400 dark:placeholder:text-ice-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="profil-email"
                    className="font-mono text-xs uppercase tracking-wider text-ice-white/60 block"
                  >
                    {t("profil.email")}
                  </label>
                  <input
                    id="profil-email"
                    type="email"
                    readOnly
                    value={user.email || t("profil.nonDefini")}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-ice-white/65 text-sm cursor-default focus:outline-none"
                  />
                </div>

                {nameFeedback && (
                  <div
                    role="status"
                    className={`p-3 rounded-xl border text-xs sm:text-sm ${
                      nameFeedback.ok
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {nameFeedback.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={nameSaving || !displayNameInput.trim()}
                  className="min-h-[44px] px-6 py-2.5 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center gap-2 shadow-md shadow-[var(--brand-glow)] disabled:opacity-50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <span>
                    {nameSaving ? t("profil.enregistrement") : t("profil.enregistrer")}
                  </span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </form>
            </section>

            {/* Right Column: Security & Preferences */}
            <div className="space-y-6">
              {/* Security & Session Card */}
              <section className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand/12 border border-brand/25 text-brand flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg text-ice-white">
                      {t("profil.securite")}
                    </h2>
                    <p className="font-sans text-xs text-ice-white/60">
                      {t("profil.securiteDescription")}
                    </p>
                  </div>
                </div>

                {/* Real account metadata */}
                <dl className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)]">
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-ice-white/55">
                      {t("profil.compteCree")}
                    </dt>
                    <dd className="font-mono text-sm font-medium text-ice-white mt-0.5 tabular-nums">
                      {createdAtLabel}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)]">
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-ice-white/55">
                      {t("profil.dernierAcces")}
                    </dt>
                    <dd className="font-mono text-sm font-medium text-ice-white mt-0.5 tabular-nums">
                      {lastSignInLabel}
                    </dd>
                  </div>
                </dl>

                {resetFeedback && (
                  <div
                    role="status"
                    className={`p-3 rounded-xl border text-xs sm:text-sm ${
                      resetFeedback.ok
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {resetFeedback.text}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {user.email && (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={resetSending}
                      className="min-h-[44px] px-5 py-2.5 rounded-full bg-[var(--surface-well)] border border-[var(--border-strong)] hover:border-brand/50 text-ice-white font-sans font-medium text-sm transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                    >
                      {resetSending
                        ? t("auth.chargement")
                        : t("profil.reinitialiserMotDePasse")}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="min-h-[44px] px-5 py-2.5 rounded-full border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    {signingOut ? t("auth.chargement") : t("profil.boutonDeconnexion")}
                  </button>
                </div>
              </section>

              {/* Preferences & Shortcuts Card */}
              <section className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-6 space-y-4">
                <h2 className="font-display font-semibold text-base text-ice-white">
                  {t("profil.preferences")}
                </h2>

                <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)]">
                  <span className="font-sans text-sm font-medium text-ice-white/85">
                    {t("profil.themeActuel")}
                  </span>
                  <ThemeToggle />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/mes-formations"
                    className="flex-1 min-w-[160px] min-h-[44px] px-4 py-2.5 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] hover:border-brand/45 text-ice-white font-sans text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                  >
                    <span>{t("profil.mesFormations")}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex-1 min-w-[160px] min-h-[44px] px-4 py-2.5 rounded-xl bg-brand/12 border border-brand/30 hover:bg-brand/18 text-brand-light font-sans text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                    >
                      <span>{t("mesFormations.navAdmin")}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
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
