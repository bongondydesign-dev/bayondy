"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicCourse } from "@/types/firestore";
import { formatDuration } from "@/lib/courses/format";
import { PriceTag } from "./PriceTag";
import { CoverImage } from "@/components/ui/CoverImage";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface CourseCardProps {
  course: PublicCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  const { lang, t, localize } = useI18n();
  const courseHref = localize(`/formations/${course.slug}`);
  const durationText = formatDuration(course.durationMinutes);
  const levelLabel = course.level ? t(`catalogue.niveaux.${course.level}`) : "";
  const courseLanguageLabel = course.language
    ? t(`catalogue.coursEnLangue.${course.language}`)
    : "";
  const hasLessonsCount =
    typeof course.lessonsCount === "number" && course.lessonsCount > 0;
  const lessonsLabel = hasLessonsCount
    ? `${course.lessonsCount} ${
        course.lessonsCount > 1
          ? t("catalogue.lecons")
          : t("catalogue.leconSingulier")
      }`
    : "";

  const metaParts = [
    levelLabel,
    courseLanguageLabel,
    durationText,
    lessonsLabel,
  ].filter(Boolean);

  return (
    <article className="group relative flex flex-col rounded-2xl surface-glass border border-[var(--border-subtle)] hover:border-brand/45 hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      {/* Couverture 16:9 avec repli BAYONDY */}
      <Link
        href={courseHref}
        tabIndex={-1}
        aria-hidden="true"
        className="border-b border-[var(--border-subtle)] block"
      >
        <CoverImage
          src={course.coverUrl}
          alt={course.coverUrl ? `${t("catalogue.couvertureAlt")} ${course.title}` : ""}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          imageClassName="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          accent="ion"
          symbolSize={60}
        />
      </Link>

      {/* Contenu de la carte */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
        <div>
          {metaParts.length > 0 && (
            <p className="font-mono text-xs text-slate-600 dark:text-ice-white/60 tabular-nums mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
              {metaParts.map((part, idx) => (
                <React.Fragment key={`${part}-${idx}`}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <span>{part}</span>
                </React.Fragment>
              ))}
            </p>
          )}

          <h3 className="font-display font-bold text-lg sm:text-xl text-ice-white group-hover:text-brand-light transition-colors tracking-tight line-clamp-2">
            <Link
              href={courseHref}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-md"
            >
              {course.title}
            </Link>
          </h3>

          {course.shortDescription && (
            <p className="mt-2 text-sm text-slate-700 dark:text-ice-white/70 font-sans line-clamp-2 leading-relaxed">
              {course.shortDescription}
            </p>
          )}
        </div>

        {/* Pied de carte : Prix et hiérarchie d'action claire */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] space-y-4">
          <PriceTag
            priceUSD={course.priceUSD}
            priceHTG={course.priceHTG}
            size="sm"
            lang={lang}
          />

          <div className="flex items-center gap-2.5">
            <Link
              href={courseHref}
              className="flex-1 inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-full bg-white dark:bg-[#141720] border border-[var(--border-strong)] dark:border-white/15 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.10)] dark:shadow-none hover:border-[var(--home-orange-vivid)]/70 hover:bg-slate-50 dark:hover:bg-[#1A1E29] text-ice-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              aria-label={`${t("catalogue.gadeFormasyon")} — ${course.title}`}
            >
              {t("catalogue.gadeFormasyon")}
            </Link>

            <Link
              href={courseHref}
              className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full bg-gradient-to-b from-[#FF5E24] to-brand hover:brightness-105 text-[var(--brand-fg)] text-xs sm:text-sm font-semibold transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_6px_18px_-4px_var(--brand-glow)] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              aria-label={`${t("catalogue.boutonInscrire")} — ${course.title}`}
            >
              <span>{t("catalogue.boutonInscrire")}</span>
              <ArrowRight
                className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CourseCard;
