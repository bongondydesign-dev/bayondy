"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getAuthErrorMessageKey } from "@/lib/auth/errors";
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
    safeRedirect !== "/profil"
      ? `?redirect=${encodeURIComponent(safeRedirect)}`
      : "";

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);

    // Validation locale du mot de passe (minimum 8 caractères)
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
      const error = err as { code?: string };
      const messageKey = getAuthErrorMessageKey(error?.code || "");
      setErrorKey(messageKey);
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = () => {
    router.push(safeRedirect);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-deep-navy border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
      {/* En-tête du formulaire */}
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white tracking-tight">
          {mode === "inscription"
            ? t("auth.titreInscription")
            : t("auth.titreConnexion")}
        </h1>
        <p className="mt-2 text-sm text-ice-white/70 font-sans">
          {mode === "inscription"
            ? t("auth.sousTitreInscription")
            : t("auth.sousTitreConnexion")}
        </p>
      </div>

      {/* Message d'erreur avec role="alert" */}
      {errorKey && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex items-start gap-3"
        >
          <svg
            className="w-5 h-5 shrink-0 text-red-400 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-sans leading-relaxed">{t(errorKey)}</span>
        </div>
      )}

      {/* Bouton Google */}
      <GoogleButton
        onError={(key) => setErrorKey(key)}
        onSuccess={handleGoogleSuccess}
      />

      {/* Séparateur « Oswa » */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px bg-white/10 flex-1" />
        <span className="font-mono text-xs uppercase tracking-wider text-ice-white/50">
          {t("auth.ou")}
        </span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {/* Formulaire E-mail & Mot de passe */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom (Inscription seulement) */}
        {mode === "inscription" && (
          <div>
            <label
              htmlFor="auth-nom"
              className="block text-xs font-mono uppercase tracking-wider text-ice-white/70 mb-2"
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
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-obsidian border border-white/[0.1] text-ice-white text-sm placeholder:text-ice-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:border-transparent transition-all"
            />
          </div>
        )}

        {/* Champ E-mail */}
        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-mono uppercase tracking-wider text-ice-white/70 mb-2"
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
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-obsidian border border-white/[0.1] text-ice-white text-sm placeholder:text-ice-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:border-transparent transition-all"
          />
        </div>

        {/* Champ Mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="auth-password"
              className="block text-xs font-mono uppercase tracking-wider text-ice-white/70"
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
              className="w-full min-h-[44px] px-4 py-2.5 pr-12 rounded-xl bg-obsidian border border-white/[0.1] text-ice-white text-sm placeholder:text-ice-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:border-transparent transition-all"
            />
            {/* Bouton d'affichage du mot de passe accessible */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? t("auth.cacherMotDePasse")
                  : t("auth.afficherMotDePasse")
              }
              className="absolute right-1 top-1 bottom-1 px-3 flex items-center justify-center text-ice-white/50 hover:text-ice-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg"
            >
              {showPassword ? (
                /* Icône Oeil barré */
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                /* Icône Oeil */
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Bouton de validation principal */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] px-6 py-3 rounded-full bg-brand text-[#07080A] font-semibold text-sm sm:text-base mt-2 hover:bg-brand-light active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shadow-lg shadow-[var(--brand-glow)]"
        >
          {submitting
            ? t("auth.chargement")
            : mode === "inscription"
            ? t("auth.inscription")
            : t("auth.connexion")}
        </button>

        {/* Liens vers les conditions et la politique de confidentialité sous le formulaire d'inscription */}
        {mode === "inscription" && (
          <p className="pt-2 text-xs text-center text-ice-white/60 font-sans leading-relaxed">
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

      {/* Liens d'orientation en bas */}
      <div className="mt-8 pt-6 border-t border-white/[0.08] text-center text-sm text-ice-white/70">
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
