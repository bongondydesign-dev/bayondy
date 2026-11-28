export const SITE_NAME = "Bayondy Akademi";
export const SITE_SHORT_NAME = "Bayondy";
export const SITE_WORDMARK = "BAYONDY";
export const SITE_ALTERNATE_NAMES = ["Bayondy"];
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

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
