export const SITE_NAME = "BAYONDY";
export const SITE_SHORT_NAME = "BAYONDY";
export const SITE_WORDMARK = "BAYONDY";
export const SITE_ALTERNATE_NAMES: readonly string[] = [];
export const SITE_LOCALE = "ht_HT";
export const SITE_ICON_PATH = "/icons/icon-192.png";
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const SITE_SOCIAL_LINKS = [
  {
    id: "tiktok",
    href: "https://www.tiktok.com/@bayondy",
  },
  {
    id: "instagram",
    href: "https://www.instagram.com/bayondy.ht",
  },
  {
    id: "facebook",
    href: "https://www.facebook.com/share/1VGxPRhaCb",
  },
  {
    id: "whatsappCommunaute",
    href: "https://chat.whatsapp.com/Fk0ZKVVAQQG6XCbf6hWPXs",
  },
] as const;

export function formatPageTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`;
}

export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.APP_URL,
  ];

  for (const raw of candidates) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.origin;
      }
    } catch {
      // Ignore malformed candidate URLs and fall back cleanly
    }
  }

  return "http://localhost:3000";
}

export const SITE_URL = getSiteUrl();
