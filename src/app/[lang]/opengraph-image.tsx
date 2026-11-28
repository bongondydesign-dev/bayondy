import { t } from "@/lib/i18n";
import { routeLangToAppLang } from "@/lib/i18n/config";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderDefaultOgImage,
} from "@/lib/og/renderOgImage";

export const alt = t("seo.ogAlt", "kr");
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const appLang = routeLangToAppLang(rawLang) ?? "kr";
  return renderDefaultOgImage(appLang);
}
