import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "@/styles/theme.css";
import { fontClassNames } from "@/lib/layout/fonts";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme";
import { AmbientBackdrop } from "@/components/layout/AmbientBackdrop";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { AdminShell } from "@/components/admin/AdminShell";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { DEFAULT_APP_LANG, LANG_COOKIE_NAME } from "@/lib/i18n/config";
import { t } from "@/lib/i18n";
import { getSiteUrl, SITE_NAME, SITE_TITLE_TEMPLATE } from "@/lib/site";

const LANG_INIT_SCRIPT = `(function(){try{if(/(?:^|;\\s*)${LANG_COOKIE_NAME}=kr(?:;|$)/.test(document.cookie)){document.documentElement.lang='ht';}}catch(e){}})();`;

export const viewport: Viewport = {
  themeColor: "#080B14",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: SITE_NAME,
  title: {
    default: t("admin.nav.tableau", DEFAULT_APP_LANG),
    template: SITE_TITLE_TEMPLATE,
  },
  robots: {
    index: false,
    follow: false,
  },
};

// L'espace /admin est protégé côté client par AdminShell et côté API par requireAdmin :
// les routes ne nécessitent pas la validation de navigation instantanée SSR.
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`dark ${fontClassNames}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-obsidian text-ice-white font-sans antialiased flex flex-col relative">
        <MotionProvider>
          <ThemeProvider>
            <AuthProvider>
              <I18nProvider lang={DEFAULT_APP_LANG} syncFromCookie={true}>
                <AmbientBackdrop />
                <div className="relative z-10 min-h-screen flex flex-col">
                  <AdminShell>
                    <Suspense
                      fallback={
                        <div className="space-y-6 animate-pulse">
                          <div className="h-8 bg-[var(--surface-subtle)] rounded-xl w-64" />
                          <div className="h-48 bg-deep-navy rounded-2xl border border-[var(--border-subtle)]" />
                        </div>
                      }
                    >
                      {children}
                    </Suspense>
                  </AdminShell>
                </div>
              </I18nProvider>
            </AuthProvider>
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
