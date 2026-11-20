import React from "react";
import { t } from "@/lib/i18n";

export function Affirmation() {
  return (
    <section className="w-full py-20 sm:py-32 relative overflow-hidden border-t border-white/5">
      {/* Lueur centrale subtile */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-ion-blue/10 rounded-full blur-[120px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Badge supérieur */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deep-navy border border-white/10 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora" />
          <span className="font-mono text-xs uppercase tracking-wider text-ice-white/70">
            {t("affirmation.badge")}
          </span>
        </div>

        {/* Grand texte d'affirmation en dégradé vertical (effet cinématique blanc vers gris) */}
        <p className="font-display font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto leading-[1.2] tracking-tight bg-gradient-to-b from-white via-ice-white to-white/35 bg-clip-text text-transparent">
          {t("affirmation.texte")}
        </p>

        {/* Sous-texte discret */}
        <p className="mt-8 text-sm sm:text-base text-ice-white/60 max-w-xl font-sans">
          {t("affirmation.sousTexte")}
        </p>
      </div>
    </section>
  );
}

export default Affirmation;
