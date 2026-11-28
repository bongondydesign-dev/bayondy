"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white overflow-x-clip">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="animate-hero-1 w-full max-w-md mx-auto rounded-2xl surface-glass border border-[var(--border-subtle)] p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white tracking-tight">
              {t("auth.titreMotDePasseOublie")}
            </h1>
            <p className="mt-2 text-sm text-slate-700 dark:text-ice-white/70 font-sans">
              {t("auth.sousTitreMotDePasseOublie")}
            </p>
          </div>

          {submitted ? (
            <div
              role="status"
              className="p-5 rounded-xl bg-brand/10 border border-brand/30 text-ice-white text-sm space-y-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="w-5 h-5 shrink-0 text-brand-light mt-0.5"
                  aria-hidden="true"
                />
                <p className="font-sans leading-relaxed">
                  {t("auth.succesReinitialisation")}
                </p>
              </div>
              <div className="pt-2 text-center">
                <Link
                  href="/connexion"
                  className="text-brand-light font-medium hover:underline text-sm min-h-[44px] inline-flex items-center"
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
                  className="block text-xs font-mono font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/70 mb-2"
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
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#090B10] border border-[var(--border-strong)] shadow-2xs dark:shadow-none text-ice-white text-sm placeholder:text-slate-500 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[46px] px-6 py-3 rounded-full bg-gradient-to-b from-[#FF652E] to-brand text-[var(--brand-fg)] font-semibold text-sm sm:text-base hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_22px_-6px_var(--brand-glow)] cursor-pointer"
              >
                {submitting
                  ? t("auth.chargement")
                  : t("auth.boutonReinitialiser")}
              </button>

              <div className="pt-4 text-center">
                <Link
                  href="/connexion"
                  className="text-xs font-medium text-slate-700 dark:text-ice-white/60 hover:text-brand-light transition-colors min-h-[44px] inline-flex items-center"
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
