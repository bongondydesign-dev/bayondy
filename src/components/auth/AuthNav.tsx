"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n";

interface AuthNavProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AuthNav({ mobile = false, onNavigate }: AuthNavProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    if (mobile) {
      return (
        <div className="flex flex-col gap-2.5 animate-pulse" aria-hidden="true">
          <div className="h-11 rounded-full bg-slate-200 dark:bg-white/5 w-full" />
          <div className="h-11 rounded-full bg-slate-200/80 dark:bg-white/10 w-full" />
        </div>
      );
    }
    return (
      <div
        className="hidden lg:flex items-center gap-3 animate-pulse shrink-0"
        aria-hidden="true"
      >
        <div className="h-9 w-16 rounded-lg bg-slate-200 dark:bg-white/5" />
        <div className="h-10 w-32 rounded-full bg-slate-200/80 dark:bg-white/10" />
      </div>
    );
  }

  const primaryBtnClasses =
    "group inline-flex items-center justify-center gap-2 h-10 px-4.5 rounded-full bg-gradient-to-b from-[#FF652E] to-[var(--home-orange)] hover:brightness-105 text-[var(--home-orange-fg)] font-semibold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_6px_18px_-5px_var(--home-orange-glow)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] whitespace-nowrap shrink-0";

  if (user) {
    if (mobile) {
      return (
        <div className="flex flex-col gap-2 pt-1">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onNavigate}
              className="min-h-[44px] flex items-center justify-between px-3 rounded-xl text-[var(--home-orange-light)] hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04] transition-colors font-mono text-xs uppercase tracking-wider font-semibold"
            >
              <span>Admin</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
            </Link>
          )}
          <Link
            href="/profil"
            onClick={onNavigate}
            className="min-h-[44px] flex items-center justify-between px-3 rounded-xl text-ice-white hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04] transition-colors font-medium text-sm"
          >
            <span>{t("nav.profil")}</span>
            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-ice-white/45" aria-hidden="true" />
          </Link>
          <Link
            href="/mes-formations"
            onClick={onNavigate}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-b from-[#FF652E] to-[var(--home-orange)] text-[var(--home-orange-fg)] transition-colors font-semibold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_6px_18px_-5px_var(--home-orange-glow)]"
          >
            <span>{t("mesFormations.navTableau")}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>
      );
    }

    return (
      <div className="hidden lg:flex items-center gap-4 shrink-0">
        {isAdmin && (
          <>
            <Link
              href="/admin"
              className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--home-orange-light)] hover:underline whitespace-nowrap shrink-0"
            >
              Admin
            </Link>
            <span className="text-[var(--border-strong)]" aria-hidden="true">
              ·
            </span>
          </>
        )}
        <Link
          href="/profil"
          className="text-sm font-medium text-slate-600 dark:text-ice-white/75 hover:text-ice-white py-2 px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md whitespace-nowrap shrink-0"
        >
          {t("nav.profil")}
        </Link>
        <Link href="/mes-formations" className={primaryBtnClasses}>
          <span>{t("mesFormations.navTableau")}</span>
          <ArrowRight
            className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
            strokeWidth={2.3}
            aria-hidden="true"
          />
        </Link>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="flex flex-col gap-2.5 pt-2">
        <Link
          href="/connexion"
          onClick={onNavigate}
          className="min-h-[44px] flex items-center justify-center px-4 rounded-full border border-[var(--border-strong)] bg-[var(--surface-glass)] text-ice-white hover:bg-[var(--surface-subtle)] transition-colors font-medium text-sm"
        >
          {t("nav.connexion")}
        </Link>
        <Link
          href="/inscription"
          onClick={onNavigate}
          className="group min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-b from-[#FF652E] to-[var(--home-orange)] text-[var(--home-orange-fg)] font-semibold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_6px_18px_-5px_var(--home-orange-glow)] transition-all duration-200"
        >
          <span>{t("nav.inscription")}</span>
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-4 shrink-0">
      <Link
        href="/connexion"
        className="text-sm font-medium text-slate-600 dark:text-ice-white/75 hover:text-ice-white py-2 px-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md whitespace-nowrap shrink-0"
      >
        {t("nav.connexion")}
      </Link>
      <Link href="/inscription" className={primaryBtnClasses}>
        <span>{t("nav.inscription")}</span>
        <ArrowRight
          className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
          strokeWidth={2.3}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

export default AuthNav;
