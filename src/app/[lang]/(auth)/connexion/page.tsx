import React from "react";
import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";
import { ConnexionClient } from "./ConnexionClient";

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
    path: "/connexion",
    title: t("auth.connexion", lang),
    description: t("auth.sousTitreConnexion", lang),
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function ConnexionPage() {
  return <ConnexionClient />;
}
