import React from "react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="w-full py-24 sm:py-36 border-t border-white/[0.06] relative overflow-hidden bg-[#07080A] text-center">
      {/* Fond de vagues topographiques orange animées doucement */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-45"
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
              <stop offset="0%" stopColor="var(--home-orange-dark, #C93E0E)" />
              <stop offset="50%" stopColor="var(--home-orange, #FF5B22)" />
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
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 55% at 50% 50%, rgba(255, 91, 34, 0.14) 0%, transparent 72%)",
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

        <p className="mt-5 text-base sm:text-lg text-ice-white/70 max-w-lg leading-relaxed font-sans">
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
              className="w-7 h-7 rounded-full bg-[#07080A] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
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
              className="w-6 h-6 rounded-full bg-white/[0.06] text-ice-white/80 inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 12h14m-6-6l6 6-6 6" />
              </svg>
            </span>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

export default FinalCta;
