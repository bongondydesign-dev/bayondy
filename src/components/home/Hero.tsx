import React from "react";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { HeroPreview } from "@/components/home/HeroPreview";

export function Hero() {
  const trustPoints = [
    t("bento.badgeCreole"),
    t("bento.badgeMobile"),
    t("bento.badgePaiement"),
  ];

  return (
    <section className="relative w-full pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden bg-[#07080A]">
      {/* Lueur d'ambiance orange douce par dégradé radial */}
      <div
        className="absolute inset-x-0 top-0 h-[520px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 10%, rgba(255, 91, 34, 0.16) 0%, rgba(255, 91, 34, 0.05) 48%, transparent 78%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        {/* Bandeau d'annonce cliquable */}
        <Link
          href="/formations"
          className="animate-hero-1 inline-flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 min-h-[44px] sm:min-h-[40px] rounded-full bg-[#111216] border border-white/[0.08] hover:border-[var(--home-orange)]/45 transition-all duration-200 hover:-translate-y-0.5 mb-7 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)]"
        >
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--home-orange)] text-[#07080A] font-mono text-[11px] font-bold uppercase tracking-wider">
            {t("bento.badgeCreole")}
          </span>
          <span className="font-sans text-xs sm:text-sm text-ice-white/80 group-hover:text-ice-white transition-colors">
            {t("hero.badge")}
          </span>
          <span
            className="text-ice-white/60 text-xs group-hover:translate-x-0.5 group-hover:text-[var(--home-orange-light)] transition-all"
            aria-hidden="true"
          >
            ›
          </span>
        </Link>

        {/* Titre H1 unique */}
        <h1 className="animate-hero-2 font-display font-bold text-4xl sm:text-6xl lg:text-[4.4rem] tracking-tight text-ice-white max-w-4xl leading-[1.05] text-balance">
          <span className="block">{t("hero.titreLigne1")}</span>
          <span className="block">
            {t("hero.titreLigne2Prefix")}
            <span className="font-serif italic font-normal bg-gradient-to-r from-[var(--home-orange-light)] to-[var(--home-orange)] bg-clip-text text-transparent pr-1.5">
              {t("hero.titreLigne2Gradient")}
            </span>
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="animate-hero-2 mt-5 text-base sm:text-lg text-ice-white/70 max-w-xl leading-relaxed font-sans text-balance">
          {t("hero.sousTitre")}
        </p>

        {/* Boutons d'action pilules */}
        <div className="animate-hero-3 mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto justify-center">
          <Button
            href="/formations"
            variant="principal"
            accent="orange"
            className="w-full sm:w-auto pl-6 pr-2.5 py-2 justify-between sm:justify-center"
          >
            <span>{t("hero.cta")}</span>
            <span
              className="w-7 h-7 rounded-full bg-[#07080A] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </span>
          </Button>
          <Button
            href="#kijan"
            variant="secondaire"
            accent="orange"
            className="w-full sm:w-auto pl-6 pr-3 py-2 justify-between sm:justify-center"
          >
            <span>{t("hero.ctaSecondaire")}</span>
            <span
              className="w-6 h-6 rounded-full bg-white/[0.06] text-ice-white/80 inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </span>
          </Button>
        </div>

        {/* Ligne sobre de 3 points clés */}
        <div className="animate-hero-3 mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ice-white/65 font-sans">
          {trustPoints.map((point) => (
            <span key={point} className="inline-flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-[var(--home-orange)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M5 13l4 4L19 7" />
              </svg>
              <span>{point}</span>
            </span>
          ))}
        </div>

        {/* Aperçu interactif animé */}
        <HeroPreview />
      </div>
    </section>
  );
}

export default Hero;
