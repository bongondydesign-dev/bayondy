import React from "react";
import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";
import { InscriptionClient } from "./InscriptionClient";

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
    path: "/inscription",
    title: t("auth.inscription", lang),
    description: t("auth.sousTitreInscription", lang),
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function InscriptionPage() {
  return <InscriptionClient />;
}
