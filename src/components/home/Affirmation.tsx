import React from "react";
import { t } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";

export function Affirmation() {
  return (
    <section className="w-full py-24 sm:py-36 relative overflow-hidden bg-[var(--surface-band)] backdrop-blur-[2px] transition-colors duration-200">
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none opacity-80 dark:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 58% 65% at 50% 50%, var(--home-orange-glow-soft) 0%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-7">
          {t("affirmation.badge")}
        </p>

        <p className="font-display font-bold text-2xl sm:text-4xl lg:text-[2.85rem] leading-[1.2] tracking-tight text-balance">
          <span className="text-ice-white/60">{t("affirmation.texte")} </span>
          <span className="text-ice-white">{t("affirmation.sousTexte")}</span>
        </p>
      </Reveal>
    </section>
  );
}

export default Affirmation;
