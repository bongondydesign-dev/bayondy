"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { t } from "@/lib/i18n";

export default function ProfilPage() {
  const { user, loading } = useRequireAuth();
  const { signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      setSigningOut(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-deep-navy border border-white/10" />
            <p className="font-mono text-xs uppercase tracking-wider text-ice-white/60">
              {t("profil.chargement")}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center">
        <div className="w-full max-w-2xl rounded-2xl bg-deep-navy border border-white/[0.08] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Lueur d'ambiance */}
          <div
            className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none -z-0"
            aria-hidden="true"
          />

          {/* En-tête du profil */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08] relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display font-bold text-2xl sm:text-4xl text-ice-white tracking-tight">
                  {t("profil.titre")}
                </h1>
                {isAdmin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-brand/15 border border-brand/40 text-brand-light font-mono text-xs font-semibold uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ice-white/70 font-sans">
                {t("profil.sousTitre")}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-obsidian border border-brand/35 flex items-center justify-center font-display font-bold text-xl text-brand-light shadow-inner">
              {(user.displayName || user.email || "B").charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Détails du compte */}
          <div className="py-8 space-y-6 relative z-10">
            {/* Nom */}
            <div className="p-4 rounded-2xl bg-obsidian/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-ice-white/60">
                {t("profil.nom")}
              </span>
              <span className="font-sans font-medium text-base text-ice-white">
                {user.displayName || t("profil.nonDefini")}
              </span>
            </div>

            {/* E-mail */}
            <div className="p-4 rounded-2xl bg-obsidian/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-ice-white/60">
                {t("profil.email")}
              </span>
              <span className="font-sans font-medium text-base text-ice-white truncate">
                {user.email || t("profil.nonDefini")}
              </span>
            </div>

            {/* Accès aux formations */}
            <div className="pt-2">
              <Link
                href="/mes-formations"
                className="w-full min-h-[44px] px-6 py-3 rounded-full bg-brand hover:bg-brand-light text-[#07080A] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{t("profil.mesFormations")}</span>
              </Link>
            </div>
          </div>

          {/* Déconnexion */}
          <div className="pt-6 border-t border-white/10 flex justify-end relative z-10">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="min-h-[44px] px-6 py-2.5 rounded-xl border border-red-500/40 text-red-300 hover:bg-red-500/10 active:scale-[0.98] transition-all text-sm font-medium disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              {signingOut ? t("auth.chargement") : t("profil.boutonDeconnexion")}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
