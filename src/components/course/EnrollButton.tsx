"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";

interface EnrollButtonProps {
  className?: string;
}

export function EnrollButton({ className = "" }: EnrollButtonProps) {
  const { user, loading } = useAuth();

  // État de chargement initial de l'authentification
  if (loading) {
    return (
      <div
        className={`w-full h-12 rounded-2xl bg-white/5 animate-pulse border border-white/10 ${className}`}
        aria-hidden="true"
      />
    );
  }

  // Utilisateur connecté : bouton désactivé (paiement pas encore actif à cette étape)
  if (user) {
    return (
      <button
        type="button"
        disabled
        className={`w-full min-h-[48px] px-6 py-3.5 rounded-2xl bg-deep-navy/80 border border-white/10 text-ice-white/50 font-sans font-medium text-sm sm:text-base flex items-center justify-center gap-2 cursor-not-allowed select-none ${className}`}
        aria-disabled="true"
      >
        <svg
          className="w-4 h-4 text-ice-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{t("catalogue.peyemanBientot")}</span>
      </button>
    );
  }

  // Visiteur déconnecté : lien d'invitation vers la page de connexion
  return (
    <Link
      href="/connexion"
      className={`w-full min-h-[48px] px-6 py-3.5 rounded-2xl bg-ion-blue hover:bg-ion-blue/90 text-white font-sans font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-ion-blue/25 transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
      <span>{t("catalogue.boutonInscrireConnexion")}</span>
    </Link>
  );
}
