import React from "react";
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

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
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
