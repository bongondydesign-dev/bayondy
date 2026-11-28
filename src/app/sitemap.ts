import type { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/courses/queries";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/formations`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/a-propos`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/conditions`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/confidentialite`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const courses = await getPublishedCourses();
  const courseRoutes: MetadataRoute.Sitemap = courses
    .filter((course) => Boolean(course.slug))
    .map((course) => ({
      url: `${siteUrl}/formations/${course.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...courseRoutes];
}
