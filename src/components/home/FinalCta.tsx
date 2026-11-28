import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { t } from "@/lib/i18n";
import { AppLang, DEFAULT_APP_LANG } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/Button";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { Reveal } from "@/components/ui/Reveal";

function splitHeadlineAccent(text: string): { prefix: string; accent: string } {
  const match = text.match(/^(.*\s)([^\s?!.:;]+(?:\s*[?!.:;]+)?)$/);
  if (!match) {
    return { prefix: "", accent: text };
  }
  return { prefix: match[1], accent: match[2] };
}

export function FinalCta({ lang = DEFAULT_APP_LANG }: { lang?: AppLang }) {
  const { prefix, accent } = splitHeadlineAccent(t("final.titre", lang));

  const guarantees = [
    t("bento.badgeCreole", lang),
    t("bento.badgeMobile", lang),
    `MonCash · ${t("bento.badgeAcces", lang)}`,
  ];

  return (
    <section className="w-full py-20 sm:py-28 bg-transparent relative transition-colors duration-200">
      <div
        className="section-hairline absolute top-0 inset-x-0 h-px"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl surface-contrast border border-white/10 px-6 py-14 sm:px-12 sm:py-20 text-center">
            {/* Lueur radiale orange ancrée en haut du portail */}
            <div
              className="absolute inset-x-0 top-0 h-80 pointer-events-none opacity-85"
              style={{
                background:
                  "radial-gradient(ellipse 62% 58% at 50% 0%, rgba(255, 91, 34, 0.28) 0%, rgba(255, 91, 34, 0.08) 46%, transparent 76%)",
              }}
              aria-hidden="true"
            />

            {/* Trame architecturale discrète sur les bordures extérieures */}
            <div
              className="absolute inset-0 pointer-events-none opacity-35 [mask-image:radial-gradient(ellipse_74%_68%_at_50%_42%,transparent_36%,#000_100%)]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
              aria-hidden="true"
            />

            {/* Arcs orbitaux concentriques centrés autour du symbole B-Portail */}
            <svg
              viewBox="0 0 800 320"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[780px] max-w-none h-72 pointer-events-none opacity-70"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="400"
                cy="72"
                r="108"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
                strokeDasharray="3 6"
              />
              <circle
                cx="400"
                cy="72"
                r="186"
                stroke="#FF5B22"
                strokeOpacity="0.26"
                strokeWidth="1"
              />
              <circle
                cx="400"
                cy="72"
                r="268"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </svg>

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <div className="mb-6">
                <PortalSymbol size={52} accent="orange" />
              </div>

              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#FF885C] mb-4">
                {t("final.badge", lang)}
              </p>

              <h2 className="font-display font-bold text-3xl sm:text-5xl lg:text-[3.5rem] text-white tracking-[-0.025em] leading-[1.06] text-balance">
                {prefix}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#FF8C61] to-[#FF5B22] bg-clip-text text-transparent pr-1">
                  {accent}
                </span>
              </h2>

              <p className="mt-5 text-base sm:text-lg text-zinc-300 max-w-lg leading-relaxed font-sans text-balance">
                {t("final.sousTitre", lang)}
              </p>

              {/* Boutons d'action */}
              <div className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto justify-center">
                <Button
                  href={localizePath("/inscription", lang)}
                  variant="principal"
                  accent="orange"
                  className="w-full sm:w-auto pl-6 pr-2.5 py-2 justify-between sm:justify-center"
                >
                  <span>{t("final.cta", lang)}</span>
                  <span
                    className="w-7 h-7 rounded-full bg-white text-[var(--brand)] inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                  </span>
                </Button>

                <Link
                  href={localizePath("/formations", lang)}
                  className="group w-full sm:w-auto inline-flex items-center justify-between sm:justify-center gap-2.5 pl-6 pr-3 py-2 rounded-full min-h-[44px] border border-white/20 bg-white/[0.08] backdrop-blur-md text-white hover:bg-white/[0.14] hover:border-[#FF885C]/55 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 font-medium text-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                >
                  <span>{t("hero.cta", lang)}</span>
                  <span
                    className="w-6 h-6 rounded-full bg-white/12 text-white inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
                  </span>
                </Link>
              </div>

              {/* Ligne de réassurance */}
              <div className="mt-10 pt-7 border-t border-white/10 w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-[13px] text-zinc-300 font-sans font-medium">
                {guarantees.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check
                      className="w-3.5 h-3.5 text-[#FF885C] shrink-0"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default FinalCta;
