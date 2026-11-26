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
  const levelKey = course.level ? `catalogue.niveaux.${course.level}` : "";
  const hasLessonsCount =
    typeof course.lessonsCount === "number" && course.lessonsCount > 0;

  return (
    <article className="group relative flex flex-col rounded-2xl bg-[#14243B]/70 border border-white/[0.09] hover:border-[#2864FF]/55 transition-all duration-300 hover:shadow-2xl hover:shadow-[#2864FF]/15 overflow-hidden">
      {/* Couverture 16:9 avec dimensions réservées */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#080B14] border-b border-white/[0.07]">
        {course.coverUrl ? (
          <Image
            src={course.coverUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            referrerPolicy="no-referrer"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Repli en dégradé CSS Ion Blue vers Aurora */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2864FF]/30 via-[#080B14] to-[#37D6D0]/25">
            <div className="absolute inset-0 bg-noise opacity-45" aria-hidden="true" />
            <PortalSymbol
              accent="ion"
              size={64}
              className="opacity-85 transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Pastilles de métadonnées (niveau, durée, nombre de leçons : seulement si la donnée existe) */}
          {(levelKey || durationText || hasLessonsCount) && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {levelKey && (
                <span className="inline-flex items-center font-mono text-xs uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#080B14]/85 border border-[#2864FF]/35 text-[#37D6D0]">
                  {t(levelKey)}
                </span>
              )}
              {durationText && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full bg-[#080B14]/75 border border-white/[0.1] text-[#E8EDF5]/85">
                  <svg
                    className="w-3.5 h-3.5 text-[#37D6D0]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {durationText}
                </span>
              )}
              {hasLessonsCount && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-full bg-[#080B14]/75 border border-white/[0.1] text-[#E8EDF5]/85">
                  <svg
                    className="w-3.5 h-3.5 text-[#2864FF]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {course.lessonsCount}{" "}
                  {course.lessonsCount > 1
                    ? t("catalogue.lecons")
                    : t("catalogue.leconSingulier")}
                </span>
              )}
            </div>
          )}

          {/* Titre du cours */}
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#E8EDF5] group-hover:text-[#37D6D0] transition-colors tracking-tight line-clamp-2">
            <Link
              href={`/formations/${course.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37D6D0] rounded-lg"
            >
              {course.title}
            </Link>
          </h2>

          {/* Description courte (2 lignes max) */}
          {course.shortDescription && (
            <p className="mt-2 text-sm text-[#E8EDF5]/75 font-sans line-clamp-2 leading-relaxed">
              {course.shortDescription}
            </p>
          )}
        </div>

        {/* Pied de carte : Prix et 2 boutons d'action vers /formations/[slug] */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-4">
          <PriceTag
            priceUSD={course.priceUSD}
            priceHTG={course.priceHTG}
            size="sm"
            variant="catalog"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href={`/formations/${course.slug}`}
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-full bg-[#080B14] border border-white/[0.14] hover:border-[#37D6D0]/60 text-[#E8EDF5] hover:text-[#37D6D0] text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37D6D0] text-center"
              aria-label={`${t("catalogue.gadeFormasyon")} — ${course.title}`}
            >
              {t("catalogue.gadeFormasyon")}
            </Link>

            <Link
              href={`/formations/${course.slug}`}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full bg-[#2864FF] hover:bg-[#3B74FF] text-white text-xs sm:text-sm font-semibold transition-colors shadow-lg shadow-[#2864FF]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37D6D0] text-center"
              aria-label={`${t("catalogue.boutonInscrire")} — ${course.title}`}
            >
              <span>{t("catalogue.boutonInscrire")}</span>
              <svg
                className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
