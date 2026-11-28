// RELECTURE REQUISE :
// - Les textes en créole haïtien sont une proposition provisoire à faire relire par un locuteur natif.
// - Ce texte juridique est provisoire et doit être relu et validé par une personne qualifiée avant lancement.

import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LegalDraftNotice } from "@/components/legal/LegalDraftNotice";
import { TodoMark } from "@/components/legal/TodoMark";
import { LEGAL_DRAFT } from "@/lib/legal/config";
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
    path: "/confidentialite",
    title: t("confidentialite.titre", lang),
    description: t("confidentialite.sousTitre", lang),
    robots: LEGAL_DRAFT ? { index: false, follow: true } : undefined,
  });
}

export default async function ConfidentialitePage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang = resolvePageLang(rawLang);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <LegalDraftNotice lang={lang} />

        <header className="mb-10 sm:mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light mb-4">
            {t("confidentialite.badge", lang)}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ice-white leading-tight">
            {t("confidentialite.titre", lang)}
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-slate-700 dark:text-ice-white/75 leading-relaxed">
            {t("confidentialite.sousTitre", lang)}
          </p>
        </header>

        <article className="space-y-8 font-sans text-sm sm:text-base text-slate-800 dark:text-ice-white/80 leading-relaxed">
          {/* 1. Qui sommes-nous */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s1_titre", lang)}
            </h2>
            <p>
              {t("confidentialite.s1_texte", lang)} <TodoMark lang={lang} />
            </p>
          </section>

          {/* 2. Données que nous collectons */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s2_titre", lang)}
            </h2>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-800 dark:text-ice-white/80">
              <li>{t("confidentialite.s2_compte", lang)}</li>
              <li>{t("confidentialite.s2_progression", lang)}</li>
              <li>{t("confidentialite.s2_paiement", lang)}</li>
            </ul>
          </section>

          {/* 3. Pourquoi nous les utilisons */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s3_titre", lang)}
            </h2>
            <p>{t("confidentialite.s3_texte", lang)}</p>
          </section>

          {/* 4. Services tiers */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s4_titre", lang)}
            </h2>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-800 dark:text-ice-white/80">
              <li>{t("confidentialite.s4_firebase", lang)}</li>
              <li>
                {t("confidentialite.s4_paiement", lang)}{" "}
                <TodoMark label={t("legal.aConfirmer", lang)} lang={lang} />
              </li>
              <li>{t("confidentialite.s4_youtube", lang)}</li>
              <li>
                {t("confidentialite.s4_vercel", lang)}{" "}
                <TodoMark label={t("legal.aConfirmer", lang)} lang={lang} />
              </li>
            </ul>
          </section>

          {/* 5. Paiements */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s5_titre", lang)}
            </h2>
            <p>
              {t("confidentialite.s5_texte", lang)}{" "}
              <TodoMark label={t("legal.aConfirmer", lang)} lang={lang} />
            </p>
          </section>

          {/* 6. Durée de conservation */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s6_titre", lang)}
            </h2>
            <p>
              {t("confidentialite.s6_texte", lang)} <TodoMark lang={lang} />
            </p>
          </section>

          {/* 7. Tes droits */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s7_titre", lang)}
            </h2>
            <p>
              {t("confidentialite.s7_texte", lang)} <TodoMark lang={lang} />
            </p>
          </section>

          {/* 8. Cookies et stockage local */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s8_titre", lang)}
            </h2>
            <p>{t("confidentialite.s8_texte", lang)}</p>
          </section>

          {/* 9. Mineurs */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s9_titre", lang)}
            </h2>
            <p>
              {t("confidentialite.s9_texte", lang)} <TodoMark lang={lang} />
            </p>
          </section>

          {/* 10. Modifications et date de mise à jour */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s10_titre", lang)}
            </h2>
            <p>
              {t("confidentialite.s10_texte", lang)} <TodoMark lang={lang} />
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
