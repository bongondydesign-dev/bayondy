import React from "react";
import { ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="w-full py-24 sm:py-36 relative overflow-hidden bg-[var(--surface-band)] text-center transition-colors duration-200">
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
      {/* Fond de vagues topographiques orange avec fondu radial aux bords */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-20 dark:opacity-35 [mask-image:radial-gradient(ellipse_78%_75%_at_50%_50%,#000_28%,transparent_100%)]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="wave-gradient-orange"
              x1="0"
              y1="0"
              x2="1440"
              y2="600"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="var(--home-orange-dark, #BA3408)" />
              <stop offset="50%" stopColor="var(--home-orange, #E54813)" />
              <stop offset="100%" stopColor="var(--home-orange-light, #FF885C)" />
            </linearGradient>
          </defs>
          {[220, 255, 290, 325, 360, 395, 430, 465].map((yOffset) => (
            <path
              key={yOffset}
              d={`M-100 ${yOffset} C 280 ${yOffset - 85}, 620 ${yOffset + 90}, 920 ${yOffset - 15} C 1200 ${yOffset - 105}, 1420 ${yOffset + 55}, 1600 ${yOffset - 10}`}
              stroke="url(#wave-gradient-orange)"
              strokeWidth="1.25"
            />
          ))}
        </svg>
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-55"
        style={{
          background:
            "radial-gradient(ellipse 50% 55% at 50% 50%, var(--home-orange-glow-soft) 0%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-5">
          {t("final.badge")}
        </p>

        <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-ice-white tracking-tight max-w-2xl leading-[1.06] text-balance">
          {t("final.titre")}
        </h2>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-ice-white/70 max-w-lg leading-relaxed font-sans">
          {t("final.sousTitre")}
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto justify-center">
          <Button
            href="/inscription"
            variant="principal"
            accent="orange"
            className="w-full sm:w-auto pl-6 pr-2.5 py-2 justify-between sm:justify-center"
          >
            <span>{t("final.cta")}</span>
            <span
              className="w-7 h-7 rounded-full bg-[var(--home-orange-fg)] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
            </span>
          </Button>
          <Button
            href="/formations"
            variant="secondaire"
            accent="orange"
            className="w-full sm:w-auto pl-6 pr-3 py-2 justify-between sm:justify-center"
          >
            <span>{t("hero.cta")}</span>
            <span
              className="w-6 h-6 rounded-full bg-slate-900/[0.06] dark:bg-white/[0.06] text-slate-700 dark:text-ice-white/80 inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
            </span>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

export default FinalCta;
