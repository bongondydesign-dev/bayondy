import React from "react";
import { t } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";

export function Affirmation() {
  return (
    <section className="w-full py-24 sm:py-32 relative overflow-hidden bg-[var(--surface-band)] transition-colors duration-200">
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-55 dark:opacity-45"
        aria-hidden="true"
      >
        <div className="w-[620px] h-[620px] rounded-full border border-[var(--border-subtle)]" />
      </div>

      <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-6">
          {t("affirmation.badge")}
        </p>

        <blockquote className="font-display font-bold text-2xl sm:text-4xl lg:text-[2.75rem] leading-[1.22] tracking-tight text-balance">
          <span className="text-slate-700 dark:text-zinc-400 block">
            {t("affirmation.texte")}
          </span>
          <span className="text-ice-white block mt-3">
            {t("affirmation.sousTexte")}
          </span>
        </blockquote>
      </Reveal>
    </section>
  );
}

export default Affirmation;
