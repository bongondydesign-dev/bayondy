import React from "react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section className="w-full py-24 sm:py-36 border-t border-white/5 relative overflow-hidden bg-obsidian text-center">
      {/* Fond de lignes ondulées en SVG inline léger (dégradé bleu/turquoise à faible opacité) */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-25 -z-0"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <defs>
            <linearGradient
              id="wave-gradient"
              x1="0"
              y1="0"
              x2="1440"
              y2="600"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#2864FF" />
              <stop offset="50%" stopColor="#2D8DFF" />
              <stop offset="100%" stopColor="#37D6D0" />
            </linearGradient>
          </defs>
          <path
            d="M-100 200 C 300 120, 600 280, 900 180 C 1200 80, 1400 240, 1600 180"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
          />
          <path
            d="M-100 240 C 300 160, 600 320, 900 220 C 1200 120, 1400 280, 1600 220"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
          />
          <path
            d="M-100 280 C 300 200, 600 360, 900 260 C 1200 160, 1400 320, 1600 260"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
          />
          <path
            d="M-100 320 C 300 240, 600 400, 900 300 C 1200 200, 1400 360, 1600 300"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
          />
          <path
            d="M-100 360 C 300 280, 600 440, 900 340 C 1200 240, 1400 400, 1600 340"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
          />
          <path
            d="M-100 400 C 300 320, 600 480, 900 380 C 1200 280, 1400 440, 1600 380"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
          />
          <path
            d="M-100 440 C 300 360, 600 520, 900 420 C 1200 320, 1400 480, 1600 420"
            stroke="url(#wave-gradient)"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Lueur centrale */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ion-blue/20 rounded-full blur-[100px] pointer-events-none -z-0"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deep-navy border border-white/10 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora" />
          <span className="font-mono text-xs uppercase tracking-wider text-aurora">
            {t("final.badge")}
          </span>
        </div>

        {/* Gros titre */}
        <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-ice-white tracking-tight max-w-2xl leading-tight">
          {t("final.titre")}
        </h2>

        {/* Sous-titre */}
        <p className="mt-5 text-base sm:text-lg md:text-xl text-ice-white/75 max-w-lg leading-relaxed font-sans">
          {t("final.sousTitre")}
        </p>

        {/* Bouton vers /inscription */}
        <div className="mt-8 sm:mt-10">
          <Button href="/inscription" variant="principal">
            {t("final.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;
