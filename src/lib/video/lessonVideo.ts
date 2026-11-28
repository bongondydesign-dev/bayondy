export type VideoProvider = "tiktok" | "youtube";

export const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;
export const TIKTOK_ID_RE = /^\d{15,24}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);

const TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
]);

export type ParsedLessonVideo =
  | {
      ok: true;
      provider: VideoProvider;
      videoId: string;
      videoUrl: string;
      youtubeVideoId: string;
      needsShortResolve: boolean;
    }
  | {
      ok: false;
      error: string;
    };

export interface LessonPlaybackInput {
  videoProvider?: VideoProvider | string | null;
  videoUrl?: string | null;
  videoId?: string | null;
  youtubeVideoId?: string | null;
}

export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

export interface LessonPlaybackInfo {
  provider: VideoProvider | null;
  playableInIframe: boolean;
  embedUrl: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
  videoId: string;
}

export interface YouTubeEmbedOptions {
  autoplay?: boolean;
  controls?: boolean;
  enableJsApi?: boolean;
  disableKeyboard?: boolean;
  fullscreenButton?: boolean;
  origin?: string;
}

export function buildYouTubeEmbedUrl(
  videoId: string,
  options: YouTubeEmbedOptions = {}
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    playsinline: "1",
    cc_load_policy: "0",
    autoplay: options.autoplay ? "1" : "0",
    controls: options.controls === false ? "0" : "1",
    disablekb: options.disableKeyboard ? "1" : "0",
    fs: options.fullscreenButton === false ? "0" : "1",
  });

  if (options.enableJsApi) {
    params.set("enablejsapi", "1");
  }
  if (options.origin && /^https?:\/\//i.test(options.origin)) {
    params.set("origin", options.origin);
  }

  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    videoId
  )}?${params.toString()}`;
}

export function buildTikTokEmbedUrl(
  videoId: string,
  options: { autoplay?: boolean } = {}
): string {
  const params = new URLSearchParams({
    autoplay: options.autoplay ? "1" : "0",
    controls: "1",
    description: "0",
    music_info: "0",
    rel: "0",
  });
  return `https://www.tiktok.com/player/v1/${encodeURIComponent(videoId)}?${params.toString()}`;
}

export type VideoPlayerPhase =
  | "poster"
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "fallback";

export function resolveYouTubePlayerState(
  ytState: number,
  currentPhase: VideoPlayerPhase
): { nextPhase: VideoPlayerPhase; shouldTriggerPlay: boolean; clearSettling: boolean } {
  // YT.PlayerState: -1 UNSTARTED, 0 ENDED, 1 PLAYING, 2 PAUSED, 3 BUFFERING, 5 CUED
  switch (ytState) {
    case 1:
      return { nextPhase: "playing", shouldTriggerPlay: false, clearSettling: false };
    case 2:
      return { nextPhase: "paused", shouldTriggerPlay: false, clearSettling: true };
    case 0:
      return { nextPhase: "ended", shouldTriggerPlay: false, clearSettling: true };
    case 5:
      return {
        nextPhase: currentPhase,
        shouldTriggerPlay: currentPhase === "loading",
        clearSettling: false,
      };
    case 3:
    default:
      return { nextPhase: currentPhase, shouldTriggerPlay: false, clearSettling: false };
  }
}

export function getYouTubeThumbnailUrl(videoId: string): string | null {
  if (!YOUTUBE_ID_RE.test(videoId)) return null;
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

export function formatPlaybackTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "00:00";
  }
  const whole = Math.floor(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function clampPlaybackProgress(
  currentSeconds: number,
  durationSeconds: number
): number {
  if (
    !Number.isFinite(currentSeconds) ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return 0;
  }
  const pct = (currentSeconds / durationSeconds) * 100;
  return Math.max(0, Math.min(100, pct));
}

export function computeSeekTarget(
  currentSeconds: number,
  deltaSeconds: number,
  durationSeconds: number
): number {
  const safeCurrent = Number.isFinite(currentSeconds) && currentSeconds > 0 ? currentSeconds : 0;
  const safeDelta = Number.isFinite(deltaSeconds) ? deltaSeconds : 0;
  const target = safeCurrent + safeDelta;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return Math.max(0, target);
  }
  return Math.max(0, Math.min(durationSeconds, target));
}

export function isAllowedTikTokHostname(hostname: string): boolean {
  return TIKTOK_HOSTS.has(hostname.toLowerCase());
}

export function isSafeTikTokUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2000) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    return isAllowedTikTokHostname(parsed.hostname);
  } catch {
    return false;
  }
}

function extractYoutubeIdFromUrl(parsed: URL): string | null {
  const host = parsed.hostname.toLowerCase();
  const segments = parsed.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const candidate = segments[0] ?? "";
    return YOUTUBE_ID_RE.test(candidate) ? candidate : null;
  }

  if (parsed.pathname === "/watch") {
    const v = parsed.searchParams.get("v") ?? "";
    return YOUTUBE_ID_RE.test(v) ? v : null;
  }

  if (
    segments.length >= 2 &&
    (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live")
  ) {
    const candidate = segments[1];
    return YOUTUBE_ID_RE.test(candidate) ? candidate : null;
  }

  return null;
}

function extractTikTokDetailsFromUrl(parsed: URL): {
  videoId: string;
  canonicalUrl: string;
  needsShortResolve: boolean;
} | null {
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname;

  const userVideoMatch = /^\/(@[A-Za-z0-9_.-]+)\/(?:video|photo)\/(\d{15,24})/.exec(path);
  if (userVideoMatch) {
    const handle = userVideoMatch[1];
    const videoId = userVideoMatch[2];
    return {
      videoId,
      canonicalUrl: `https://www.tiktok.com/${handle}/video/${videoId}`,
      needsShortResolve: false,
    };
  }

  const genericMatch =
    /^\/(?:v|video|embed(?:\/v2)?|player\/v1)\/(\d{15,24})(?:\.html)?/.exec(path);
  if (genericMatch) {
    const videoId = genericMatch[1];
    return {
      videoId,
      canonicalUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      needsShortResolve: false,
    };
  }

  const itemId = parsed.searchParams.get("item_id") ?? "";
  if (TIKTOK_ID_RE.test(itemId)) {
    return {
      videoId: itemId,
      canonicalUrl: `https://www.tiktok.com/embed/v2/${itemId}`,
      needsShortResolve: false,
    };
  }

  const cleanPath = path.replace(/\/+$/, "");
  const isShortHost = host === "vm.tiktok.com" || host === "vt.tiktok.com";
  const isShortPath = /^\/t\/[A-Za-z0-9_-]{4,64}$/.test(cleanPath);

  if ((isShortHost && /^\/[A-Za-z0-9_-]{4,64}$/.test(cleanPath)) || isShortPath) {
    return {
      videoId: "",
      canonicalUrl: `https://${host}${cleanPath}`,
      needsShortResolve: true,
    };
  }

  return null;
}

export function parseLessonVideoInput(raw: unknown): ParsedLessonVideo {
  if (typeof raw !== "string") {
    return { ok: false, error: "Lien ou identifiant vidéo requis." };
  }

  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2000) {
    return { ok: false, error: "Lien ou identifiant vidéo requis (max 2000 caractères)." };
  }

  if (YOUTUBE_ID_RE.test(trimmed)) {
    return {
      ok: true,
      provider: "youtube",
      videoId: trimmed,
      videoUrl: `https://www.youtube.com/watch?v=${trimmed}`,
      youtubeVideoId: trimmed,
      needsShortResolve: false,
    };
  }

  if (TIKTOK_ID_RE.test(trimmed)) {
    return {
      ok: true,
      provider: "tiktok",
      videoId: trimmed,
      videoUrl: `https://www.tiktok.com/embed/v2/${trimmed}`,
      youtubeVideoId: "",
      needsShortResolve: false,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      error: "Collez un lien TikTok (ou ID numérique) ou un lien/ID YouTube valide.",
    };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "Seuls les liens https:// TikTok ou YouTube sont acceptés." };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: "URL vidéo invalide." };
  }

  const host = parsed.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host)) {
    const videoId = extractYoutubeIdFromUrl(parsed);
    if (!videoId) {
      return { ok: false, error: "Impossible d'extraire l'identifiant vidéo YouTube." };
    }
    return {
      ok: true,
      provider: "youtube",
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      youtubeVideoId: videoId,
      needsShortResolve: false,
    };
  }

  if (TIKTOK_HOSTS.has(host)) {
    const details = extractTikTokDetailsFromUrl(parsed);
    if (!details) {
      return {
        ok: false,
        error: "Lien TikTok invalide. Copiez le lien complet de la vidéo TikTok.",
      };
    }
    return {
      ok: true,
      provider: "tiktok",
      videoId: details.videoId,
      videoUrl: details.canonicalUrl,
      youtubeVideoId: "",
      needsShortResolve: details.needsShortResolve,
    };
  }

  return {
    ok: false,
    error: "Plateforme non supportée. Utilisez un lien TikTok ou YouTube.",
  };
}

export function getLessonPlaybackInfo(lesson: LessonPlaybackInput): LessonPlaybackInfo {
  const rawProvider = lesson.videoProvider;
  const rawVideoId = (lesson.videoId ?? "").trim();
  const rawVideoUrl = (lesson.videoUrl ?? "").trim();
  const rawYoutubeId = (lesson.youtubeVideoId ?? "").trim();

  if (
    rawProvider === "tiktok" ||
    TIKTOK_ID_RE.test(rawVideoId) ||
    isSafeTikTokUrl(rawVideoUrl)
  ) {
    let resolvedId = TIKTOK_ID_RE.test(rawVideoId) ? rawVideoId : "";
    let safeExternalUrl = isSafeTikTokUrl(rawVideoUrl) ? rawVideoUrl : null;

    if (!resolvedId && safeExternalUrl) {
      const parsed = parseLessonVideoInput(safeExternalUrl);
      if (parsed.ok && parsed.provider === "tiktok" && parsed.videoId) {
        resolvedId = parsed.videoId;
      }
    }

    if (resolvedId) {
      if (!safeExternalUrl) {
        safeExternalUrl = `https://www.tiktok.com/embed/v2/${resolvedId}`;
      }
      return {
        provider: "tiktok",
        playableInIframe: true,
        embedUrl: buildTikTokEmbedUrl(resolvedId, { autoplay: false }),
        externalUrl: safeExternalUrl,
        thumbnailUrl: null,
        videoId: resolvedId,
      };
    }

    if (safeExternalUrl) {
      return {
        provider: "tiktok",
        playableInIframe: false,
        embedUrl: null,
        externalUrl: safeExternalUrl,
        thumbnailUrl: null,
        videoId: "",
      };
    }
  }

  const ytCandidate = YOUTUBE_ID_RE.test(rawYoutubeId)
    ? rawYoutubeId
    : YOUTUBE_ID_RE.test(rawVideoId)
    ? rawVideoId
    : (() => {
        if (!rawVideoUrl) return "";
        const parsed = parseLessonVideoInput(rawVideoUrl);
        return parsed.ok && parsed.provider === "youtube" ? parsed.videoId : "";
      })();

  if (ytCandidate) {
    return {
      provider: "youtube",
      playableInIframe: true,
      embedUrl: buildYouTubeEmbedUrl(ytCandidate, {
        autoplay: false,
        controls: true,
        enableJsApi: false,
      }),
      externalUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(ytCandidate)}`,
      thumbnailUrl: getYouTubeThumbnailUrl(ytCandidate),
      videoId: ytCandidate,
    };
  }

  return {
    provider: null,
    playableInIframe: false,
    embedUrl: null,
    externalUrl: null,
    thumbnailUrl: null,
    videoId: "",
  };
}
