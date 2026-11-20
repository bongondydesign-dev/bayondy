import Link from "next/link";
import React from "react";
import { t } from "@/lib/i18n";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-obsidian border-t border-white/5 relative overflow-hidden pt-16 pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Grille des colonnes de liens */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          {/* Colonne 1 : Marque et mission */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="font-display font-bold text-2xl tracking-tight text-ice-white hover:text-aurora transition-colors inline-block"
            >
              {t("accueil.titre")}
            </Link>
            <p className="mt-3 text-sm text-ice-white/70 max-w-sm font-sans leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Colonne 2 : Liens de navigation */}
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ice-white/50 mb-4">
              {t("footer.navigationTitre")}
            </p>
            <ul className="space-y-2.5 text-sm text-ice-white/80">
              <li>
                <Link
                  href="/formations"
                  className="hover:text-aurora transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.formations")}
                </Link>
              </li>
              <li>
                <Link
                  href="#kijan"
                  className="hover:text-aurora transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("nav.kijan")}
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="hover:text-aurora transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-ice-white/50 mb-4">
              {t("footer.legalTitre")}
            </p>
            <ul className="space-y-2.5 text-sm text-ice-white/80">
              <li>
                <Link
                  href="/conditions"
                  className="hover:text-aurora transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.conditions")}
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="hover:text-aurora transition-colors min-h-[44px] inline-flex items-center"
                >
                  {t("footer.liens.confidentialite")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de copyright */}
        <div className="pt-6 pb-2 text-center text-xs text-ice-white/40 font-mono">
          © {currentYear} {t("accueil.titre")}. {t("footer.droits")}
        </div>
      </div>

      {/* Mot BAYONDY GÉANT en bas de page, coupé proprement sans déborder */}
      <div
        className="w-full overflow-hidden select-none pointer-events-none flex justify-center items-end leading-none -mb-3 sm:-mb-6 md:-mb-10"
        aria-hidden="true"
      >
        <span className="font-display font-black text-6xl sm:text-9xl md:text-[13rem] lg:text-[16rem] tracking-tight text-deep-navy/40 opacity-70 uppercase whitespace-nowrap block select-none">
          {t("accueil.titre")}
        </span>
      </div>
    </footer>
  );
}

export default Footer;
