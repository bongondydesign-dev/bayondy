import React from "react";
import type { Metadata, Viewport } from "next";
import "@/styles/theme.css";
import { fontClassNames } from "@/lib/layout/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme";
import { GlobalNotFoundContent } from "@/components/layout/GlobalNotFoundContent";
import { LANG_COOKIE_NAME } from "@/lib/i18n/config";
import { t } from "@/lib/i18n";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

const NOT_FOUND_LANG_SCRIPT = `(function(){try{var p=window.location.pathname||"/";if(p==="/ht"||p.indexOf("/ht/")===0||((p==="/admin"||p.indexOf("/admin/")===0)&&/(?:^|;\\s*)${LANG_COOKIE_NAME}=kr(?:;|$)/.test(document.cookie))){document.documentElement.lang="ht";}}catch(e){}})();`;

export const viewport: Viewport = {
  themeColor: "#080B14",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: `${t("erreur404.titre", "fr")} | ${SITE_NAME}`,
  description: t("erreur404.description", "fr"),
  robots: {
    index: false,
    follow: false,
  },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr" suppressHydrationWarning className={`dark ${fontClassNames}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: NOT_FOUND_LANG_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-obsidian text-ice-white font-sans antialiased flex flex-col">
        <GlobalNotFoundContent />
      </body>
    </html>
  );
}
