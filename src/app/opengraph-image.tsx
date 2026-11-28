import { t } from "@/lib/i18n";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderDefaultOgImage,
} from "@/lib/og/renderOgImage";

export const alt = t("seo.ogAlt", "kr");
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return renderDefaultOgImage("kr");
}
