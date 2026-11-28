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

export const metadata: Metadata = {
  title: "BAYONDY",
  description: "Fòmasyon videyo an kreyòl ayisyen",
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
