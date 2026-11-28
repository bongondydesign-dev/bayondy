import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/styles/theme.css";
import { fontClassNames } from "@/lib/layout/fonts";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme";
import { AmbientBackdrop } from "@/components/layout/AmbientBackdrop";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import {
  appLangToHtmlLang,
  appLangToOgLocale,
  routeLangToAppLang,
} from "@/lib/i18n/config";
import { buildLanguageAlternates } from "@/lib/i18n/metadata";
import { localizePath } from "@/lib/i18n/routing";
import { t } from "@/lib/i18n";
import {
  getSiteUrl,
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  SITE_TITLE_TEMPLATE,
} from "@/lib/site";

export async function generateStaticParams() {
  return [{ lang: "fr" }, { lang: "ht" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const appLang = routeLangToAppLang(rawLang);
  const siteUrl = getSiteUrl();

  if (!appLang) {
    return {
      metadataBase: new URL(siteUrl),
      applicationName: SITE_NAME,
      title: t("erreur404.titre", "fr"),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const defaultTitle = t("seo.titreAccueil", appLang);
  const defaultDescription = t("seo.description", appLang);
  const canonicalPath = localizePath("/", appLang);

  return {
    metadataBase: new URL(siteUrl),
    applicationName: SITE_NAME,
    title: {
      default: defaultTitle,
      template: SITE_TITLE_TEMPLATE,
    },
    description: defaultDescription,
    alternates: {
      canonical: canonicalPath,
      languages: buildLanguageAlternates("/"),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: defaultTitle,
      description: defaultDescription,
      locale: appLangToOgLocale(appLang),
      alternateLocale: appLang === "fr" ? ["ht_HT"] : ["fr_FR"],
      url: canonicalPath,
      images: [
        {
          url: "/assets/aistudio/rs_w_1280_e5a11620.webp",
          width: 1280,
          height: 720,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: ["/assets/aistudio/rs_w_1280_e5a11620.webp"],
    },
  };
}

export default async function RootLangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: rawLang } = await params;
  const appLang = routeLangToAppLang(rawLang);
  if (!appLang) {
    notFound();
  }

  const htmlLang = appLangToHtmlLang(appLang);
  const siteUrl = getSiteUrl();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: siteUrl,
    inLanguage: htmlLang,
  };

  return (
    <html
      lang={htmlLang}
      suppressHydrationWarning
      className={`dark ${fontClassNames}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-obsidian text-ice-white font-sans antialiased flex flex-col relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <MotionProvider>
          <ThemeProvider>
            <AuthProvider>
              <I18nProvider lang={appLang}>
                <AmbientBackdrop />
                <div className="relative z-10 min-h-screen flex flex-col">
                  {children}
                </div>
                <Suspense fallback={null}>
                  <WhatsAppButton />
                </Suspense>
              </I18nProvider>
            </AuthProvider>
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
