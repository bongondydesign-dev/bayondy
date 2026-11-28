import React from "react";
import type { Metadata } from "next";
import { getPublishedCourses } from "@/lib/courses/queries";
import { t } from "@/lib/i18n";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";
import { StudentCatalogueClient } from "./StudentCatalogueClient";

export const instant = false;

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = resolvePageLang(rawLang);

  return buildLocalizedMetadata({
    lang,
    path: "/catalogue",
    title: t("catalogueClient.titre", lang),
    description: t("catalogueClient.sousTitre", lang),
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function StudentCataloguePage() {
  const initialCourses = await getPublishedCourses();

  return <StudentCatalogueClient initialCourses={initialCourses} />;
}
