import React from "react";
import {
  ArrowRight,
  Check,
  Layers,
  MonitorPlay,
  Play,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { AppLang, DEFAULT_APP_LANG } from "@/lib/i18n/config";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";

export function HowItWorks({ lang = DEFAULT_APP_LANG }: { lang?: AppLang }) {
  const steps = [
    {
      num: t("etapes.aprann.numero", lang),
      title: t("etapes.aprann.titre", lang),
      desc: t("etapes.aprann.description", lang),
      Icon: MonitorPlay,
      preview: (
        <div className="w-full space-y-2.5">
          <div className="p-2.5 rounded-lg bg-deep-navy dark:bg-[#141720] border border-[var(--home-orange)]/40 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.10)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex items-center gap-3 group-hover:translate-x-0.5 transition-transform duration-200">
            <span className="w-8 h-8 rounded-lg bg-[var(--home-orange)] text-[var(--home-orange-fg)] flex items-center justify-center shrink-0 shadow-xs">
              <Play className="w-3.5 h-3.5 translate-x-0.5 fill-current" aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-ice-white truncate">
                {t("hero.apercu.lecon1", lang)}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-[var(--track-muted)] overflow-hidden">
                  <div className="h-full w-2/5 rounded-full bg-[var(--home-orange)]" />
                </div>
                <span className="font-mono text-[10px] text-[var(--home-orange-light)] tabular-nums shrink-0">
                  {t("hero.apercu.lecon1Duree", lang)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-white dark:bg-[#11141C] border border-[var(--border-subtle)] shadow-[0_1px_4px_rgba(15,23,42,0.06)] dark:shadow-none flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-zinc-400">
            <span className="truncate font-medium">{t("hero.apercu.lecon2", lang)}</span>
            <span className="font-mono text-[10px] text-slate-700 dark:text-zinc-500 tabular-nums shrink-0">
              {t("hero.apercu.lecon2Duree", lang)}
            </span>
          </div>
        </div>
      ),
    },
    {
      num: t("etapes.kreye.numero", lang),
      title: t("etapes.kreye.titre", lang),
      desc: t("etapes.kreye.description", lang),
      Icon: Layers,
      preview: (
        <div className="w-full space-y-2.5">
          <div className="p-3 rounded-lg bg-deep-navy dark:bg-[#141720] border border-[var(--border-subtle)] dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.10)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--home-orange-light)]">
                {t("etapes.kreye.numero", lang)} · {t("etapes.kreye.titre", lang)}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-600 dark:text-zinc-400">
                <Smartphone className="w-3 h-3 text-[var(--home-orange-vivid)]" aria-hidden="true" />
                {t("bento.badgeMobile", lang)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="h-7 rounded-md bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/45 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-[var(--home-orange-light)]" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <div className="h-7 rounded-md bg-[var(--surface-active)] border border-[var(--home-orange-vivid)]/45 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-[var(--home-orange-light)]" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <div className="h-7 rounded-md bg-[var(--home-orange-vivid)]/15 border border-dashed border-[var(--home-orange-vivid)]/65 flex items-center justify-center group-hover:bg-[var(--home-orange-vivid)]/25 transition-colors">
                <Play className="w-3 h-3 text-[var(--home-orange-vivid)]" strokeWidth={2.4} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-white dark:bg-[#11141C] border border-[var(--border-subtle)] shadow-[0_1px_4px_rgba(15,23,42,0.06)] dark:shadow-none flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-ice-white truncate">
              {t("hero.apercu.lecon3", lang)}
            </span>
            <span className="font-mono text-[10px] font-semibold text-[var(--home-orange-light)] shrink-0">
              {t("bento.badgeCreole", lang)}
            </span>
          </div>
        </div>
      ),
    },
    {
      num: t("etapes.avanse.numero", lang),
      title: t("etapes.avanse.titre", lang),
      desc: t("etapes.avanse.description", lang),
      Icon: TrendingUp,
      preview: (
        <div className="w-full space-y-2.5">
          <div className="p-3 rounded-lg bg-deep-navy dark:bg-[#141720] border border-[var(--border-subtle)] dark:border-white/10 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.10)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                {t("hero.apercu.progression", lang)}
              </p>
              <p className="font-display font-bold text-lg text-ice-white tabular-nums leading-tight mt-0.5">
                {t("bento.progressionCent", lang)}
              </p>
            </div>

            <div className="flex items-end gap-1.5 h-9" aria-hidden="true">
              <span className="w-2 h-3 rounded-xs bg-[var(--home-orange-vivid)]/40" />
              <span className="w-2 h-5 rounded-xs bg-[var(--home-orange-vivid)]/60" />
              <span className="w-2 h-7 rounded-xs bg-[var(--home-orange-vivid)]/85" />
              <span className="w-2 h-9 rounded-xs bg-[var(--home-orange-vivid)] group-hover:scale-y-105 origin-bottom transition-transform duration-200" />
            </div>
          </div>

          <div className="px-3 py-2 rounded-lg bg-white dark:bg-[#11141C] border border-[var(--border-subtle)] shadow-[0_1px_4px_rgba(15,23,42,0.06)] dark:shadow-none flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-ice-white truncate">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} aria-hidden="true" />
              <span className="truncate">{t("fonctionnalites.progression.titre", lang)}</span>
            </span>
            <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
              {t("bento.badgeAcces", lang)}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="kijan"
      className="w-full py-24 sm:py-32 bg-[var(--surface-band)] scroll-mt-20 relative overflow-hidden transition-colors duration-200"
    >
      <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
              01 · 02 · 03
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight text-balance">
              {t("etapes.titreSection", lang)}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-ice-white/70">
              {t("etapes.sousTitreSection", lang)}
            </p>
          </div>
        </Reveal>

        <RevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 relative">
          {steps.map((step, idx) => {
            const StepIcon = step.Icon;
            return (
              <RevealItem key={step.num} className="flex">
                <div className="group relative w-full rounded-2xl surface-glass border border-[var(--border-subtle)] hover:border-[var(--home-orange-vivid)]/60 hover:-translate-y-1 p-6 flex flex-col justify-between transition-all duration-300 min-w-0">
                  {idx < steps.length - 1 && (
                    <span
                      className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-[#141720] border border-[var(--border-strong)] items-center justify-center text-slate-600 dark:text-zinc-400 shadow-xs pointer-events-none"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-3 h-3" strokeWidth={2.2} />
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-active)] dark:bg-[var(--home-orange)]/12 border border-[var(--home-orange-vivid)]/35 font-mono text-xs font-semibold text-[var(--home-orange-light)] tabular-nums">
                        {step.num}
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-[var(--surface-well)] dark:bg-[#141720] border border-[var(--border-subtle)] flex items-center justify-center text-slate-700 dark:text-zinc-300 group-hover:text-[var(--home-orange-light)] group-hover:border-[var(--home-orange-vivid)]/45 transition-colors">
                        <StepIcon className="w-4 h-4" strokeWidth={1.85} aria-hidden="true" />
                      </span>
                    </div>

                    <div className="rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] p-3.5 mb-6 min-h-[138px] flex items-center">
                      {step.preview}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-2 group-hover:text-[var(--home-orange-light)] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
}

export default HowItWorks;
