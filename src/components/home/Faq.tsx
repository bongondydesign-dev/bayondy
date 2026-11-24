import React from "react";
import { t } from "@/lib/i18n";
import { FaqList } from "@/components/faq/FaqList";

export function Faq() {
  return (
    <section
      id="faq"
      className="w-full py-20 sm:py-32 border-t border-white/5 scroll-mt-20 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Titre à gauche et questions à droite sur grand écran */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Colonne gauche (Titre) */}
          <div className="lg:col-span-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deep-navy border border-white/10 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-aurora" />
              <span className="font-mono text-xs uppercase tracking-wider text-aurora">
                {t("nav.faq")}
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight leading-tight">
              {t("faq.titreSection")}
            </h2>
            <p className="mt-4 text-base text-ice-white/70 font-sans leading-relaxed">
              {t("faq.sousTitreSection")}
            </p>
          </div>

          {/* Colonne droite (Questions partagées via FaqList) */}
          <div className="lg:col-span-8">
            <FaqList />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Faq;
