import React from "react";
import { Plus } from "lucide-react";
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
          className="group rounded-xl bg-deep-navy border border-[var(--border-subtle)] hover:border-[var(--border-strong)] open:border-brand/45 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] open:shadow-[var(--card-shadow)] transition-all duration-200 px-5 py-3.5"
        >
          <summary className="flex items-center justify-between cursor-pointer list-none select-none font-display font-semibold text-sm sm:text-base text-ice-white min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light group-hover:text-brand-light rounded-lg transition-colors">
            <span className="pr-4">{item.q}</span>
            <span
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 select-none bg-[var(--surface-well)] border border-[var(--border-subtle)] text-slate-600 dark:text-ice-white/75 group-open:bg-[var(--surface-active)] group-open:border-brand/40 group-open:text-brand-light"
              aria-hidden="true"
            >
              <Plus
                className="w-4 h-4 transition-transform duration-200 group-open:rotate-45"
                strokeWidth={2.2}
              />
            </span>
          </summary>
          <div className="mt-2.5 pb-1 text-sm sm:text-base text-slate-600 dark:text-ice-white/75 font-sans leading-relaxed pr-8">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}

export default FaqList;
