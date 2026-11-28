import Link from "next/link";
import React from "react";
import { t } from "@/lib/i18n";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-[var(--surface-band)] relative overflow-hidden pt-16 pb-0 transition-colors duration-200">
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Grille des colonnes de liens */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[var(--border-subtle)]">
          {/* Colonne 1 : Marque et mission */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display font-bold text-xl tracking-tight text-ice-white hover:text-[var(--home-orange-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-lg py-1"
            >
              <span
                className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#FF652E] to-[var(--home-orange)] text-[var(--home-orange-fg)] inline-flex items-center justify-center font-display font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_12px_-3px_var(--home-orange-glow)] shrink-0"
                aria-hidden="true"
              >
                B
              </span>
              <span>{t("accueil.titre")}</span>
            </Link>
            <p className="mt-4 text-sm text-slate-700 dark:text-ice-white/70 max-w-sm font-sans leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Colonne 2 : Liens de navigation */}
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-ice-white/60 mb-4">
              {t("footer.navigationTitre")}
            </p>
            <ul className="space-y-1 text-sm text-slate-800 dark:text-ice-white/80 font-medium">
              <li>
                <Link
                  href="/formations"
                  className="hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.formations")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#kijan"
                  className="hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("nav.kijan")}
                </Link>
              </li>
              <li>
                <Link
                  href="/a-propos"
                  className="hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.apropos")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-ice-white/60 mb-4">
              {t("footer.legalTitre")}
            </p>
            <ul className="space-y-1 text-sm text-slate-800 dark:text-ice-white/80 font-medium">
              <li>
                <Link
                  href="/conditions"
                  className="hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.conditions")}
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.confidentialite")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de copyright */}
        <div className="pt-6 pb-4 text-center text-xs text-slate-600 dark:text-ice-white/60 font-mono">
          © {currentYear} {t("seo.nom")}. {t("footer.droits")}
        </div>
      </div>

      {/* Mot BAYONDY GÉANT coupé proprement en bas de page */}
      <div
        className="w-full overflow-hidden select-none pointer-events-none flex justify-center items-end leading-none -mb-3 sm:-mb-6 md:-mb-10"
        aria-hidden="true"
      >
        <span className="font-display font-black text-6xl sm:text-9xl md:text-[13rem] lg:text-[16rem] tracking-tight text-slate-900/[0.06] dark:text-white/[0.04] uppercase whitespace-nowrap block select-none">
          {t("accueil.titre")}
        </span>
      </div>
    </footer>
  );
}

export default Footer;
