"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  extractAuthErrorCode,
  extractSafeAuthErrorDetail,
  getAuthErrorMessageKey,
} from "@/lib/auth/errors";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { GoogleButton } from "./GoogleButton";
import { t } from "@/lib/i18n";

interface AuthFormProps {
  mode: "connexion" | "inscription";
  redirectTo?: string;
}

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const safeRedirect = getSafeRedirectPath(redirectTo);
  const redirectQuery =
    safeRedirect !== "/mes-formations"
      ? `?redirect=${encodeURIComponent(safeRedirect)}`
      : "";

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    setErrorDetail(null);

    if (motDePasse.length < 8) {
      setErrorKey("auth.motDePasseTropCourt");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "inscription") {
        await signUpWithEmail(nom, email, motDePasse);
      } else {
        await signInWithEmail(email, motDePasse);
      }
      router.push(safeRedirect);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("[AuthForm error]", err);
      }
      const errorCode = extractAuthErrorCode(err);
      const messageKey = getAuthErrorMessageKey(errorCode);
      setErrorKey(messageKey);
      setErrorDetail(extractSafeAuthErrorDetail(err));
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push(safeRedirect);
  };

  const inputClasses =
    "w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#090B10] border border-[var(--border-strong)] shadow-2xs dark:shadow-none text-ice-white text-sm placeholder:text-slate-500 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:border-transparent transition-all";

  return (
    <div className="animate-hero-1 w-full max-w-md mx-auto rounded-2xl surface-glass border border-[var(--border-subtle)] p-6 sm:p-8">
      {/* En-tête du formulaire */}
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white tracking-tight">
          {mode === "inscription"
            ? t("auth.titreInscription")
            : t("auth.titreConnexion")}
        </h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-ice-white/70 font-sans">
          {mode === "inscription"
            ? t("auth.sousTitreInscription")
            : t("auth.sousTitreConnexion")}
        </p>
      </div>

      {/* Message d'erreur */}
      {errorKey && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200 text-sm flex items-start gap-3"
        >
          <AlertCircle
            className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5"
            aria-hidden="true"
          />
          <div className="font-sans leading-relaxed">
            <span>{t(errorKey)}</span>
            {errorDetail && (
              <p className="mt-1 font-mono text-xs text-red-700 dark:text-red-300/80">
                {errorDetail}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bouton Google */}
      <GoogleButton
        onError={(key, detail) => {
          setErrorKey(key);
          setErrorDetail(detail ?? null);
        }}
        onSuccess={handleGoogleSuccess}
      />

      {/* Séparateur */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px bg-[var(--border-subtle)] flex-1" />
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-ice-white/55">
          {t("auth.ou")}
        </span>
        <div className="h-px bg-[var(--border-subtle)] flex-1" />
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "inscription" && (
          <div>
            <label
              htmlFor="auth-nom"
              className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/70 mb-2"
            >
              {t("auth.nom")}
            </label>
            <input
              id="auth-nom"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder={t("auth.nomPlaceholder")}
              className={inputClasses}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/70 mb-2"
          >
            {t("auth.email")}
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
            className={inputClasses}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="auth-password"
              className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/70"
            >
              {t("auth.motDePasse")}
            </label>
            {mode === "connexion" && (
              <Link
                href="/mot-de-passe-oublie"
                className="text-xs text-brand-light hover:underline min-h-[44px] inline-flex items-center"
              >
                {t("auth.lienMotDePasseOublie")}
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete={
                mode === "inscription" ? "new-password" : "current-password"
              }
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder={t("auth.motDePassePlaceholder")}
              className={`${inputClasses} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? t("auth.cacherMotDePasse")
                  : t("auth.afficherMotDePasse")
              }
              className="absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center text-slate-600 dark:text-ice-white/50 hover:text-ice-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[46px] px-6 py-3 rounded-full bg-gradient-to-b from-[#FF5E24] to-brand text-[var(--brand-fg)] font-semibold text-sm sm:text-base mt-2 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_22px_-6px_var(--brand-glow)] cursor-pointer"
        >
          {submitting
            ? t("auth.chargement")
            : mode === "inscription"
            ? t("auth.inscription")
            : t("auth.connexion")}
        </button>

        {mode === "inscription" && (
          <p className="pt-2 text-xs text-center text-slate-700 dark:text-ice-white/65 font-sans leading-relaxed">
            {t("auth.acceptationTexte")}{" "}
            <Link
              href="/conditions"
              className="text-brand-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded"
            >
              {t("auth.lienConditions")}
            </Link>{" "}
            {t("auth.et")}{" "}
            <Link
              href="/confidentialite"
              className="text-brand-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded"
            >
              {t("auth.lienConfidentialite")}
            </Link>
            .
          </p>
        )}
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center text-sm text-slate-700 dark:text-ice-white/70">
        {mode === "inscription" ? (
          <p>
            {t("auth.dejaCompte")}{" "}
            <Link
              href={`/connexion${redirectQuery}`}
              className="text-brand-light font-medium hover:underline min-h-[44px] inline-flex items-center"
            >
              {t("auth.lienConnexion")}
            </Link>
          </p>
        ) : (
          <p>
            {t("auth.pasDeCompte")}{" "}
            <Link
              href={`/inscription${redirectQuery}`}
              className="text-brand-light font-medium hover:underline min-h-[44px] inline-flex items-center"
            >
              {t("auth.lienInscription")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
