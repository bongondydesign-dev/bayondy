import React from "react";
import { t } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";

export function HowItWorks() {
  const steps = [
    {
      num: t("etapes.aprann.numero"),
      title: t("etapes.aprann.titre"),
      desc: t("etapes.aprann.description"),
      preview: (
        <div className="space-y-2">
          <div className="px-3 py-2 rounded-lg bg-deep-navy border border-[var(--home-orange)]/30 text-xs text-ice-white truncate group-hover:translate-x-1 transition-transform duration-200">
            {t("hero.apercu.lecon1")}
          </div>
          <div className="px-3 py-2 rounded-lg bg-deep-navy border border-[var(--border-subtle)] text-xs text-ice-white/75 truncate group-hover:translate-x-1 transition-transform duration-200 delay-75">
            {t("hero.apercu.lecon2")}
          </div>
          <div className="px-3 py-2 rounded-lg bg-deep-navy border border-[var(--border-subtle)] text-xs text-ice-white/75 truncate group-hover:translate-x-1 transition-transform duration-200 delay-150">
            {t("hero.apercu.lecon3")}
          </div>
        </div>
      ),
    },
    {
      num: t("etapes.kreye.numero"),
      title: t("etapes.kreye.titre"),
      desc: t("etapes.kreye.description"),
      preview: (
        <div className="space-y-3 py-1">
          <div>
            <div className="flex justify-between text-[11px] font-mono text-ice-white/70 mb-1">
              <span>{t("bento.badgeCreole")}</span>
              <span className="tabular-nums text-[var(--home-orange-light)]">100%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--track-muted)] overflow-hidden">
              <div className="h-full w-full rounded-full bg-[var(--home-orange)] animate-bar-fill" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-mono text-ice-white/70 mb-1">
              <span>{t("bento.badgeMobile")}</span>
              <span className="tabular-nums text-[var(--home-orange-light)]">100%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--track-muted)] overflow-hidden">
              <div
                style={{ animationDelay: "140ms" }}
                className="h-full w-full rounded-full bg-gradient-to-r from-[var(--home-orange-dark)] to-[var(--home-orange)] animate-bar-fill"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-mono text-ice-white/70 mb-1">
              <span>{t("bento.badgeRevoir")}</span>
              <span className="tabular-nums text-[var(--home-orange-light)]">100%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--track-muted)] overflow-hidden">
              <div
                style={{ animationDelay: "280ms" }}
                className="h-full w-full rounded-full bg-gradient-to-r from-[var(--home-orange-dark)] to-[var(--home-orange-light)] animate-bar-fill"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      num: t("etapes.avanse.numero"),
      title: t("etapes.avanse.titre"),
      desc: t("etapes.avanse.description"),
      preview: (
        <div className="space-y-2.5">
          {[
            t("fonctionnalites.acces.titre"),
            t("fonctionnalites.progression.titre"),
            t("fonctionnalites.revoir.titre"),
          ].map((item, idx) => (
            <div
              key={item}
              style={{ transitionDelay: `${idx * 50}ms` }}
              className="px-3 py-2 rounded-lg bg-deep-navy border border-[var(--border-subtle)] group-hover:border-[var(--home-orange)]/25 transition-colors duration-200 flex items-center gap-2.5 text-xs text-ice-white/85"
            >
              <svg
                className="w-3.5 h-3.5 text-[var(--home-orange)] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
              </svg>
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section
      id="kijan"
      className="w-full py-24 sm:py-32 border-t border-[var(--border-faint)] bg-obsidian scroll-mt-20 relative overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
              {t("etapes.titreSection")}
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight text-balance">
              {t("etapes.titreSection")}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-ice-white/70">
              {t("etapes.sousTitreSection")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="group rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-1 shadow-[var(--card-shadow)] p-6 flex flex-col justify-between transition-all duration-300 min-w-0"
              >
                {/* Aperçu visuel supérieur */}
                <div className="rounded-xl bg-[var(--surface-well)] border border-[var(--border-faint)] p-4 mb-6">
                  {step.preview}
                </div>

                <div>
                  <span className="font-mono text-xs font-semibold text-[var(--home-orange-light)] tabular-nums block mb-2">
                    {step.num}
                  </span>
                  <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ice-white/70 font-sans leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default HowItWorks;
