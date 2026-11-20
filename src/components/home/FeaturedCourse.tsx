import React from "react";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

export function FeaturedCourse() {
  return (
    <section className="w-full py-20 sm:py-32 border-t border-white/5 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl sm:rounded-3xl bg-deep-navy border border-white/10 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl hover:border-aurora/30 transition-colors">
          {/* Lueur d'ambiance en arrière-plan */}
          <div
            className="absolute -top-32 -right-32 w-80 h-80 bg-aurora/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -left-32 w-80 h-80 bg-ion-blue/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-obsidian border border-aurora/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-aurora animate-pulse" />
            <span className="font-mono text-xs text-aurora uppercase tracking-wider">
              {t("une.badge")}
            </span>
          </div>

          {/* Titre */}
          <h2 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl text-ice-white tracking-tight max-w-2xl mx-auto leading-tight">
            {t("une.titre")}
          </h2>

          {/* Description */}
          <p className="mt-4 text-base sm:text-lg text-ice-white/70 max-w-xl mx-auto leading-relaxed font-sans">
            {t("une.description")}
          </p>

          {/* Bouton vers /formations */}
          <div className="mt-8 sm:mt-10 flex justify-center">
            <Button href="/formations" variant="principal">
              {t("une.cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCourse;
