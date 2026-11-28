import { getPublishedCourses } from "@/lib/courses/queries";
import { t } from "@/lib/i18n";
import { getSiteUrl, SITE_ALTERNATE_NAMES, SITE_NAME } from "@/lib/site";

export async function GET() {
  const siteUrl = getSiteUrl();
  const courses = await getPublishedCourses();

  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${t("seo.llmsResume")}`,
    "",
    `- Official name: ${SITE_NAME}`,
    `- Alternate name: ${SITE_ALTERNATE_NAMES.join(", ")}`,
    `- Primary language: Haitian Creole (ht)`,
    `- Base URL: ${siteUrl}`,
    "",
    "## Public Pages",
    `- [Home](${siteUrl}/): ${t("seo.titreAccueil")}`,
    `- [Courses Catalog](${siteUrl}/formations): ${t("catalogue.sousTitre")}`,
    `- [FAQ](${siteUrl}/faq): ${t("faqPage.sousTitre")}`,
    `- [About](${siteUrl}/a-propos): ${t("apropos.bioSecondaire")}`,
    `- [Terms of Service](${siteUrl}/conditions): ${t("conditions.sousTitre")}`,
    `- [Privacy Policy](${siteUrl}/confidentialite): ${t("confidentialite.sousTitre")}`,
  ];

  if (courses.length > 0) {
    lines.push("", "## Published Courses");
    for (const course of courses) {
      if (!course.slug) continue;
      const summary = course.shortDescription || course.description || "";
      lines.push(
        `- [${course.title}](${siteUrl}/formations/${course.slug})${summary ? `: ${summary}` : ""}`
      );
    }
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
