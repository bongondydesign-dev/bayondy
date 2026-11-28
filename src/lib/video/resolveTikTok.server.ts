import "server-only";
import {
  isAllowedTikTokHostname,
  isSafeTikTokUrl,
  parseLessonVideoInput,
} from "./lessonVideo";

const MAX_HOPS = 3;

/**
 * Safely resolves a short TikTok share link (vm.tiktok.com, vt.tiktok.com, tiktok.com/t/...)
 * to extract the underlying numeric TikTok videoId.
 * Strict SSRF guard: only follows redirects whose Location resolves to an allowlisted tiktok.com host.
 */
export async function resolveTikTokShortUrl(shortUrl: string): Promise<{
  videoId: string;
  videoUrl: string;
}> {
  if (!isSafeTikTokUrl(shortUrl)) {
    return { videoId: "", videoUrl: shortUrl };
  }

  let currentUrl = shortUrl;

  try {
    for (let hop = 0; hop < MAX_HOPS; hop++) {
      const response = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(4000),
      });

      const location = response.headers.get("location");
      if (!location) {
        break;
      }

      const nextUrl = new URL(location, currentUrl);
      if (nextUrl.protocol !== "https:" || !isAllowedTikTokHostname(nextUrl.hostname)) {
        break;
      }

      currentUrl = nextUrl.toString();
      const parsed = parseLessonVideoInput(currentUrl);
      if (parsed.ok && parsed.provider === "tiktok" && parsed.videoId) {
        return {
          videoId: parsed.videoId,
          videoUrl: parsed.videoUrl,
        };
      }
    }
  } catch {
    // Fallback cleanly to validated short URL if network/TikTok blocks automated HEAD
  }

  return { videoId: "", videoUrl: shortUrl };
}
