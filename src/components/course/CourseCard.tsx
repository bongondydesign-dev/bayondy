import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicCourse } from "@/types/firestore";
import { formatDuration } from "@/lib/courses/format";
import { PriceTag } from "./PriceTag";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { t } from "@/lib/i18n";

interface CourseCardProps {
  course: PublicCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  const durationText = formatDuration(course.durationMinutes);
  const levelKey = `catalogue.niveaux.${course.level}`;

  return (
    <article className="group relative flex flex-col rounded-3xl bg-deep-navy border border-white/10 hover:border-aurora/40 transition-all duration-300 hover:shadow-2xl hover:shadow-ion-blue/10 overflow-hidden">
      {/* Zone visuelle / Bannière */}
      <div className="relative aspect-video w-full overflow-hidden bg-obsidian border-b border-white/5">
        {course.coverUrl ? (
          <Image
            src={course.coverUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Visuel de repli en CSS (dégradé cinématique Ion Blue vers Aurora) */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ion-blue/20 via-obsidian to-aurora/10">
            <div className="absolute inset-0 bg-noise opacity-50" aria-hidden="true" />
            <PortalSymbol size={64} className="opacity-75 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}

        {/* Badge Nivo */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-obsidian/80 backdrop-blur-md border border-white/10 text-ice-white/90">
            {t(levelKey)}
          </span>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Métadonnées : durée et nombre de leçons */}
          <div className="flex items-center gap-3 text-xs font-mono text-ice-white/60 mb-2.5">
            {durationText && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-aurora" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {durationText}
              </span>
            )}
            {course.lessonsCount > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-ion-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.lessonsCount} {t("catalogue.lecons")}
              </span>
            )}
          </div>

          {/* Titre du cours */}
          <h2 className="font-display font-bold text-lg sm:text-xl text-ice-white group-hover:text-aurora transition-colors tracking-tight line-clamp-2">
            <Link
              href={`/formations/${course.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora rounded-lg"
            >
              {course.title}
            </Link>
          </h2>

          {/* Description courte */}
          {course.shortDescription && (
            <p className="mt-2 text-sm text-ice-white/70 font-sans line-clamp-2 leading-relaxed">
              {course.shortDescription}
            </p>
          )}
        </div>

        {/* Pied de carte : Prix et bouton d'action */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
          <PriceTag priceUSD={course.priceUSD} priceHTG={course.priceHTG} size="sm" />

          <Link
            href={`/formations/${course.slug}`}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-obsidian border border-white/10 group-hover:border-aurora/40 text-ice-white group-hover:text-aurora text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora"
            aria-label={`${t("catalogue.gadeFormasyon")} : ${course.title}`}
          >
            {t("catalogue.gadeFormasyon")}
            <svg className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
