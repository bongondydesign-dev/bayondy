import React from "react";
import { ArrowRight, Check, Clock, ShieldCheck, Smartphone } from "lucide-react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Pricing() {
  const highlights = [
    t("fonctionnalites.acces.titre"),
    t("fonctionnalites.revoir.titre"),
    t("fonctionnalites.mobile.titre"),
  ];

  return (
    <section className="w-full py-24 sm:py-32 bg-[var(--surface-band)] relative transition-colors duration-200">
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
              {t("tarifs.badge")}
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight text-balance">
              {t("tarifs.titreSection")}
            </h2>
          </div>

          <div className="rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 transition-all duration-300 p-6 sm:p-10 lg:p-12 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] relative overflow-hidden">
            {/* Halo ambiant discret */}
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none opacity-35 dark:opacity-40"
              style={{
                background:
                  "radial-gradient(circle, var(--home-orange-glow-soft) 0%, transparent 68%)",
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Colonne gauche : Message transparence, avantages inclus & CTA */}
              <div className="lg:col-span-7 text-left space-y-6">
                <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--home-orange-light)]">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[var(--home-orange)]"
                    aria-hidden="true"
                  />
                  <span>{t("bento.badgeCreole")}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t("tarifs.badge")}</span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-ice-white tracking-tight text-balance leading-[1.15]">
                    {t("tarifs.titre")}
                  </h3>

                  <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-ice-white/70 leading-relaxed font-sans max-w-xl">
                    {t("tarifs.description")}
                  </p>
                </div>

                {/* Points clés inclus */}
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {highlights.map((label) => (
                    <li
                      key={label}
                      className="flex items-center gap-2 text-xs sm:text-sm font-medium text-ice-white"
                    >
                      <span className="w-5 h-5 rounded-full bg-[var(--surface-active)] dark:bg-[var(--home-orange)]/15 border border-[var(--home-orange)]/30 text-[var(--home-orange)] inline-flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" strokeWidth={2.6} aria-hidden="true" />
                      </span>
                      <span className="truncate">{label}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 flex flex-wrap items-center gap-3">
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

                  <Button
                    href="/formations"
                    variant="secondaire"
                    accent="orange"
                    className="px-5 py-2.5"
                  >
                    <span>{t("hero.cta")}</span>
                  </Button>
                </div>
              </div>

              {/* Colonne droite : Panneau structuré des moyens de paiement */}
              <div className="lg:col-span-5 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {t("tarifs.moyensTitre")}
                  </p>
                  <ShieldCheck
                    className="w-4 h-4 text-[var(--home-orange-light)] shrink-0"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <div className="space-y-3">
                  {/* MonCash — Opérationnel */}
                  <div className="p-3.5 rounded-xl bg-deep-navy dark:bg-[#141720] border border-[var(--home-orange)]/40 shadow-2xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-lg bg-[var(--surface-active)] dark:bg-[var(--home-orange)]/15 border border-[var(--home-orange)]/35 text-[var(--home-orange)] dark:text-[var(--home-orange-light)] flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm text-ice-white">
                          MonCash
                        </p>
                        <p className="font-sans text-xs text-slate-500 dark:text-zinc-400 truncate">
                          {t("fonctionnalites.acces.titre")}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-semibold shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      {t("tarifs.statutDisponible")}
                    </span>
                  </div>

                  {/* NatCash — À venir */}
                  <div className="p-3.5 rounded-xl bg-deep-navy/60 dark:bg-[#11141C] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-lg bg-[var(--surface-well)] dark:bg-[#161A24] border border-[var(--border-subtle)] text-slate-500 dark:text-zinc-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm text-ice-white/90">
                          NatCash
                        </p>
                        <p className="font-sans text-xs text-slate-500 dark:text-zinc-500 truncate">
                          {t("bento.badgePaiement")}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--surface-well)] dark:bg-[#161A24] border border-[var(--border-subtle)] text-slate-500 dark:text-zinc-400 font-mono text-[11px] font-medium shrink-0">
                      {t("tarifs.statutAvenir")}
                    </span>
                  </div>
                </div>

                <p className="pt-1 font-sans text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {t("fonctionnalites.paiement.description")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Pricing;
