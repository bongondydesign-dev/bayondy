"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { t } from "@/lib/i18n";

interface FaqListProps {
  accent?: "brand" | "orange";
}

export function FaqList({ accent = "brand" }: FaqListProps = {}) {
  void accent;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t("faq.q1"), a: t("faq.r1") },
    { q: t("faq.q2"), a: t("faq.r2") },
    { q: t("faq.q3"), a: t("faq.r3") },
    { q: t("faq.q4"), a: t("faq.r4") },
    { q: t("faq.q5"), a: t("faq.r5") },
  ];

  return (
    <div className="space-y-3">
      {faqs.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-trigger-${index}`;

        return (
          <div
            key={index}
            className={`rounded-xl surface-glass border transition-all duration-200 ${
              isOpen
                ? "border-[var(--home-orange-vivid)]/55 shadow-[var(--card-shadow-hover)]"
                : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
            }`}
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left cursor-pointer select-none font-display font-semibold text-sm sm:text-base text-ice-white min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light hover:text-brand-light rounded-xl transition-colors"
            >
              <span className="pr-4">{item.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 border ${
                  isOpen
                    ? "bg-[var(--surface-active)] border-[var(--home-orange-vivid)]/45 text-brand-light"
                    : "bg-[var(--surface-well)] border-[var(--border-subtle)] text-slate-700 dark:text-ice-white/75"
                }`}
                aria-hidden="true"
              >
                <Plus className="w-4 h-4" strokeWidth={2.2} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 pt-0.5 text-sm sm:text-base text-slate-700 dark:text-ice-white/75 font-sans leading-relaxed pr-12">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default FaqList;
