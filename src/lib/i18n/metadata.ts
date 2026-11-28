import type { Metadata } from "next";
import { t } from "./index";
import {
  AppLang,
  appLangToOgLocale,
  routeLangToAppLang,
} from "./config";
import { localizePath } from "./routing";
import {
  formatPageTitle,
  SITE_NAME,
} from "@/lib/site";

export function resolvePageLang(rawLang: string): AppLang {
  return routeLangToAppLang(rawLang) ?? "fr";
}

export function buildLanguageAlternates(basePath: string) {
  const frPath = localizePath(basePath, "fr");
  const htPath = localizePath(basePath, "kr");

  return {
    fr: frPath,
    ht: htPath,
    "x-default": frPath,
  };
}

export function buildLocalizedMetadata(options: {
  lang: AppLang;
  path: string;
  title?: string;
  absoluteTitle?: string;
  description: string;
  robots?: Metadata["robots"];
  ogType?: "website" | "article";
  image?: string | null;
}): Metadata {
  const {
    lang,
    path,
    title,
    absoluteTitle,
    description,
    robots,
    ogType = "website",
    image,
  } = options;

  const canonicalPath = localizePath(path, lang);
  const fullTitle =
    absoluteTitle ??
    (title ? formatPageTitle(title) : t("seo.titreAccueil", lang));

  const ogImage = image || "/assets/aistudio/rs_w_1280_e5a11620.webp";

  return {
    title: absoluteTitle
      ? { absolute: absoluteTitle }
      : title ?? t("seo.titreAccueil", lang),
    description,
    alternates: {
      canonical: canonicalPath,
      languages: buildLanguageAlternates(path),
    },
    ...(robots ? { robots } : {}),
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      locale: appLangToOgLocale(lang),
      alternateLocale: lang === "fr" ? ["ht_HT"] : ["fr_FR"],
      url: canonicalPath,
      images: [
        {
          url: ogImage,
          width: 1280,
          height: 720,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
