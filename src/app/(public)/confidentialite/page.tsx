// RELECTURE REQUISE :
// - Les textes en créole haïtien sont une proposition provisoire à faire relire par un locuteur natif.
// - Ce texte juridique est provisoire et doit être relu et validé par une personne qualifiée avant lancement.

import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LegalDraftNotice } from "@/components/legal/LegalDraftNotice";
import { TodoMark } from "@/components/legal/TodoMark";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("confidentialite.titre")} | BAYONDY`,
  description: t("confidentialite.sousTitre"),
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <LegalDraftNotice />

        <header className="mb-10 sm:mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light mb-4">
            {t("confidentialite.badge")}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ice-white leading-tight">
            {t("confidentialite.titre")}
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-ice-white/75 leading-relaxed">
            {t("confidentialite.sousTitre")}
          </p>
        </header>

        <article className="space-y-8 font-sans text-sm sm:text-base text-ice-white/80 leading-relaxed">
          {/* 1. Qui sommes-nous */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s1_titre")}
            </h2>
            <p>
              {t("confidentialite.s1_texte")} <TodoMark />
            </p>
          </section>

          {/* 2. Données que nous collectons */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s2_titre")}
            </h2>
            <ul className="list-disc pl-5 space-y-2.5 text-ice-white/80">
              <li>{t("confidentialite.s2_compte")}</li>
              <li>{t("confidentialite.s2_progression")}</li>
              <li>{t("confidentialite.s2_paiement")}</li>
            </ul>
          </section>

          {/* 3. Pourquoi nous les utilisons */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s3_titre")}
            </h2>
            <p>{t("confidentialite.s3_texte")}</p>
          </section>

          {/* 4. Services tiers */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s4_titre")}
            </h2>
            <ul className="list-disc pl-5 space-y-2.5 text-ice-white/80">
              <li>{t("confidentialite.s4_firebase")}</li>
              <li>
                {t("confidentialite.s4_paiement")}{" "}
                <TodoMark label={t("legal.aConfirmer")} />
              </li>
              <li>{t("confidentialite.s4_youtube")}</li>
              <li>
                {t("confidentialite.s4_vercel")}{" "}
                <TodoMark label={t("legal.aConfirmer")} />
              </li>
            </ul>
          </section>

          {/* 5. Paiements */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s5_titre")}
            </h2>
            <p>
              {t("confidentialite.s5_texte")}{" "}
              <TodoMark label={t("legal.aConfirmer")} />
            </p>
          </section>

          {/* 6. Durée de conservation */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s6_titre")}
            </h2>
            <p>
              {t("confidentialite.s6_texte")} <TodoMark />
            </p>
          </section>

          {/* 7. Tes droits */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s7_titre")}
            </h2>
            <p>
              {t("confidentialite.s7_texte")} <TodoMark />
            </p>
          </section>

          {/* 8. Cookies et stockage local */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s8_titre")}
            </h2>
            <p>{t("confidentialite.s8_texte")}</p>
          </section>

          {/* 9. Mineurs */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s9_titre")}
            </h2>
            <p>
              {t("confidentialite.s9_texte")} <TodoMark />
            </p>
          </section>

          {/* 10. Modifications et date de mise à jour */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("confidentialite.s10_titre")}
            </h2>
            <p>
              {t("confidentialite.s10_texte")} <TodoMark />
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
