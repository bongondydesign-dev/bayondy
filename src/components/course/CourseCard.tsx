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
  const levelLabel = course.level ? t(`catalogue.niveaux.${course.level}`) : "";
  const hasLessonsCount =
    typeof course.lessonsCount === "number" && course.lessonsCount > 0;
  const lessonsLabel = hasLessonsCount
    ? `${course.lessonsCount} ${
        course.lessonsCount > 1
          ? t("catalogue.lecons")
          : t("catalogue.leconSingulier")
      }`
    : "";

  const metaParts = [levelLabel, durationText, lessonsLabel].filter(Boolean);

  return (
    <article className="group relative flex flex-col rounded-2xl bg-deep-navy border border-[var(--border-subtle)] hover:border-brand/40 shadow-[var(--card-shadow)] transition-all duration-200 overflow-hidden">
      {/* Couverture 16:9 avec repli BAYONDY */}
      <Link
        href={`/formations/${course.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-video w-full overflow-hidden bg-[var(--surface-well)] border-b border-[var(--border-faint)] block"
      >
        {course.coverUrl ? (
          <Image
            src={course.coverUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            referrerPolicy="no-referrer"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-well)]">
            <div
              className="absolute inset-0 pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle at 80% 20%, var(--brand-glow) 0%, var(--brand-glow-soft) 45%, transparent 72%)",
              }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-noise opacity-45" aria-hidden="true" />
            <PortalSymbol
              accent="brand"
              size={60}
              className="relative z-10 opacity-90 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </Link>

      {/* Contenu de la carte */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {/* Métadonnées sobres sans pastilles */}
          {metaParts.length > 0 && (
            <p className="font-mono text-xs text-ice-white/60 tabular-nums mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              {metaParts.map((part, idx) => (
                <React.Fragment key={`${part}-${idx}`}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <span>{part}</span>
                </React.Fragment>
              ))}
            </p>
          )}

          {/* Titre du cours */}
          <h3 className="font-display font-bold text-lg sm:text-xl text-ice-white group-hover:text-brand-light transition-colors tracking-tight line-clamp-2">
            <Link
              href={`/formations/${course.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-md"
            >
              {course.title}
            </Link>
          </h3>

          {/* Description courte (2 lignes max) */}
          {course.shortDescription && (
            <p className="mt-2 text-sm text-ice-white/70 font-sans line-clamp-2 leading-relaxed">
              {course.shortDescription}
            </p>
          )}
        </div>

        {/* Pied de carte : Prix et hiérarchie d'action claire */}
        <div className="mt-6 pt-4 border-t border-[var(--border-faint)] space-y-4">
          <PriceTag
            priceUSD={course.priceUSD}
            priceHTG={course.priceHTG}
            size="sm"
          />

          <div className="flex items-center gap-2.5">
            <Link
              href={`/formations/${course.slug}`}
              className="flex-1 inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-full bg-[var(--surface-well)] border border-[var(--border-strong)] hover:border-brand/45 text-ice-white/85 hover:text-ice-white text-xs sm:text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              aria-label={`${t("catalogue.gadeFormasyon")} — ${course.title}`}
            >
              {t("catalogue.gadeFormasyon")}
            </Link>

            <Link
              href={`/formations/${course.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] text-xs sm:text-sm font-semibold transition-all duration-200 shadow-lg shadow-[var(--brand-glow)] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              aria-label={`${t("catalogue.boutonInscrire")} — ${course.title}`}
            >
              <span>{t("catalogue.boutonInscrire")}</span>
              <svg
                className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M5 12h14m-6-6l6 6-6 6"
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
