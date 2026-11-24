import React from "react";
import { t } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";

export function Affirmation() {
  return (
    <section className="w-full py-24 sm:py-36 relative overflow-hidden bg-[#07080A] border-t border-white/[0.06]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(255, 91, 34, 0.08) 0%, transparent 72%)",
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
