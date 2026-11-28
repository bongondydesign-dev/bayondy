import React from "react";
import { ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { FaqList } from "@/components/faq/FaqList";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Faq() {
  return (
    <section
      id="faq"
      className="w-full py-24 sm:py-32 bg-transparent scroll-mt-20 relative transition-colors duration-200"
    >
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Colonne gauche */}
            <div className="lg:col-span-4 text-left">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
                {t("nav.faq")}
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight leading-[1.08] text-balance">
                {t("faq.titreSection")}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed mb-6">
                {t("faq.sousTitreSection")}
              </p>
              <Button
                href="/faq"
                variant="secondaire"
                accent="orange"
                className="pl-5 pr-2.5 py-2"
              >
                <span>{t("nav.faq")}</span>
                <span
                  className="w-6 h-6 rounded-full bg-slate-900/[0.06] dark:bg-white/[0.06] text-slate-700 dark:text-ice-white/80 inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                  aria-hidden="true"
                >
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
                </span>
              </Button>
            </div>

            {/* Colonne droite : cartes FAQ empilées */}
            <div className="lg:col-span-8">
              <FaqList accent="orange" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Faq;
