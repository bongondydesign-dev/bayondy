import type { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/courses/queries";
import { LEGAL_DRAFT } from "@/lib/legal/config";
import { getSiteUrl } from "@/lib/site";

function buildBilingualEntries(
  siteUrl: string,
  basePath: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
  priority: number
): MetadataRoute.Sitemap {
  const frUrl = `${siteUrl}${basePath === "/" ? "/" : basePath}`;
  const htUrl = `${siteUrl}${basePath === "/" ? "/ht" : `/ht${basePath}`}`;
  const languages = {
    fr: frUrl,
    ht: htUrl,
  };

  return [
    {
      url: frUrl,
      changeFrequency,
      priority,
      alternates: { languages },
    },
    {
      url: htUrl,
      changeFrequency,
      priority,
      alternates: { languages },
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    ...buildBilingualEntries(siteUrl, "/", "weekly", 1.0),
    ...buildBilingualEntries(siteUrl, "/formations", "weekly", 0.9),
    ...buildBilingualEntries(siteUrl, "/faq", "monthly", 0.7),
    ...buildBilingualEntries(siteUrl, "/a-propos", "monthly", 0.7),
    ...(LEGAL_DRAFT
      ? []
      : [
          ...buildBilingualEntries(siteUrl, "/conditions", "yearly", 0.3),
          ...buildBilingualEntries(siteUrl, "/confidentialite", "yearly", 0.3),
        ]),
  ];

  const courses = await getPublishedCourses();
  const courseRoutes: MetadataRoute.Sitemap = courses
    .filter((course) => Boolean(course.slug))
    .flatMap((course) =>
      buildBilingualEntries(siteUrl, `/formations/${course.slug}`, "weekly", 0.8)
    );

  return [...staticRoutes, ...courseRoutes];
}
