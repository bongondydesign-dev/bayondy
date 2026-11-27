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

  if (loading) {
    if (mobile) {
      return (
        <div className="flex flex-col gap-2 animate-pulse" aria-hidden="true">
          <div className="h-11 rounded-full bg-slate-200 dark:bg-white/5 w-full" />
          <div className="h-11 rounded-full bg-slate-200/80 dark:bg-white/10 w-full" />
        </div>
      );
    }
    return (
      <div
        className="hidden md:flex items-center gap-3 animate-pulse shrink-0"
        aria-hidden="true"
      >
        <div className="h-10 w-20 rounded-full bg-slate-200 dark:bg-white/5" />
        <div className="h-10 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>
    );
  }

  if (user) {
    if (mobile) {
      return (
        <div className="flex flex-col gap-2">
          {isAdmin && (
            <div className="px-3 py-1 rounded-md bg-[var(--home-orange)]/15 border border-[var(--home-orange)]/35 text-[var(--home-orange-light)] font-mono text-[11px] font-semibold uppercase tracking-wider text-center">
              Wòl : Admin
            </div>
          )}
          <Link
            href="/mes-formations"
            className="min-h-[44px] flex items-center px-3 rounded-lg text-ice-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors font-medium text-sm"
          >
            {t("nav.mesFormations")}
          </Link>
          <Link
            href="/profil"
            className="min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-ice-white hover:border-[var(--home-orange)]/50 transition-colors font-medium text-sm"
          >
            {t("nav.profil")}
          </Link>
        </div>
      );
    }

    return (
      <div className="hidden md:flex items-center gap-3 shrink-0">
        {isAdmin && (
          <span className="px-2.5 py-1 rounded-full bg-[var(--home-orange)]/15 border border-[var(--home-orange)]/35 text-[var(--home-orange-light)] font-mono text-xs font-semibold uppercase tracking-wider">
            Admin
          </span>
        )}
        <Link
          href="/mes-formations"
          className="text-sm font-medium text-ice-white/75 hover:text-ice-white px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] transition-colors whitespace-nowrap shrink-0"
        >
          {t("nav.mesFormations")}
        </Link>
        <Button href="/profil" variant="secondaire" accent="orange">
          {t("nav.profil")}
        </Button>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="flex flex-col gap-2">
        <Link
          href="/connexion"
          className="min-h-[44px] flex items-center justify-center px-3 rounded-full border border-[var(--border-strong)] text-ice-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors font-medium text-sm"
        >
          {t("nav.connexion")}
        </Link>
        <Button
          href="/inscription"
          variant="principal"
          accent="orange"
          className="w-full justify-between"
        >
          <span>{t("nav.inscription")}</span>
          <span
            className="w-6 h-6 rounded-full bg-[var(--home-orange-fg)] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12h14m-6-6l6 6-6 6" />
            </svg>
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3 shrink-0">
      <Link
        href="/connexion"
        className="text-sm font-medium text-ice-white/75 hover:text-ice-white px-3 py-2 min-h-[44px] inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] transition-colors whitespace-nowrap shrink-0"
      >
        {t("nav.connexion")}
      </Link>
      <Button
        href="/inscription"
        variant="principal"
        accent="orange"
        className="pl-4 pr-2 py-1.5"
      >
        <span>{t("nav.inscription")}</span>
        <span
          className="w-6 h-6 rounded-full bg-[var(--home-orange-fg)] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12h14m-6-6l6 6-6 6" />
          </svg>
        </span>
      </Button>
    </div>
  );
}

export default AuthNav;
