import React, { Suspense } from "react";
import type { Metadata } from "next";
import {
  Sora,
  Plus_Jakarta_Sans,
  IBM_Plex_Mono,
  Playfair_Display,
} from "next/font/google";
import "@/styles/theme.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme";
import { AmbientBackdrop } from "@/components/layout/AmbientBackdrop";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { t } from "@/lib/i18n";
import {
  getSiteUrl,
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  SITE_TITLE_TEMPLATE,
} from "@/lib/site";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = getSiteUrl();
const defaultTitle = t("seo.titreAccueil");
const defaultDescription = t("seo.description");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: SITE_NAME,
  title: {
    default: defaultTitle,
    template: SITE_TITLE_TEMPLATE,
  },
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDescription,
    locale: "ht_HT",
    url: "/",
    images: [
      {
        url: "/assets/aistudio/rs_w_1280_e5a11620.webp",
        width: 1280,
        height: 720,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/assets/aistudio/rs_w_1280_e5a11620.webp"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAMES,
  url: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ht"
      suppressHydrationWarning
      className={`dark ${sora.variable} ${jakarta.variable} ${ibmPlexMono.variable} ${playfair.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-obsidian text-ice-white font-sans antialiased flex flex-col relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <MotionProvider>
          <ThemeProvider>
            <AuthProvider>
              <AmbientBackdrop />
              <div className="relative z-10 min-h-screen flex flex-col">
                {children}
              </div>
              <Suspense fallback={null}>
                <WhatsAppButton />
              </Suspense>
            </AuthProvider>
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
