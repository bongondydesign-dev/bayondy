import React from "react";
import { t } from "@/lib/i18n";

export function HowItWorks() {
  const steps = [
    {
      num: t("etapes.aprann.numero"),
      title: t("etapes.aprann.titre"),
      desc: t("etapes.aprann.description"),
      accent: "text-ion-blue",
      glow: "border-ion-blue/30 hover:border-ion-blue/60",
    },
    {
      num: t("etapes.kreye.numero"),
      title: t("etapes.kreye.titre"),
      desc: t("etapes.kreye.description"),
      accent: "text-aurora",
      glow: "border-aurora/30 hover:border-aurora/60",
    },
    {
      num: t("etapes.avanse.numero"),
      title: t("etapes.avanse.titre"),
      desc: t("etapes.avanse.description"),
      accent: "text-ice-white",
      glow: "border-white/20 hover:border-white/40",
    },
  ];

  return (
    <section
      id="kijan"
      className="w-full py-20 sm:py-32 border-t border-white/5 scroll-mt-20 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête de section */}
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deep-navy border border-white/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-ion-blue" />
            <span className="font-mono text-xs uppercase tracking-wider text-ion-blue">
              {t("etapes.titreSection")}
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight">
            {t("etapes.titreSection")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ice-white/70">
            {t("etapes.sousTitreSection")}
          </p>
        </div>

        {/* Conteneur avec fine ligne lumineuse reliant les 3 colonnes sur desktop */}
        <div className="relative">
          {/* Fine ligne lumineuse horizontale sur desktop */}
          <div
            className="hidden md:block absolute top-12 left-16 right-16 h-[2px] bg-gradient-to-r from-ion-blue/40 via-aurora/50 to-ion-blue/40 -z-0"
            aria-hidden="true"
          />

          {/* Grille des 3 étapes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step) => (
              <div
                key={step.num}
                className={`rounded-2xl sm:rounded-3xl bg-deep-navy border ${step.glow} p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all duration-300 relative group`}
              >
                {/* Pastille numérique */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-xl bg-obsidian border border-white/10 flex items-center justify-center font-mono text-xl font-bold text-ice-white shadow-inner">
                    <span className={step.accent}>{step.num}</span>
                  </div>
                </div>

                {/* Titre & description */}
                <div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-ice-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-ice-white/75 font-sans leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
