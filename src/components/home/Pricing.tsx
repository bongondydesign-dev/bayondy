import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Pricing() {
  const methods = t("tarifs.moyens")
    .split(",")
    .map((m) => m.trim());

  return (
    <section className="w-full py-24 sm:py-32 bg-[var(--surface-band)] relative transition-colors duration-200">
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
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

          <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 transition-all duration-300 p-8 sm:p-12 text-center shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] relative overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-44 pointer-events-none opacity-40 dark:opacity-55"
              style={{
                background:
                  "radial-gradient(ellipse 65% 75% at 50% 0%, var(--home-orange-glow-soft) 0%, transparent 75%)",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <h3 className="font-display font-bold text-2xl sm:text-4xl text-ice-white mb-4 tracking-tight text-balance">
                {t("tarifs.titre")}
              </h3>

              <p className="text-base sm:text-lg text-slate-600 dark:text-ice-white/70 max-w-xl mx-auto leading-relaxed font-sans mb-8">
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
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                  </span>
                </Button>
              </div>

              <div className="pt-7 border-t border-[var(--border-subtle)] max-w-lg mx-auto">
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-ice-white/65 mb-4">
                  {t("tarifs.moyensTitre")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {methods.map((method) => (
                    <div
                      key={method}
                      className="px-4 py-2.5 rounded-xl bg-[var(--surface-well)] dark:bg-[#141720] border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/40 transition-colors text-xs sm:text-sm font-semibold text-ice-white flex items-center gap-2"
                    >
                      <Check
                        className="w-3.5 h-3.5 text-[var(--home-orange)] shrink-0"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
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
