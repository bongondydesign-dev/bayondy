import React from "react";
import { t } from "@/lib/i18n";

export function Pricing() {
  const methods = t("tarifs.moyens")
    .split(",")
    .map((m) => m.trim());

  return (
    <section className="w-full py-20 sm:py-32 border-t border-white/5 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Titre de section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight">
            {t("tarifs.titreSection")}
          </h2>
        </div>

        {/* Une seule grande carte */}
        <div className="rounded-2xl sm:rounded-3xl bg-deep-navy border border-white/10 p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian border border-white/10 mb-6">
            <span className="font-mono text-xs uppercase tracking-wider text-ice-white/70">
              {t("tarifs.badge")}
            </span>
          </div>

          <h3 className="font-display font-bold text-2xl sm:text-4xl text-ice-white mb-4 tracking-tight">
            {t("tarifs.titre")}
          </h3>

          <p className="text-base sm:text-lg text-ice-white/75 max-w-2xl mx-auto leading-relaxed font-sans mb-10">
            {t("tarifs.description")}
          </p>

          {/* Liste des moyens de paiement sous forme de badges textuels */}
          <div className="pt-8 border-t border-white/10 max-w-lg mx-auto">
            <p className="font-mono text-xs uppercase tracking-wider text-ice-white/60 mb-4">
              {t("tarifs.moyensTitre")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {methods.map((method) => (
                <div
                  key={method}
                  className="px-4 py-2.5 rounded-xl bg-obsidian border border-white/10 text-xs sm:text-sm font-semibold text-ice-white flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-aurora shrink-0" />
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
