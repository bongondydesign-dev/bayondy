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
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = resolvePageLang(rawLang);

  return buildLocalizedMetadata({
    lang,
    path: "/faq",
    title: t("faqPage.titre", lang),
    description: t("faqPage.sousTitre", lang),
  });
}

export default async function FaqPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang = resolvePageLang(rawLang);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang === "kr" ? "ht" : "fr",
    mainEntity: ([1, 2, 3, 4, 5] as const).map((n) => ({
      "@type": "Question",
      name: t(`faq.q${n}`, lang),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`faq.r${n}`, lang),
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <header className="mb-10 sm:mb-12 animate-hero-1">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light mb-4">
            {t("nav.faq", lang)}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ice-white leading-tight text-balance">
            {t("faqPage.titre", lang)}
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-slate-600 dark:text-ice-white/75 leading-relaxed">
            {t("faqPage.sousTitre", lang)}
          </p>
        </header>

        <section aria-label={t("faqPage.titre", lang)} className="animate-hero-2">
          <FaqList accent="orange" />
        </section>

        <section
          aria-labelledby="aide-titre"
          className="mt-12 sm:mt-16 rounded-2xl surface-glass border border-[var(--border-subtle)] p-6 sm:p-8 space-y-4 animate-hero-3"
        >
          <h2
            id="aide-titre"
            className="font-display font-semibold text-xl sm:text-2xl text-ice-white"
          >
            {t("aide.titre", lang)}
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-ice-white/75 leading-relaxed">
            {t("aide.sousTitre", lang)}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="font-sans text-sm sm:text-base text-ice-white/90 font-medium">
              {t("aide.contactBientot", lang)}
            </span>
            <TodoMark lang={lang} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
