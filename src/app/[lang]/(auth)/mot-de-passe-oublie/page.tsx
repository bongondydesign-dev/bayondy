import React from "react";
import type { Metadata } from "next";
import { t } from "@/lib/i18n";
import { buildLocalizedMetadata, resolvePageLang } from "@/lib/i18n/metadata";
import { MotDePasseOublieClient } from "./MotDePasseOublieClient";

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
    path: "/mot-de-passe-oublie",
    title: t("auth.titreMotDePasseOublie", lang),
    description: t("auth.sousTitreMotDePasseOublie", lang),
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default function MotDePasseOubliePage() {
  return <MotDePasseOublieClient />;
}
