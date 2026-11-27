// RELECTURE REQUISE :
// - Les textes en créole haïtien sont une proposition provisoire à faire relire par un locuteur natif.
// - Les mentions d'assistance/juridiques sont à faire valider par une personne qualifiée avant lancement.

import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FaqList } from "@/components/faq/FaqList";
import { TodoMark } from "@/components/legal/TodoMark";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("faqPage.titre")} | BAYONDY`,
  description: t("faqPage.sousTitre"),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* En-tête de la page */}
        <header className="mb-10 sm:mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light mb-4">
            {t("nav.faq")}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ice-white leading-tight">
            {t("faqPage.titre")}
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-slate-600 dark:text-ice-white/75 leading-relaxed">
            {t("faqPage.sousTitre")}
          </p>
        </header>

        {/* Liste des 5 questions réutilisées depuis FaqList (<details>/<summary>, sans JS) */}
        <section aria-label={t("faqPage.titre")}>
          <FaqList accent="orange" />
        </section>

        {/* Bloc « Besoin d'aide ? » */}
        <section
          aria-labelledby="aide-titre"
          className="mt-12 sm:mt-16 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] p-6 sm:p-8 shadow-[var(--card-shadow)] space-y-4"
        >
          <h2
            id="aide-titre"
            className="font-display font-semibold text-xl sm:text-2xl text-ice-white"
          >
            {t("aide.titre")}
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-ice-white/75 leading-relaxed">
            {t("aide.sousTitre")}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="font-sans text-sm sm:text-base text-ice-white/90 font-medium">
              {t("aide.contactBientot")}
            </span>
            <TodoMark />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
