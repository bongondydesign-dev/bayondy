import type { MetadataRoute } from "next";
import { t } from "@/lib/i18n";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description: t("seo.description"),
    start_url: "/",
    display: "standalone",
    background_color: "#090B10",
    theme_color: "#FF5B22",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
