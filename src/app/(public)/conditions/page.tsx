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
  title: `${t("conditions.titre")} | BAYONDY`,
  description: t("conditions.sousTitre"),
};

export default function ConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <LegalDraftNotice />

        <header className="mb-10 sm:mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-light mb-4">
            {t("conditions.badge")}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ice-white leading-tight">
            {t("conditions.titre")}
          </h1>
          <p className="mt-4 font-sans text-base sm:text-lg text-slate-700 dark:text-ice-white/75 leading-relaxed">
            {t("conditions.sousTitre")}
          </p>
        </header>

        <article className="space-y-8 font-sans text-sm sm:text-base text-slate-800 dark:text-ice-white/80 leading-relaxed">
          {/* 1. Objet du service */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s1_titre")}
            </h2>
            <p>{t("conditions.s1_texte")}</p>
          </section>

          {/* 2. Compte */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s2_titre")}
            </h2>
            <p>{t("conditions.s2_texte")}</p>
          </section>

          {/* 3. Achat et accès */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s3_titre")}
            </h2>
            <p>
              {t("conditions.s3_texte")} <TodoMark />
            </p>
          </section>

          {/* 4. Remboursements */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s4_titre")}
            </h2>
            <p>
              {t("conditions.s4_texte")} <TodoMark />
            </p>
          </section>

          {/* 5. Utilisation acceptable */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s5_titre")}
            </h2>
            <p>{t("conditions.s5_texte")}</p>
          </section>

          {/* 6. Propriété intellectuelle */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s6_titre")}
            </h2>
            <p>{t("conditions.s6_texte")}</p>
          </section>

          {/* 7. Suspension de l'accès */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s7_titre")}
            </h2>
            <p>{t("conditions.s7_texte")}</p>
          </section>

          {/* 8. Disponibilité */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s8_titre")}
            </h2>
            <p>{t("conditions.s8_texte")}</p>
          </section>

          {/* 9. Droit applicable et litiges */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s9_titre")}
            </h2>
            <p>
              {t("conditions.s9_texte")} <TodoMark />
            </p>
          </section>

          {/* 10. Contact et date de mise à jour */}
          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
              {t("conditions.s10_titre")}
            </h2>
            <p>
              {t("conditions.s10_texte")} <TodoMark />
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
