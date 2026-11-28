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
  twitterImage?: string | null;
  imageAlt?: string;
  omitImages?: boolean;
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
    twitterImage,
    imageAlt,
    omitImages = false,
  } = options;

  const routeLang = lang === "kr" ? "ht" : "fr";
  const canonicalPath = localizePath(path, lang);
  const fullTitle =
    absoluteTitle ??
    (title ? formatPageTitle(title) : t("seo.titreAccueil", lang));
  const resolvedOgImage =
    omitImages || image === null
      ? null
      : (image ?? `/${routeLang}/opengraph-image`);
  const resolvedTwitterImage =
    omitImages || twitterImage === null
      ? null
      : (twitterImage ?? image ?? `/${routeLang}/twitter-image`);
  const resolvedAlt = imageAlt ?? t("seo.ogAlt", lang);

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
      ...(resolvedOgImage
        ? {
            images: [
              {
                url: resolvedOgImage,
                width: 1200,
                height: 630,
                alt: resolvedAlt,
                type: "image/png",
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(resolvedTwitterImage
        ? {
            images: [
              {
                url: resolvedTwitterImage,
                width: 1200,
                height: 630,
                alt: resolvedAlt,
              },
            ],
          }
        : {}),
    },
  };
}
