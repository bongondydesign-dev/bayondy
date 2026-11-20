"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { t } from "@/lib/i18n";

export default function MotDePasseOubliePage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await resetPassword(email);
    } catch {
      // Pour des raisons de sécurité, nous ne révélons pas si le compte existe ou non
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-md mx-auto rounded-3xl bg-deep-navy border border-white/10 p-6 sm:p-8 shadow-2xl">
          {/* En-tête */}
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white tracking-tight">
              {t("auth.titreMotDePasseOublie")}
            </h1>
            <p className="mt-2 text-sm text-ice-white/70 font-sans">
              {t("auth.sousTitreMotDePasseOublie")}
            </p>
          </div>

          {/* Message de confirmation neutre */}
          {submitted ? (
            <div
              role="status"
              className="p-5 rounded-2xl bg-aurora/10 border border-aurora/30 text-ice-white text-sm space-y-4"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 shrink-0 text-aurora mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-sans leading-relaxed">
                  {t("auth.succesReinitialisation")}
                </p>
              </div>
              <div className="pt-2 text-center">
                <Link
                  href="/connexion"
                  className="text-aurora font-medium hover:underline text-sm min-h-[44px] inline-flex items-center"
                >
                  {t("auth.retourConnexion")}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-mono uppercase tracking-wider text-ice-white/70 mb-2"
                >
                  {t("auth.email")}
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-obsidian border border-white/10 text-ice-white text-sm placeholder:text-ice-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora focus-visible:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] px-6 py-3 rounded-xl bg-ion-blue text-ice-white font-medium text-sm sm:text-base hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora shadow-md shadow-ion-blue/20"
              >
                {submitting
                  ? t("auth.chargement")
                  : t("auth.boutonReinitialiser")}
              </button>

              <div className="pt-4 text-center">
                <Link
                  href="/connexion"
                  className="text-xs text-ice-white/60 hover:text-aurora transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("auth.retourConnexion")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
