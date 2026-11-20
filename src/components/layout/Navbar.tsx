import Link from "next/link";
import React from "react";
import { t } from "@/lib/i18n";
import { AuthNav } from "@/components/auth/AuthNav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-obsidian/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Gauche : Logo BAYONDY (Sora 700) */}
        <Link
          href="/"
          className="font-display font-bold text-xl sm:text-2xl tracking-tight text-ice-white hover:text-aurora transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora rounded-lg py-1 select-none"
        >
          {t("accueil.titre")}
        </Link>

        {/* Centre : Liens de navigation Desktop */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label={t("nav.menu")}
        >
          <Link
            href="/formations"
            className="text-sm font-medium text-ice-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora rounded-md py-1 px-2 min-h-[44px] inline-flex items-center"
          >
            {t("nav.formations")}
          </Link>
          <Link
            href="#kijan"
            className="text-sm font-medium text-ice-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora rounded-md py-1 px-2 min-h-[44px] inline-flex items-center"
          >
            {t("nav.kijan")}
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-ice-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora rounded-md py-1 px-2 min-h-[44px] inline-flex items-center"
          >
            {t("nav.faq")}
          </Link>
        </nav>

        {/* Droite : État d'authentification Desktop (Composant Client sans layout shift) */}
        <AuthNav />

        {/* Menu Mobile sans JavaScript (<details> / <summary>) */}
        <details className="md:hidden relative group">
          <summary
            className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg border border-white/10 text-ice-white bg-deep-navy/80 cursor-pointer list-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora active:scale-95"
            aria-label={t("nav.menu")}
          >
            {/* Hamburger icon */}
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
            {/* Close icon */}
            <svg
              className="w-5 h-5 hidden group-open:block text-aurora"
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
          <div className="absolute right-0 top-14 w-64 rounded-2xl bg-deep-navy border border-white/10 p-4 shadow-2xl flex flex-col gap-2 z-50">
            <Link
              href="/formations"
              className="min-h-[44px] flex items-center px-3 rounded-lg text-ice-white hover:bg-white/5 transition-colors font-medium text-sm"
            >
              {t("nav.formations")}
            </Link>
            <Link
              href="#kijan"
              className="min-h-[44px] flex items-center px-3 rounded-lg text-ice-white hover:bg-white/5 transition-colors font-medium text-sm"
            >
              {t("nav.kijan")}
            </Link>
            <Link
              href="#faq"
              className="min-h-[44px] flex items-center px-3 rounded-lg text-ice-white hover:bg-white/5 transition-colors font-medium text-sm"
            >
              {t("nav.faq")}
            </Link>
            <div className="h-px bg-white/10 my-1" />
            {/* Authentification Mobile */}
            <AuthNav mobile />
          </div>
        </details>
      </div>
    </header>
  );
}

export default Navbar;
