import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/course/CourseCard";
import { getPublishedCourses } from "@/lib/courses/queries";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("catalogue.titre")} | BAYONDY`,
  description: t("catalogue.sousTitre"),
};

export default async function FormationsPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white selection:bg-ion-blue/30 selection:text-aurora overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* En-tête du catalogue */}
        <div className="max-w-2xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-navy border border-white/10 text-aurora font-mono text-xs uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora animate-pulse" />
            {t("catalogue.badge")}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-4">
            {t("catalogue.titre")}
          </h1>
          <p className="font-sans text-base sm:text-lg text-ice-white/70 leading-relaxed">
            {t("catalogue.sousTitre")}
          </p>
        </div>

        {/* Grille de formations ou état vide */}
        {courses.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-deep-navy/40 border border-white/10 my-8">
            <div className="w-16 h-16 rounded-2xl bg-deep-navy border border-white/10 flex items-center justify-center mb-6 text-aurora shadow-lg shadow-aurora/5">
              <PortalSymbol size={36} className="opacity-80" />
            </div>
            <h2 className="font-sans font-semibold text-xl sm:text-2xl text-white mb-2">
              {t("catalogue.vide")}
            </h2>
            <p className="font-sans text-sm sm:text-base text-ice-white/60 max-w-md mx-auto leading-relaxed">
              {t("catalogue.videDescription")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
