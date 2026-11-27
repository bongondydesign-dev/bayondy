import React from "react";
import { t } from "@/lib/i18n";

interface FaqListProps {
  accent?: "brand" | "orange";
}

export function FaqList({ accent = "brand" }: FaqListProps = {}) {
  void accent;
  const faqs = [
    { q: t("faq.q1"), a: t("faq.r1") },
    { q: t("faq.q2"), a: t("faq.r2") },
    { q: t("faq.q3"), a: t("faq.r3") },
    { q: t("faq.q4"), a: t("faq.r4") },
    { q: t("faq.q5"), a: t("faq.r5") },
  ];

  return (
    <div className="space-y-3">
      {faqs.map((item, index) => (
        <details
          key={index}
          className="group rounded-xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--border-strong)] open:border-brand/45 shadow-xs dark:shadow-none transition-colors px-5 py-3.5"
        >
          <summary className="flex items-center justify-between cursor-pointer list-none select-none font-display font-semibold text-sm sm:text-base text-ice-white min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light group-hover:text-brand-light rounded-lg transition-colors">
            <span className="pr-4">{item.q}</span>
            {/* Symbole '+' qui tourne de 45 degrés en 'x' en CSS pur */}
            <span
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-mono text-base font-bold group-open:rotate-45 transition-transform duration-200 select-none bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-ice-white/75 group-open:border-brand/40 group-open:text-brand-light"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <div className="mt-2.5 pb-1 text-sm sm:text-base text-ice-white/70 font-sans leading-relaxed pr-8">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}

export default FaqList;
