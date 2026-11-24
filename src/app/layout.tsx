import type { Metadata } from "next";
import { Sora, Inter, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import "@/styles/theme.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
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
      className={`${sora.variable} ${inter.variable} ${ibmPlexMono.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-obsidian text-ice-white font-sans antialiased flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
