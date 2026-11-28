import { getPublishedCourseBySlug } from "@/lib/courses/queries";
import { t } from "@/lib/i18n";
import { routeLangToAppLang } from "@/lib/i18n/config";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderCourseOgImage,
  renderDefaultOgImage,
} from "@/lib/og/renderOgImage";

export const alt = t("seo.ogAlt", "kr");
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function CourseOpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  const appLang = routeLangToAppLang(rawLang) ?? "kr";
  const course = await getPublishedCourseBySlug(slug);

  if (!course) {
    return renderDefaultOgImage(appLang);
  }

  return renderCourseOgImage({
    title: course.title,
    lang: appLang,
    coverUrl: course.coverUrl,
  });
}
