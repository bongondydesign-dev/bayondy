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
import { getSiteUrl, SITE_ALTERNATE_NAMES, SITE_NAME } from "@/lib/site";

const homeTitle = t("seo.titreAccueil");
const homeDescription = t("seo.description");

export const metadata: Metadata = {
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: homeTitle,
    description: homeDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: homeDescription,
  },
};

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: siteUrl,
    description: homeDescription,
    inLanguage: "ht",
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
        <Hero />

        {/* 3. Phrase d'affirmation cinématique */}
        <Affirmation />

        {/* 4. Grille bento "Tout ce dont tu as besoin" */}
        <Features />

        {/* 5. Section "Kijan l mache" avec ligne lumineuse */}
        <HowItWorks />

        {/* 6. Formation à la une */}
        <FeaturedCourse />

        {/* 7. Tarifs */}
        <Pricing />

        {/* 8. FAQ avec "+" rotatif */}
        <Faq />

        {/* 9. Appel final avec fond de lignes ondulées */}
        <FinalCta />
      </main>

      {/* 10. Footer avec colonnes et mot BAYONDY géant */}
      <Footer />
    </div>
  );
}
