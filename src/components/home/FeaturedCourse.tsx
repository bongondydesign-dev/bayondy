import React from "react";
import { ArrowRight, Check } from "lucide-react";
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
    <section className="w-full py-24 sm:py-32 bg-transparent relative transition-colors duration-200">
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
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
          <div className="group rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/40 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-300 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative overflow-hidden">
            {/* Colonne gauche : texte, bénéfices et CTA */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--home-orange-light)] mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--home-orange)]" aria-hidden="true" />
                  <span>{t("bento.badgeCreole")}</span>
                </span>
                <h3 className="font-display font-semibold text-2xl sm:text-3xl text-ice-white leading-snug mb-3 text-balance">
                  {t("hero.apercu.titre")}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-ice-white/70 leading-relaxed font-sans">
                  {t("une.description")}
                </p>
              </div>

              <div className="space-y-4">
                <ul className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)]">
                  {highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-ice-white/85 font-sans font-medium"
                    >
                      <Check
                        className="w-4 h-4 text-[var(--home-orange)] shrink-0"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
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
                      className="w-7 h-7 rounded-full bg-[var(--home-orange-fg)] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Colonne droite : Visuel architectural avec carte flottante */}
            <div className="lg:col-span-6 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[260px]">
              <div
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-45 group-hover:opacity-65 dark:group-hover:opacity-65 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle at 82% 20%, var(--home-orange-glow-soft) 0%, transparent 52%)",
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(var(--surface-grid-line) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
                aria-hidden="true"
              />

              <div className="relative z-10 flex items-center justify-between">
                <PortalSymbol size={48} accent="orange" />
                <span className="font-mono text-xs font-medium text-[var(--home-orange-light)] px-3 py-1 rounded-full bg-deep-navy dark:bg-[#141720] border border-[var(--border-subtle)] shadow-2xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  {t("bento.badgeCreole")}
                </span>
              </div>

              <div className="relative z-10 mt-10 p-4 rounded-xl bg-deep-navy dark:bg-[#13161E] border border-[var(--border-subtle)] group-hover:-translate-y-1 group-hover:border-[var(--home-orange)]/40 transition-all duration-300 shadow-[0_6px_18px_-6px_rgba(15,23,42,0.08)] dark:shadow-[var(--card-shadow)]">
                <p className="font-display font-bold text-lg text-ice-white">
                  {t("hero.apercu.titre")}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-ice-white/70 font-sans">
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
