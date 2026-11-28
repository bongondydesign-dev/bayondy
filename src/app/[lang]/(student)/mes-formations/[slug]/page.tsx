import React, { Suspense } from "react";
import type { Metadata } from "next";
import { PlayerView } from "@/components/player/PlayerView";
import { t } from "@/lib/i18n";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";

export const instant = false;

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = resolvePageLang(rawLang);

  return buildLocalizedMetadata({
    lang,
    path: `/mes-formations/${slug}`,
    title: t("mesFormations.titre", lang),
    description: t("mesFormations.sousTitre", lang),
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function StudentPlayerPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-transparent text-ice-white">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlayerView slug={slug} />
    </Suspense>
  );
}
