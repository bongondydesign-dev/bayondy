import React from "react";
import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";
import { MesFormationsClient } from "./MesFormationsClient";

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
    path: "/mes-formations",
    title: t("mesFormations.titre", lang),
    description: t("mesFormations.sousTitre", lang),
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function MesFormationsPage() {
  return <MesFormationsClient />;
}
