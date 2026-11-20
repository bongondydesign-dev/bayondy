import React from "react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { PortalSymbol } from "@/components/ui/PortalSymbol";

export function Hero() {
  return (
    <section className="relative w-full pt-12 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
      {/* Lueurs d'ambiance bleue et turquoise */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 w-[380px] sm:w-[680px] h-[380px] sm:h-[680px] bg-ion-blue/15 rounded-full blur-[100px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-28 left-1/2 -translate-x-1/3 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-aurora/10 rounded-full blur-[90px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Petit badge avec symbole B-Portail miniature */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-deep-navy/90 border border-white/10 shadow-sm mb-6">
          <PortalSymbol size={22} className="shrink-0" />
          <span className="font-mono text-xs uppercase tracking-wider text-aurora">
            {t("hero.badge")}
          </span>
        </div>

        {/* Très gros titre sur 2 lignes avec UN mot en dégradé Ion Blue vers Aurora */}
        <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-ice-white max-w-5xl leading-[1.08]">
          <span className="block">{t("hero.titreLigne1")}</span>
          <span className="block">
            {t("hero.titreLigne2Prefix")}
            <span className="bg-gradient-to-r from-ion-blue via-[#2D8DFF] to-aurora bg-clip-text text-transparent">
              {t("hero.titreLigne2Gradient")}
            </span>
          </span>
        </h1>

        {/* Sous-titre discret */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-ice-white/70 max-w-2xl leading-relaxed font-sans">
          {t("hero.sousTitre")}
        </p>

        {/* Deux boutons d'action */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto justify-center">
          <Button href="/formations" variant="principal">
            {t("hero.cta")}
          </Button>
          <Button href="#kijan" variant="secondaire">
            {t("hero.ctaSecondaire")}
          </Button>
        </div>

        {/* Grande maquette CSS de la plateforme avec cadre arrondi et lueur bleue derrière */}
        <div className="mt-14 sm:mt-20 w-full max-w-5xl relative">
          {/* Lueur d'arrière-plan du cadre */}
          <div
            className="absolute -inset-1.5 sm:-inset-3 bg-gradient-to-r from-ion-blue/25 via-aurora/15 to-ion-blue/20 rounded-3xl blur-2xl -z-10"
            aria-hidden="true"
          />

          <div className="rounded-2xl sm:rounded-3xl bg-deep-navy/90 border border-white/10 p-3 sm:p-6 shadow-2xl text-left backdrop-blur-sm">
            {/* Barre de contrôle supérieure */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
              </div>
              <div className="px-3 py-1 rounded-md bg-obsidian/80 border border-white/5 text-[11px] font-mono text-ice-white/60">
                bayondy.com / {t("hero.apercu.badge")}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-aurora animate-pulse" />
            </div>

            {/* Disposition principale : lecteur + volet des leçons */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Écran lecteur vidéo fictif */}
              <div className="lg:col-span-8 aspect-video rounded-xl bg-obsidian border border-white/5 flex flex-col items-center justify-center relative p-4 overflow-hidden">
                {/* Bouton de lecture central */}
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-deep-navy/90 border border-aurora/40 flex items-center justify-center text-aurora shadow-lg shadow-ion-blue/20">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 translate-x-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                {/* Titre et durée en bas */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-ice-white/90 truncate mr-2">
                    {t("hero.apercu.titre")}
                  </span>
                  <span className="font-mono text-xs text-ice-white/60 shrink-0">
                    {t("hero.apercu.duree")}
                  </span>
                </div>

                {/* Barre de progression vide */}
                <div className="absolute bottom-1 left-4 right-4 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-aurora rounded-full" />
                </div>
              </div>

              {/* Volet latéral de 3 leçons génériques */}
              <div className="lg:col-span-4 rounded-xl bg-obsidian/60 border border-white/5 p-3 sm:p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/5">
                    <span className="font-mono text-xs uppercase tracking-wider text-ice-white/60">
                      {t("hero.apercu.listeTitre")}
                    </span>
                    <span className="font-mono text-[11px] text-aurora">
                      {t("hero.apercu.progressionZero")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-deep-navy/80 border border-aurora/30 text-xs sm:text-sm text-ice-white flex items-center justify-between">
                      <span className="truncate mr-2 font-medium">
                        {t("hero.apercu.lecon1")}
                      </span>
                      <span className="font-mono text-[11px] text-aurora shrink-0">
                        {t("hero.apercu.lecon1Duree")}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-deep-navy/30 border border-white/5 text-xs sm:text-sm text-ice-white/60 flex items-center justify-between">
                      <span className="truncate mr-2">
                        {t("hero.apercu.lecon2")}
                      </span>
                      <span className="font-mono text-[11px] text-ice-white/40 shrink-0">
                        {t("hero.apercu.lecon2Duree")}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-deep-navy/30 border border-white/5 text-xs sm:text-sm text-ice-white/60 flex items-center justify-between">
                      <span className="truncate mr-2">
                        {t("hero.apercu.lecon3")}
                      </span>
                      <span className="font-mono text-[11px] text-ice-white/40 shrink-0">
                        {t("hero.apercu.lecon3Duree")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progression globale */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-ice-white/60">
                  <span>{t("hero.apercu.progression")}</span>
                  <span className="font-mono text-ice-white/80">
                    {t("hero.apercu.progressionZero")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
