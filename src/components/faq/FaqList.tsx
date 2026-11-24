import React from "react";
import { t } from "@/lib/i18n";

export function FaqList() {
  const faqs = [
    { q: t("faq.q1"), a: t("faq.r1") },
    { q: t("faq.q2"), a: t("faq.r2") },
    { q: t("faq.q3"), a: t("faq.r3") },
    { q: t("faq.q4"), a: t("faq.r4") },
    { q: t("faq.q5"), a: t("faq.r5") },
  ];

  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {faqs.map((item, index) => (
        <details
          key={index}
          className="group py-5 transition-colors open:bg-white/[0.02] px-2 rounded-lg"
        >
          <summary className="flex items-center justify-between cursor-pointer list-none select-none font-display font-semibold text-base sm:text-lg text-ice-white min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora rounded-lg transition-colors group-hover:text-aurora">
            <span className="pr-4">{item.q}</span>
            {/* Symbole '+' qui tourne de 45 degrés en 'x' en CSS pur */}
            <span
              className="shrink-0 w-8 h-8 rounded-full bg-deep-navy border border-white/10 flex items-center justify-center text-aurora font-mono text-lg font-bold group-open:rotate-45 group-open:text-ion-blue transition-transform duration-200 select-none"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <div className="mt-3.5 text-sm sm:text-base text-ice-white/75 font-sans leading-relaxed pr-8">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}

export default FaqList;
