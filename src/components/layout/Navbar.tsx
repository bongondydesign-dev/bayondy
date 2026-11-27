import Link from "next/link";
import React from "react";
import { t } from "@/lib/i18n";
import { AuthNav } from "@/components/auth/AuthNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--surface-nav)] backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Gauche : Icône orange + Logo BAYONDY */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg sm:text-xl tracking-tight text-ice-white hover:text-[var(--home-orange-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-lg py-1 select-none whitespace-nowrap shrink-0"
        >
          <span
            className="w-7 h-7 rounded-lg bg-[var(--home-orange)] text-[var(--home-orange-fg)] inline-flex items-center justify-center font-display font-bold text-sm shadow-sm shadow-[var(--home-orange-glow)] shrink-0"
            aria-hidden="true"
          >
            B
          </span>
          <span>{t("accueil.titre")}</span>
        </Link>

        {/* Centre : Liens de navigation Desktop */}
        <nav
          className="hidden md:flex items-center gap-7"
          aria-label={t("nav.menu")}
        >
          <Link
            href="/formations"
            className="text-sm font-medium text-ice-white/75 hover:text-ice-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md py-1 px-2 min-h-[44px] inline-flex items-center whitespace-nowrap shrink-0"
          >
            {t("nav.formations")}
          </Link>
          <Link
            href="/#kijan"
            className="text-sm font-medium text-ice-white/75 hover:text-ice-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md py-1 px-2 min-h-[44px] inline-flex items-center whitespace-nowrap shrink-0"
          >
            {t("nav.kijan")}
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-ice-white/75 hover:text-ice-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md py-1 px-2 min-h-[44px] inline-flex items-center whitespace-nowrap shrink-0"
          >
            {t("nav.faq")}
          </Link>
        </nav>

        {/* Droite : Sélecteur de thème + Auth Desktop + Menu Mobile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <AuthNav />

          {/* Menu Mobile sans JavaScript (<details> / <summary>) */}
          <details className="md:hidden relative group">
            <summary
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg border border-[var(--border-strong)] text-ice-white bg-[var(--surface-subtle)] cursor-pointer list-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] active:scale-95"
              aria-label={t("nav.menu")}
            >
              <svg
                className="w-5 h-5 group-open:hidden"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className="w-5 h-5 hidden group-open:block text-[var(--home-orange-light)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </summary>

            {/* Tiroir déroulant Mobile */}
            <div className="absolute right-0 top-14 w-64 rounded-2xl bg-deep-navy border border-[var(--border-strong)] p-4 shadow-2xl flex flex-col gap-2 z-50">
              <Link
                href="/formations"
                className="min-h-[44px] flex items-center px-3 rounded-lg text-ice-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors font-medium text-sm"
              >
                {t("nav.formations")}
              </Link>
              <Link
                href="/#kijan"
                className="min-h-[44px] flex items-center px-3 rounded-lg text-ice-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors font-medium text-sm"
              >
                {t("nav.kijan")}
              </Link>
              <Link
                href="/#faq"
                className="min-h-[44px] flex items-center px-3 rounded-lg text-ice-white hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors font-medium text-sm"
              >
                {t("nav.faq")}
              </Link>
              <div className="h-px bg-[var(--border-subtle)] my-1" />
              <AuthNav mobile />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
