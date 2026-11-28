import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { AppLang, DEFAULT_APP_LANG } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/routing";
import { Reveal } from "@/components/ui/Reveal";
import { FeaturesBentoGrid } from "@/components/home/FeaturesBentoGrid";

export function Features({ lang = DEFAULT_APP_LANG }: { lang?: AppLang }) {
  return (
    <section className="w-full py-24 sm:py-32 bg-transparent relative transition-colors duration-200">
      <div
        className="section-hairline absolute top-0 inset-x-0 h-px"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          {/* En-tête asymétrique */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 sm:mb-16">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
                {t("bento.badge", lang)}
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-ice-white tracking-tight leading-[1.08] text-balance">
                {t("bento.titreSection", lang)}
              </h2>
            </div>

            <div className="max-w-md space-y-3">
              <p className="text-sm sm:text-base text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed text-balance">
                {t("bento.sousTitreSection", lang)}
              </p>
              <Link
                href={localizePath("/formations", lang)}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-ice-white hover:text-[var(--home-orange-light)] transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md whitespace-nowrap shrink-0"
              >
                <span>{t("hero.cta", lang)}</span>
                <span
                  className="w-6 h-6 rounded-full bg-slate-900/[0.09] dark:bg-white/[0.08] inline-flex items-center justify-center group-hover:translate-x-0.5 group-hover:bg-[var(--home-orange-vivid)]/15 group-hover:text-[var(--home-orange-light)] transition-all duration-200"
                  aria-hidden="true"
                >
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
                </span>
              </Link>
            </div>
          </div>
        </Reveal>

        <FeaturesBentoGrid />
      </div>
    </section>
  );
}

export default Features;
