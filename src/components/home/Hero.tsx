import React from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
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
    <section className="relative w-full pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden bg-transparent transition-colors duration-200">
      {/* Lueur d'ambiance orange douce par dégradé radial */}
      <div
        className="absolute inset-x-0 top-0 h-[520px] pointer-events-none opacity-55 dark:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 62% 52% at 50% 6%, var(--home-orange-glow) 0%, var(--home-orange-glow-soft) 45%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        {/* Bandeau d'annonce cliquable */}
        <Link
          href="/formations"
          className="animate-hero-1 inline-flex items-center gap-2.5 pl-3 pr-3.5 py-1.5 min-h-[40px] rounded-full bg-deep-navy border border-[var(--border-strong)]/85 hover:border-[var(--home-orange)]/55 shadow-[0_1px_3px_rgba(15,23,42,0.05)] dark:shadow-none transition-all duration-200 hover:-translate-y-0.5 mb-7 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)]"
        >
          <span
            className="w-2 h-2 rounded-full bg-[var(--home-orange)] shrink-0"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--home-orange-light)]">
            {t("accueil.titre")}
          </span>
          <span className="h-3.5 w-px bg-[var(--border-subtle)]" aria-hidden="true" />
          <span className="font-sans text-xs sm:text-sm font-medium text-slate-700 dark:text-ice-white/85 group-hover:text-ice-white transition-colors">
            {t("hero.badge")}
          </span>
          <ChevronRight
            className="w-3.5 h-3.5 text-slate-400 dark:text-ice-white/60 group-hover:translate-x-0.5 group-hover:text-[var(--home-orange-light)] transition-all"
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </Link>

        {/* Titre H1 unique */}
        <h1 className="animate-hero-2 font-display font-bold text-4xl sm:text-6xl lg:text-[4.5rem] tracking-[-0.03em] text-ice-white max-w-4xl leading-[1.04] text-balance">
          <span className="block">{t("hero.titreLigne1")}</span>
          <span className="block">
            {t("hero.titreLigne2Prefix")}
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#E54813] to-[#BA3408] dark:from-[#FF885C] dark:to-[#FF5B22] bg-clip-text text-transparent pr-1.5">
              {t("hero.titreLigne2Gradient")}
            </span>
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="animate-hero-2 mt-5 text-base sm:text-lg text-slate-600 dark:text-ice-white/75 max-w-xl leading-relaxed font-sans text-balance">
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
              className="w-7 h-7 rounded-full bg-[var(--home-orange-fg)] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
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
              className="w-6 h-6 rounded-full bg-slate-900/[0.06] dark:bg-white/[0.07] text-slate-700 dark:text-ice-white/80 inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
            </span>
          </Button>
        </div>

        {/* Ligne sobre de 3 points clés */}
        <div className="animate-hero-3 mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-[13px] text-slate-600 dark:text-ice-white/70 font-sans font-medium">
          {trustPoints.map((point) => (
            <span key={point} className="inline-flex items-center gap-1.5">
              <Check
                className="w-3.5 h-3.5 text-[var(--home-orange)] shrink-0"
                strokeWidth={2.5}
                aria-hidden="true"
              />
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
