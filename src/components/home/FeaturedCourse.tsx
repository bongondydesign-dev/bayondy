import React from "react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { Reveal } from "@/components/ui/Reveal";

export function FeaturedCourse() {
  const highlights = [
    t("fonctionnalites.creole.titre"),
    t("catalogue.atoutMobile"),
    t("catalogue.atoutRythme"),
  ];

  return (
    <section className="w-full py-24 sm:py-32 border-t border-white/[0.06] bg-[#07080A] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
              {t("une.badge")}
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight leading-[1.08] text-balance">
              {t("une.titre")}
            </h2>
          </div>

          {/* Carte divisée 2 colonnes */}
          <div className="group rounded-2xl bg-[#0D0E11] border border-white/[0.08] hover:border-[var(--home-orange)]/35 transition-colors duration-300 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative overflow-hidden">
            {/* Colonne gauche : texte, bénéfices et CTA */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">
              <div>
                <h3 className="font-display font-semibold text-2xl sm:text-3xl text-ice-white leading-snug mb-3 text-balance">
                  {t("une.titre")}
                </h3>
                <p className="text-sm sm:text-base text-ice-white/70 leading-relaxed font-sans">
                  {t("une.description")}
                </p>
              </div>

              <div className="space-y-4">
                <ul className="space-y-2.5 pt-4 border-t border-white/[0.07]">
                  {highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-ice-white/85 font-sans"
                    >
                      <svg
                        className="w-4 h-4 text-[var(--home-orange)] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Button
                    href="/formations"
                    variant="principal"
                    accent="orange"
                    className="pl-6 pr-2.5 py-2"
                  >
                    <span>{t("une.cta")}</span>
                    <span
                      className="w-7 h-7 rounded-full bg-[#07080A] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                      aria-hidden="true"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12h14m-6-6l6 6-6 6" />
                      </svg>
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Colonne droite : Visuel sombre atmosphérique avec carte flottante */}
            <div className="lg:col-span-6 rounded-xl bg-[#07080A] border border-white/[0.07] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[260px]">
              <div
                className="absolute inset-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle at 85% 15%, rgba(255, 91, 34, 0.18) 0%, transparent 55%)",
                }}
                aria-hidden="true"
              />
              <div className="relative z-10 flex items-center justify-between">
                <PortalSymbol size={48} accent="orange" />
                <span className="font-mono text-xs text-[var(--home-orange-light)] px-3 py-1 rounded-full bg-[#111216] border border-white/[0.08]">
                  {t("bento.badgeCreole")}
                </span>
              </div>

              <div className="relative z-10 mt-10 p-4 rounded-xl bg-[#111216]/95 border border-white/[0.1] group-hover:-translate-y-1 group-hover:border-[var(--home-orange)]/35 transition-all duration-300 backdrop-blur-sm">
                <p className="font-display font-bold text-lg text-ice-white">
                  {t("hero.apercu.titre")}
                </p>
                <p className="mt-1 text-xs text-ice-white/70 font-sans">
                  {t("affirmation.sousTexte")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default FeaturedCourse;
