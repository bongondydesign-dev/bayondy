import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, PlayCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Syllabus } from "@/components/course/Syllabus";
import { CoursePreviewPlayer } from "@/components/course/CoursePreviewPlayer";
import { PriceTag } from "@/components/course/PriceTag";
import { EnrollButton } from "@/components/course/EnrollButton";
import {
  getCourseFreePreviewLessons,
  getPublishedCourseBySlug,
} from "@/lib/courses/queries";
import { formatDuration } from "@/lib/courses/format";
import { isValidCoverUrl } from "@/lib/admin/cover";
import { t } from "@/lib/i18n";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";
import { localizePath } from "@/lib/i18n/routing";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const instant = false;

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

const DEFAULT_OG_IMAGE = "/assets/aistudio/rs_w_1280_e5a11620.webp";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = resolvePageLang(rawLang);
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    return {
      title: t("erreur404.titre", lang),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    course.shortDescription ||
    course.description ||
    t("catalogue.sousTitre", lang);
  const ogImage =
    isValidCoverUrl(course.coverUrl) && course.coverUrl
      ? course.coverUrl
      : DEFAULT_OG_IMAGE;

  return buildLocalizedMetadata({
    lang,
    path: `/formations/${course.slug}`,
    title: course.title,
    description,
    image: ogImage,
  });
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { lang: rawLang, slug } = await params;
  const lang = resolvePageLang(rawLang);
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const previewLessons = await getCourseFreePreviewLessons(course.id);
  const previewLessonTitles = previewLessons.map((l) => l.title);

  const durationText = formatDuration(course.durationMinutes);
  const levelKey = `catalogue.niveaux.${course.level}`;
  const languageKey = `catalogue.langues.${course.language}`;
  const courseLanguageKey = `catalogue.coursEnLangue.${course.language}`;
  const siteUrl = getSiteUrl();
  const localizedCoursePath = localizePath(`/formations/${course.slug}`, lang);
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description:
      course.shortDescription ||
      course.description ||
      t("catalogue.sousTitre", lang),
    inLanguage: course.language || "ht",
    url: `${siteUrl}${localizedCoursePath}`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    ...(isValidCoverUrl(course.coverUrl) && course.coverUrl
      ? { image: course.coverUrl }
      : {}),
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Fil d'Ariane / Retour au catalogue */}
        <div className="mb-6">
          <Link
            href={localizePath("/formations", lang)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-600 dark:text-ice-white/70 hover:text-brand-light transition-colors min-h-[44px] py-1 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            <span>{t("catalogue.retourCatalogue", lang)}</span>
          </Link>
        </div>

        {/* Layout en grille 2 colonnes sur desktop, 1 colonne sur mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Colonne principale */}
          <div className="lg:col-span-8 space-y-8">
            {/* Métadonnées épurées sans pilules ni émojis */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-ice-white/70 tabular-nums">
              <span className="text-brand-light font-semibold">
                {t(levelKey, lang)}
              </span>
              <span className="text-[var(--border-strong)]" aria-hidden="true">
                ·
              </span>
              <span className="text-ice-white font-semibold normal-case tracking-normal">
                {t(courseLanguageKey, lang)}
              </span>
              {durationText && (
                <>
                  <span
                    className="text-[var(--border-strong)]"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                    <Clock
                      className="w-3.5 h-3.5 text-brand-light"
                      aria-hidden="true"
                    />
                    <span>{durationText}</span>
                  </span>
                </>
              )}
              {course.lessonsCount > 0 && (
                <>
                  <span
                    className="text-[var(--border-strong)]"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
                    <PlayCircle
                      className="w-3.5 h-3.5 text-brand-light"
                      aria-hidden="true"
                    />
                    <span>
                      {course.lessonsCount}{" "}
                      {course.lessonsCount > 1
                        ? t("catalogue.lecons", lang)
                        : t("catalogue.leconSingulier", lang)}
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

            {/* Aperçu vidéo gratuit (si configuré) ou visuel de couverture */}
            <CoursePreviewPlayer
              courseTitle={course.title}
              coverUrl={course.coverUrl}
              previewLessons={previewLessons}
            />

            {/* Description détaillée */}
            {course.description && (
              <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                <h2 className="font-display font-semibold text-xl sm:text-2xl text-ice-white">
                  {t("catalogue.aPropos", lang)}
                </h2>
                <div className="font-sans text-base text-slate-600 dark:text-ice-white/75 leading-relaxed whitespace-pre-line">
                  {course.description}
                </div>
              </div>
            )}

            {/* Programme / Syllabus */}
            <div
              id="programme"
              className="pt-4 border-t border-[var(--border-subtle)] scroll-mt-24"
            >
              <Syllabus
                syllabus={course.syllabus}
                lang={lang}
                previewLessonTitles={previewLessonTitles}
              />
            </div>
          </div>

          {/* Colonne latérale (Carte d'inscription & Prix verre dépoli) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="relative rounded-2xl surface-glass border border-[var(--border-subtle)] p-6 sm:p-7 overflow-hidden">
              {/* Lueur ambiante discrète en haut de carte */}
              <div
                className="pointer-events-none absolute -top-20 -right-16 w-60 h-60 rounded-full opacity-35 dark:opacity-45"
                style={{
                  background:
                    "radial-gradient(circle, var(--brand-glow-soft) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />

              <div className="relative z-10 space-y-6">
                {/* En-tête Prix & Accès */}
                <div className="space-y-3 pb-5 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-medium text-slate-600 dark:text-zinc-400 uppercase tracking-[0.14em]">
                      {t("catalogue.prixLabel", lang)}
                    </span>
                    <span className="font-sans text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {t("fonctionnalites.acces.titre", lang)}
                    </span>
                  </div>

                  <PriceTag
                    priceUSD={course.priceUSD}
                    priceHTG={course.priceHTG}
                    size="lg"
                    lang={lang}
                  />
                </div>

                {/* Action principale MonCash / Inscription */}
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
                <ul className="pt-5 border-t border-[var(--border-subtle)] space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/85">
                    <span className="w-5 h-5 rounded-full bg-brand/12 border border-brand/25 text-brand-light flex items-center justify-center shrink-0">
                      <Check
                        className="w-3 h-3"
                        strokeWidth={2.6}
                        aria-hidden="true"
                      />
                    </span>
                    <span>
                      {t("catalogue.langueDuCours", lang)} : {t(languageKey, lang)}
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/85">
                    <span className="w-5 h-5 rounded-full bg-brand/12 border border-brand/25 text-brand-light flex items-center justify-center shrink-0">
                      <Check
                        className="w-3 h-3"
                        strokeWidth={2.6}
                        aria-hidden="true"
                      />
                    </span>
                    <span>{t("catalogue.atoutMobile", lang)}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-700 dark:text-ice-white/85">
                    <span className="w-5 h-5 rounded-full bg-brand/12 border border-brand/25 text-brand-light flex items-center justify-center shrink-0">
                      <Check
                        className="w-3 h-3"
                        strokeWidth={2.6}
                        aria-hidden="true"
                      />
                    </span>
                    <span>{t("catalogue.atoutRythme", lang)}</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
