import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Affirmation } from "@/components/home/Affirmation";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedCourse } from "@/components/home/FeaturedCourse";
import { Pricing } from "@/components/home/Pricing";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { t } from "@/lib/i18n";
import { appLangToHtmlLang } from "@/lib/i18n/config";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";
import { localizePath } from "@/lib/i18n/routing";
import { getSiteUrl, SITE_ALTERNATE_NAMES, SITE_NAME } from "@/lib/site";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = resolvePageLang(rawLang);

  return buildLocalizedMetadata({
    lang,
    path: "/",
    absoluteTitle: t("seo.titreAccueil", lang),
    description: t("seo.description", lang),
  });
}

export default async function HomePage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang = resolvePageLang(rawLang);
  const siteUrl = getSiteUrl();
  const localizedPath = localizePath("/", lang);
  const websiteUrl =
    localizedPath === "/" ? siteUrl : `${siteUrl}${localizedPath}`;

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: websiteUrl,
    description: t("seo.description", lang),
    inLanguage: appLangToHtmlLang(lang),
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* 1. Navbar fine */}
      <Navbar />

      <main className="flex-1 flex flex-col home-orange selection:bg-[var(--home-orange)]/30 selection:text-[var(--home-orange-light)]">
        {/* 2. Hero centré avec symbole B-Portail & mockup vidéo */}
        <Hero lang={lang} />

        {/* 3. Phrase d'affirmation cinématique */}
        <Affirmation lang={lang} />

        {/* 4. Grille bento "Tout ce dont tu as besoin" */}
        <Features lang={lang} />

        {/* 5. Section "Kijan l mache" avec ligne lumineuse */}
        <HowItWorks lang={lang} />

        {/* 6. Formation à la une */}
        <FeaturedCourse lang={lang} />

        {/* 7. Tarifs */}
        <Pricing lang={lang} />

        {/* 8. FAQ avec "+" rotatif */}
        <Faq lang={lang} />

        {/* 9. Appel final avec fond de lignes ondulées */}
        <FinalCta lang={lang} />
      </main>

      {/* 10. Footer avec colonnes et mot BAYONDY géant */}
      <Footer />
    </div>
  );
}
