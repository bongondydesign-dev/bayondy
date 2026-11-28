import { getPublishedCourses } from "@/lib/courses/queries";
import { t } from "@/lib/i18n";
import { getSiteUrl, SITE_ALTERNATE_NAMES, SITE_NAME } from "@/lib/site";

export async function GET() {
  const siteUrl = getSiteUrl();
  const courses = await getPublishedCourses();

  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${t("seo.llmsResume", "fr")}`,
    "",
    `- Official name: ${SITE_NAME}`,
    ...(SITE_ALTERNATE_NAMES.length > 0
      ? [`- Alternate name: ${SITE_ALTERNATE_NAMES.join(", ")}`]
      : []),
    "- Interface languages: French (fr, default at /), Haitian Creole (ht, at /ht)",
    "- Course instruction language: Haitian Creole (ht)",
    `- Base URL: ${siteUrl}`,
    "",
    "## Public Pages (French / Default)",
    `- [Home](${siteUrl}/): ${t("seo.titreAccueil", "fr")}`,
    `- [Courses Catalog](${siteUrl}/formations): ${t("catalogue.sousTitre", "fr")}`,
    `- [FAQ](${siteUrl}/faq): ${t("faqPage.sousTitre", "fr")}`,
    `- [About](${siteUrl}/a-propos): ${t("apropos.bioSecondaire", "fr")}`,
    `- [Terms of Service](${siteUrl}/conditions): ${t("conditions.sousTitre", "fr")}`,
    `- [Privacy Policy](${siteUrl}/confidentialite): ${t("confidentialite.sousTitre", "fr")}`,
    "",
    "## Pages publiques (Kreyòl ayisyen)",
    `- [Akèy](${siteUrl}/ht): ${t("seo.titreAccueil", "kr")}`,
    `- [Katalòg fòmasyon](${siteUrl}/ht/formations): ${t("catalogue.sousTitre", "kr")}`,
    `- [FAQ](${siteUrl}/ht/faq): ${t("faqPage.sousTitre", "kr")}`,
    `- [Konsènan](${siteUrl}/ht/a-propos): ${t("apropos.bioSecondaire", "kr")}`,
  ];

  if (courses.length > 0) {
    lines.push("", "## Published Courses");
    for (const course of courses) {
      if (!course.slug) continue;
      const summary = course.shortDescription || course.description || "";
      lines.push(
        `- [${course.title}](${siteUrl}/formations/${course.slug}) | [Kreyòl](${siteUrl}/ht/formations/${course.slug})${summary ? `: ${summary}` : ""}`
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
