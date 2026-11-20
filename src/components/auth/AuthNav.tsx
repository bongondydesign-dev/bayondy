"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { t } from "@/lib/i18n";

interface AuthNavProps {
  mobile?: boolean;
}

export function AuthNav({ mobile = false }: AuthNavProps) {
  const { user, loading, isAdmin } = useAuth();

  // Pendant le chargement : réserve la place pour éviter un saut de mise en page (CLS)
  if (loading) {
    if (mobile) {
      return (
        <div className="flex flex-col gap-2 animate-pulse" aria-hidden="true">
          <div className="h-11 rounded-lg bg-white/5 w-full" />
          <div className="h-11 rounded-lg bg-white/10 w-full" />
        </div>
      );
    }
    return (
      <div
        className="hidden md:flex items-center gap-3 animate-pulse"
        aria-hidden="true"
      >
        <div className="h-10 w-20 rounded-lg bg-white/5" />
        <div className="h-10 w-28 rounded-lg bg-white/10" />
      </div>
    );
  }

  // Utilisateur connecté : « Fòmasyon mwen yo » et lien vers « /profil »
  if (user) {
    if (mobile) {
      return (
        <div className="flex flex-col gap-2">
          {isAdmin && (
            <div className="px-3 py-1 rounded-md bg-aurora/10 border border-aurora/30 text-aurora font-mono text-[11px] font-semibold uppercase tracking-wider text-center">
              Wòl : Admin
            </div>
          )}
          <Link
            href="/mes-formations"
            className="min-h-[44px] flex items-center px-3 rounded-lg text-ice-white hover:bg-white/5 transition-colors font-medium text-sm"
          >
            {t("nav.mesFormations")}
          </Link>
          <Link
            href="/profil"
            className="min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-lg bg-deep-navy border border-aurora/40 text-aurora hover:bg-aurora/10 transition-colors font-medium text-sm"
          >
            {t("nav.profil")}
          </Link>
        </div>
      );
    }

    return (
      <div className="hidden md:flex items-center gap-4">
        {isAdmin && (
          <span className="px-2.5 py-1 rounded-full bg-aurora/15 border border-aurora/40 text-aurora font-mono text-xs font-semibold uppercase tracking-wider">
            Admin
          </span>
        )}
        <Link
          href="/mes-formations"
          className="text-sm font-medium text-ice-white/80 hover:text-white px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora transition-colors"
        >
          {t("nav.mesFormations")}
        </Link>
        <Button href="/profil" variant="secondaire">
          {t("nav.profil")}
        </Button>
      </div>
    );
  }

  // Utilisateur déconnecté : « Konekte » et « Kreye kont »
  if (mobile) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href="/connexion"
          className="min-h-[44px] flex items-center justify-center px-3 rounded-lg border border-white/15 text-ice-white hover:bg-white/5 transition-colors font-medium text-sm"
        >
          {t("nav.connexion")}
        </Link>
        <Button
          href="/inscription"
          variant="principal"
          className="w-full text-center"
        >
          {t("nav.inscription")}
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link
        href="/connexion"
        className="text-sm font-medium text-ice-white/80 hover:text-white px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora transition-colors"
      >
        {t("nav.connexion")}
      </Link>
      <Button href="/inscription" variant="principal">
        {t("nav.inscription")}
      </Button>
    </div>
  );
}

export default AuthNav;
