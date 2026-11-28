import Link from "next/link";
import React from "react";
import { t } from "@/lib/i18n";
import { AuthNav } from "@/components/auth/AuthNav";
import { NavLinks } from "@/components/layout/NavLinks";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--surface-nav)] backdrop-blur-xl border-b border-[var(--border-subtle)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1 : Marque */}
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

        {/* Zone 2 : Navigation principale typographique */}
        <NavLinks />

        {/* Zone 3 : Thème + Séparateur fin + Action / Menu mobile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <ThemeToggle variant="ghost" />
          <span
            className="hidden md:block w-px h-5 bg-[var(--border-subtle)]"
            aria-hidden="true"
          />
          <AuthNav />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
