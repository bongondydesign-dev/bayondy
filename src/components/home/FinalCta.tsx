import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { t } from "@/lib/i18n";
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

export function FinalCta() {
  const { prefix, accent } = splitHeadlineAccent(t("final.titre"));

  const guarantees = [
    t("bento.badgeCreole"),
    t("bento.badgeMobile"),
    `MonCash · ${t("bento.badgeAcces")}`,
  ];

  return (
    <section className="w-full py-20 sm:py-28 bg-transparent relative transition-colors duration-200">
      <div
        className="section-hairline absolute top-0 inset-x-0 h-px"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] px-6 py-14 sm:px-12 sm:py-20 text-center">
            {/* Lueur radiale orange ancrée en haut du portail (hors zone de texte) */}
            <div
              className="absolute inset-x-0 top-0 h-80 pointer-events-none opacity-55 dark:opacity-85"
              style={{
                background:
                  "radial-gradient(ellipse 62% 58% at 50% 0%, var(--home-orange-glow) 0%, var(--home-orange-glow-soft) 46%, transparent 76%)",
              }}
              aria-hidden="true"
            />

            {/* Trame architecturale discrète sur les bordures extérieures */}
            <div
              className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-35 [mask-image:radial-gradient(ellipse_74%_68%_at_50%_42%,transparent_36%,#000_100%)]"
              style={{
                backgroundImage:
                  "radial-gradient(var(--surface-grid-line) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
              aria-hidden="true"
            />

            {/* Arcs orbitaux concentriques centrés autour du symbole B-Portail */}
            <svg
              viewBox="0 0 800 320"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[780px] max-w-none h-72 pointer-events-none opacity-55 dark:opacity-70"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="400"
                cy="72"
                r="108"
                stroke="var(--border-strong)"
                strokeOpacity="0.45"
                strokeWidth="1"
                strokeDasharray="3 6"
              />
              <circle
                cx="400"
                cy="72"
                r="186"
                stroke="var(--home-orange)"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <circle
                cx="400"
                cy="72"
                r="268"
                stroke="var(--border-subtle)"
                strokeWidth="1"
              />
            </svg>

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              {/* Signature B-Portail */}
              <div className="mb-6">
                <PortalSymbol size={52} accent="orange" />
              </div>

              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-4">
                {t("final.badge")}
              </p>

              <h2 className="font-display font-bold text-3xl sm:text-5xl lg:text-[3.5rem] text-ice-white tracking-[-0.025em] leading-[1.06] text-balance">
                {prefix}
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#E54813] to-[#BA3408] dark:from-[#FF885C] dark:to-[#FF5B22] bg-clip-text text-transparent pr-1">
                  {accent}
                </span>
              </h2>

              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-ice-white/75 max-w-lg leading-relaxed font-sans text-balance">
                {t("final.sousTitre")}
              </p>

              {/* Boutons d'action */}
              <div className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto justify-center">
                <Button
                  href="/inscription"
                  variant="principal"
                  accent="orange"
                  className="w-full sm:w-auto pl-6 pr-2.5 py-2 justify-between sm:justify-center"
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
                  className="w-full sm:w-auto pl-6 pr-3 py-2 justify-between sm:justify-center"
                >
                  <span>{t("hero.cta")}</span>
                  <span
                    className="w-6 h-6 rounded-full bg-slate-900/[0.06] dark:bg-white/[0.07] text-slate-700 dark:text-ice-white/80 inline-flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
                  </span>
                </Button>
              </div>

              {/* Ligne de réassurance sobre sans pilules */}
              <div className="mt-10 pt-7 border-t border-[var(--border-faint)] w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-[13px] text-slate-600 dark:text-ice-white/70 font-sans font-medium">
                {guarantees.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check
                      className="w-3.5 h-3.5 text-[var(--home-orange)] shrink-0"
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
