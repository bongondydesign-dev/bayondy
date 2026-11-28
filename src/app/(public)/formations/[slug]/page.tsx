import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, PlayCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Syllabus } from "@/components/course/Syllabus";
import { PriceTag } from "@/components/course/PriceTag";
import { EnrollButton } from "@/components/course/EnrollButton";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { getPublishedCourseBySlug } from "@/lib/courses/queries";
import { formatDuration } from "@/lib/courses/format";
import { t } from "@/lib/i18n";

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    return {
      title: `${t("erreur404.titre")} | BAYONDY`,
    };
  }

  return {
    title: `${course.title} | BAYONDY`,
    description: course.shortDescription || course.description || t("catalogue.sousTitre"),
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const durationText = formatDuration(course.durationMinutes);
  const levelKey = `catalogue.niveaux.${course.level}`;
  const languageKey = `catalogue.langues.${course.language}`;

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Fil d'Ariane / Retour au catalogue */}
        <div className="mb-6">
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-600 dark:text-ice-white/70 hover:text-brand-light transition-colors min-h-[44px] py-1 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            <span>{t("catalogue.retourCatalogue")}</span>
          </Link>
        </div>

        {/* Layout en grille 2 colonnes sur desktop, 1 colonne sur mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Colonne principale */}
          <div className="lg:col-span-8 space-y-8">
            {/* Métadonnées épurées sans pilules ni émojis */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-ice-white/70 tabular-nums">
              <span className="text-brand-light font-semibold">{t(levelKey)}</span>
              <span className="text-[var(--border-strong)]" aria-hidden="true">·</span>
              <span>{t(languageKey)}</span>
              {durationText && (
                <>
                  <span className="text-[var(--border-strong)]" aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                    <Clock className="w-3.5 h-3.5 text-brand-light" aria-hidden="true" />
                    <span>{durationText}</span>
                  </span>
                </>
              )}
              {course.lessonsCount > 0 && (
                <>
                  <span className="text-[var(--border-strong)]" aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                    <PlayCircle className="w-3.5 h-3.5 text-brand-light" aria-hidden="true" />
                    <span>
                      {course.lessonsCount}{" "}
                      {course.lessonsCount > 1
                        ? t("catalogue.lecons")
                        : t("catalogue.leconSingulier")}
                    </span>
                  </span>
                </>
              )}
            </div>

            {/* Titre unique H1 */}
            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-ice-white leading-tight text-balance">
              {course.title}
            </h1>

            {/* Description courte introductive */}
            {course.shortDescription && (
              <p className="font-sans text-lg sm:text-xl text-slate-600 dark:text-ice-white/80 leading-relaxed">
                {course.shortDescription}
              </p>
            )}

            {/* Visuel principal ou Repli CSS stylisé */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[var(--surface-well)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
              {course.coverUrl ? (
                <Image
                  src={course.coverUrl}
                  alt={course.title}
                  fill
                  priority
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-well)]">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-45 dark:opacity-85"
                    style={{
                      background:
                        "radial-gradient(circle at 80% 20%, var(--brand-glow) 0%, var(--brand-glow-soft) 45%, transparent 72%)",
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-noise opacity-35 dark:opacity-50" aria-hidden="true" />
                  <PortalSymbol size={80} className="relative z-10 opacity-90" />
                  <span className="relative z-10 mt-4 font-mono text-xs tracking-wider uppercase text-slate-500 dark:text-slate-300/60">
                    BAYONDY
                  </span>
                </div>
              )}
            </div>

            {/* Description détaillée */}
            {course.description && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
                  {t("catalogue.aPropos")}
                </h2>
                <div className="font-sans text-base text-slate-600 dark:text-ice-white/75 leading-relaxed whitespace-pre-line">
                  {course.description}
                </div>
              </div>
            )}

            {/* Programme / Syllabus */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <Syllabus syllabus={course.syllabus} />
            </div>
          </div>

          {/* Colonne latérale (Carte d'inscription & Prix verre dépoli) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-2xl surface-glass border border-[var(--border-subtle)] p-6 sm:p-7 space-y-6">
              <div>
                <span className="block font-mono text-xs text-slate-500 dark:text-ice-white/60 uppercase tracking-wider mb-2">
                  Pri
                </span>
                <PriceTag
                  priceUSD={course.priceUSD}
                  priceHTG={course.priceHTG}
                  size="lg"
                />
              </div>

              <div>
                <EnrollButton
                  courseId={course.id}
                  courseSlug={course.slug}
                  courseTitle={course.title}
                  priceUSD={course.priceUSD}
                  priceHTG={course.priceHTG}
                />
              </div>

              {/* Récapitulatif des atouts de la formation */}
              <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3.5">
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/80">
                  <span className="w-5 h-5 rounded-full bg-brand/15 text-brand-light flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span>{t("catalogue.atoutLangue")} {t(languageKey)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/80">
                  <span className="w-5 h-5 rounded-full bg-brand/15 text-brand-light flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span>{t("catalogue.atoutMobile")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/80">
                  <span className="w-5 h-5 rounded-full bg-brand/15 text-brand-light flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span>{t("catalogue.atoutRythme")}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
