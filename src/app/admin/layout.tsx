"use client";

// Layout admin — protège toutes les pages /admin côté affichage.
// ⚠️ RAPPEL DE SÉCURITÉ : cette garde n'est qu'un confort d'affichage.
// La vraie sécurité est dans les routes API (requireAdmin vérifie le token Firebase
// ET le claim admin côté serveur, avec révocation). Un non-admin qui contourne
// cette page ne peut rien lire ni écrire via les routes API.

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";

function AccessDenied() {
  return (
    <div className="min-h-screen bg-obsidian text-ice-white flex flex-col items-center justify-center px-4 text-center">
      {/* noindex — espace admin non indexé */}
      <meta name="robots" content="noindex" />
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#0D0E11] border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          {t("admin.akseRefize")}
        </h1>
        <p className="font-sans text-ice-white/60 text-sm sm:text-base leading-relaxed">
          {t("admin.akseRefizeDescription")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-full bg-brand text-[#07080A] hover:bg-brand-light font-sans font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          {t("erreur404.retourAccueil")}
        </Link>
      </div>
    </div>
  );
}

function AdminNav() {
  return (
    <nav
      className="bg-[#0D0E11]/95 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-40"
      aria-label={t("admin.navigation")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/admin"
            className="font-display font-bold text-sm text-brand-light tracking-wide hover:text-white transition-colors px-2 py-1 rounded-lg min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            Admin
          </Link>
        </div>
        <div className="flex items-center gap-1 text-sm font-sans">
          <Link
            href="/admin"
            className="min-h-[44px] px-3 py-1 rounded-lg text-ice-white/70 hover:text-white hover:bg-white/5 transition-colors inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("admin.nav.tableau")}
          </Link>
          <Link
            href="/admin/formations"
            className="min-h-[44px] px-3 py-1 rounded-lg text-ice-white/70 hover:text-white hover:bg-white/5 transition-colors inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("admin.nav.formations")}
          </Link>
          <Link
            href="/admin/eleves"
            className="min-h-[44px] px-3 py-1 rounded-lg text-ice-white/70 hover:text-white hover:bg-white/5 transition-colors inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("admin.nav.eleves")}
          </Link>
          <Link
            href="/admin/paiements"
            className="min-h-[44px] px-3 py-1 rounded-lg text-ice-white/70 hover:text-white hover:bg-white/5 transition-colors inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("admin.nav.paiements")}
          </Link>
        </div>
        <Link
          href="/"
          className="shrink-0 text-xs text-ice-white/55 hover:text-white transition-colors min-h-[44px] inline-flex items-center px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg"
        >
          ← {t("erreur404.retourAccueil")}
        </Link>
      </div>
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  // Pendant le chargement auth, afficher un spinner neutre
  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Non connecté → accès refusé (useRequireAuth redirige, mais le layout
  // affiche aussi le message si jamais l'utilisateur arrive ici directement)
  if (!user || !isAdmin) {
    // ⚠️ Aucun appel /api/admin n'est lancé à ce stade
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-obsidian text-ice-white">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
