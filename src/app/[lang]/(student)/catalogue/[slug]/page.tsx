import React from "react";
import type { Metadata } from "next";
import {
  getCourseFreePreviewLessons,
  getPublishedCourseBySlug,
} from "@/lib/courses/queries";
import { t } from "@/lib/i18n";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";
import { StudentCourseDetailClient } from "./StudentCourseDetailClient";

export const instant = false;

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = resolvePageLang(rawLang);
  const course = await getPublishedCourseBySlug(slug);

  return buildLocalizedMetadata({
    lang,
    path: `/catalogue/${slug}`,
    title: course?.title || t("catalogueClient.titre", lang),
    description:
      course?.shortDescription ||
      course?.description ||
      t("catalogueClient.sousTitre", lang),
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function StudentCourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const initialCourse = await getPublishedCourseBySlug(slug);
  const initialPreviewLessons = initialCourse
    ? await getCourseFreePreviewLessons(initialCourse.id)
    : [];

  return (
    <StudentCourseDetailClient
      slug={slug}
      initialCourse={initialCourse}
      initialPreviewLessons={initialPreviewLessons}
    />
  );
}
