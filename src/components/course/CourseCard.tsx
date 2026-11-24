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
    <article className="group relative flex flex-col rounded-2xl bg-deep-navy border border-white/[0.08] hover:border-brand/45 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--brand-glow-soft)] overflow-hidden">
      {/* Zone visuelle / Bannière */}
      <div className="relative aspect-video w-full overflow-hidden bg-obsidian border-b border-white/[0.06]">
        {course.coverUrl ? (
          <Image
            src={course.coverUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Visuel de repli en CSS (dégradé sobre vers orange) */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/15 via-obsidian to-brand-dark/10">
            <div className="absolute inset-0 bg-noise opacity-50" aria-hidden="true" />
            <PortalSymbol size={64} className="opacity-80 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}

        {/* Badge Nivo */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-obsidian/85 backdrop-blur-md border border-white/[0.1] text-ice-white/90">
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
                <svg className="w-3.5 h-3.5 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {durationText}
              </span>
            )}
            {course.lessonsCount > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.lessonsCount} {t("catalogue.lecons")}
              </span>
            )}
          </div>

          {/* Titre du cours */}
          <h2 className="font-display font-bold text-lg sm:text-xl text-ice-white group-hover:text-brand-light transition-colors tracking-tight line-clamp-2">
            <Link
              href={`/formations/${course.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg"
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
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <PriceTag priceUSD={course.priceUSD} priceHTG={course.priceHTG} size="sm" />

          <Link
            href={`/formations/${course.slug}`}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-full bg-[#13151B] border border-white/[0.1] group-hover:border-brand/50 text-ice-white group-hover:text-brand-light text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap"
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
