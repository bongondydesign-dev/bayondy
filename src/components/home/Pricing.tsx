import React from "react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Pricing() {
  const methods = t("tarifs.moyens")
    .split(",")
    .map((m) => m.trim());

  return (
    <section className="w-full py-24 sm:py-32 border-t border-[var(--border-faint)] bg-obsidian relative transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
              {t("tarifs.badge")}
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight text-balance">
              {t("tarifs.titreSection")}
            </h2>
          </div>

          <div className="rounded-2xl bg-deep-navy border border-[var(--home-orange)]/35 hover:border-[var(--home-orange)]/60 transition-colors duration-300 p-8 sm:p-12 text-center shadow-[var(--card-shadow)] relative overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-56 pointer-events-none opacity-80 dark:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse 65% 80% at 50% 0%, var(--home-orange-glow-soft) 0%, transparent 75%)",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <h3 className="font-display font-bold text-2xl sm:text-4xl text-ice-white mb-4 tracking-tight text-balance">
                {t("tarifs.titre")}
              </h3>

              <p className="text-base sm:text-lg text-ice-white/70 max-w-xl mx-auto leading-relaxed font-sans mb-8">
                {t("tarifs.description")}
              </p>

              <div className="mb-10 flex justify-center">
                <Button
                  href="/inscription"
                  variant="principal"
                  accent="orange"
                  className="pl-6 pr-2.5 py-2"
                >
                  <span>{t("final.cta")}</span>
                  <span
                    className="w-7 h-7 rounded-full bg-[var(--home-orange-fg)] text-[var(--home-orange)] inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12h14m-6-6l6 6-6 6" />
                    </svg>
                  </span>
                </Button>
              </div>

              <div className="pt-7 border-t border-[var(--border-subtle)] max-w-lg mx-auto">
                <p className="font-mono text-xs uppercase tracking-wider text-ice-white/65 mb-4">
                  {t("tarifs.moyensTitre")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {methods.map((method) => (
                    <div
                      key={method}
                      className="px-4 py-2.5 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/35 transition-colors text-xs sm:text-sm font-semibold text-ice-white flex items-center gap-2"
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
                      <span>{method}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Pricing;
