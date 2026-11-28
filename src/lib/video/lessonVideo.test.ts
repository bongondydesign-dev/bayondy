import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTikTokEmbedUrl,
  buildYouTubeEmbedUrl,
  clampPlaybackProgress,
  computeSeekTarget,
  formatPlaybackTime,
  getLessonPlaybackInfo,
  getYouTubeThumbnailUrl,
  parseLessonVideoInput,
  resolveYouTubePlayerState,
} from "./lessonVideo";

test("parseLessonVideoInput handles full TikTok video URLs and raw TikTok IDs", () => {
  const full = parseLessonVideoInput(
    "https://www.tiktok.com/@bayondy/video/7412345678901234567?is_from_webapp=1"
  );
  assert.equal(full.ok, true);
  if (full.ok) {
    assert.equal(full.provider, "tiktok");
    assert.equal(full.videoId, "7412345678901234567");
    assert.equal(full.videoUrl, "https://www.tiktok.com/@bayondy/video/7412345678901234567");
    assert.equal(full.youtubeVideoId, "");
    assert.equal(full.needsShortResolve, false);
  }

  const rawId = parseLessonVideoInput("7412345678901234567");
  assert.equal(rawId.ok, true);
  if (rawId.ok) {
    assert.equal(rawId.provider, "tiktok");
    assert.equal(rawId.videoId, "7412345678901234567");
  }
});

test("parseLessonVideoInput flags TikTok short share links for safe server resolution", () => {
  const shortVm = parseLessonVideoInput("https://vm.tiktok.com/ZM8abc123/");
  assert.equal(shortVm.ok, true);
  if (shortVm.ok) {
    assert.equal(shortVm.provider, "tiktok");
    assert.equal(shortVm.needsShortResolve, true);
    assert.equal(shortVm.videoUrl, "https://vm.tiktok.com/ZM8abc123");
  }

  const shortT = parseLessonVideoInput("https://www.tiktok.com/t/ZP8xyz789/");
  assert.equal(shortT.ok, true);
  if (shortT.ok) {
    assert.equal(shortT.provider, "tiktok");
    assert.equal(shortT.needsShortResolve, true);
  }
});

test("parseLessonVideoInput handles YouTube URLs and legacy 11-char IDs", () => {
  const legacy = parseLessonVideoInput("dQw4w9WgXcQ");
  assert.equal(legacy.ok, true);
  if (legacy.ok) {
    assert.equal(legacy.provider, "youtube");
    assert.equal(legacy.youtubeVideoId, "dQw4w9WgXcQ");
  }

  const watch = parseLessonVideoInput("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=12s");
  assert.equal(watch.ok, true);
  if (watch.ok) {
    assert.equal(watch.provider, "youtube");
    assert.equal(watch.videoId, "dQw4w9WgXcQ");
  }

  const shortYt = parseLessonVideoInput("https://youtu.be/dQw4w9WgXcQ");
  assert.equal(shortYt.ok, true);
  if (shortYt.ok) {
    assert.equal(shortYt.provider, "youtube");
    assert.equal(shortYt.videoId, "dQw4w9WgXcQ");
  }
});

test("parseLessonVideoInput rejects unsupported hosts and unsafe URLs", () => {
  assert.equal(parseLessonVideoInput("javascript:alert(1)").ok, false);
  assert.equal(parseLessonVideoInput("https://evil.example/video/123").ok, false);
  assert.equal(parseLessonVideoInput("http://127.0.0.1/video").ok, false);
  assert.equal(parseLessonVideoInput("").ok, false);
});

test("getLessonPlaybackInfo supports both TikTok and legacy YouTube lessons", () => {
  const tiktok = getLessonPlaybackInfo({
    videoProvider: "tiktok",
    videoId: "7412345678901234567",
    videoUrl: "https://www.tiktok.com/@bayondy/video/7412345678901234567",
    youtubeVideoId: "",
  });
  assert.equal(tiktok.provider, "tiktok");
  assert.equal(tiktok.playableInIframe, true);
  assert.match(tiktok.embedUrl ?? "", /^https:\/\/www\.tiktok\.com\/player\/v1\/7412345678901234567/);
  assert.equal(tiktok.externalUrl, "https://www.tiktok.com/@bayondy/video/7412345678901234567");

  const unresolvedShort = getLessonPlaybackInfo({
    videoProvider: "tiktok",
    videoId: "",
    videoUrl: "https://vm.tiktok.com/ZM8abc123",
    youtubeVideoId: "",
  });
  assert.equal(unresolvedShort.provider, "tiktok");
  assert.equal(unresolvedShort.playableInIframe, false);
  assert.equal(unresolvedShort.externalUrl, "https://vm.tiktok.com/ZM8abc123");

  const legacyYt = getLessonPlaybackInfo({
    youtubeVideoId: "dQw4w9WgXcQ",
  });
  assert.equal(legacyYt.provider, "youtube");
  assert.equal(legacyYt.playableInIframe, true);
  assert.match(legacyYt.embedUrl ?? "", /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
  assert.equal(
    legacyYt.thumbnailUrl,
    "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  );
});

test("buildYouTubeEmbedUrl strips annotations and supports chromeless custom player mode", () => {
  const cleanUrl = buildYouTubeEmbedUrl("dQw4w9WgXcQ", {
    autoplay: true,
    controls: false,
    enableJsApi: true,
    disableKeyboard: true,
    fullscreenButton: false,
    origin: "https://bayondy.com",
  });
  const parsed = new URL(cleanUrl);
  assert.equal(parsed.hostname, "www.youtube-nocookie.com");
  assert.equal(parsed.searchParams.get("rel"), "0");
  assert.equal(parsed.searchParams.get("iv_load_policy"), "3");
  assert.equal(parsed.searchParams.get("controls"), "0");
  assert.equal(parsed.searchParams.get("autoplay"), "1");
  assert.equal(parsed.searchParams.get("disablekb"), "1");
  assert.equal(parsed.searchParams.get("fs"), "0");
  assert.equal(parsed.searchParams.get("enablejsapi"), "1");
  assert.equal(parsed.searchParams.get("origin"), "https://bayondy.com");

  const resumedUrl = new URL(
    buildYouTubeEmbedUrl("dQw4w9WgXcQ", {
      autoplay: true,
      controls: true,
      startSeconds: 87.9,
    })
  );
  assert.equal(resumedUrl.searchParams.get("start"), "87");
  assert.equal(resumedUrl.searchParams.get("controls"), "1");

  assert.equal(getYouTubeThumbnailUrl("bad-id"), null);
});

test("formatPlaybackTime, clampPlaybackProgress, and computeSeekTarget behave safely", () => {
  assert.equal(formatPlaybackTime(-5), "00:00");
  assert.equal(formatPlaybackTime(Number.NaN), "00:00");
  assert.equal(formatPlaybackTime(65), "01:05");
  assert.equal(formatPlaybackTime(3725), "1:02:05");

  assert.equal(clampPlaybackProgress(30, 120), 25);
  assert.equal(clampPlaybackProgress(200, 100), 100);
  assert.equal(clampPlaybackProgress(10, 0), 0);

  assert.equal(computeSeekTarget(5, -10, 120), 0);
  assert.equal(computeSeekTarget(115, 10, 120), 120);
  assert.equal(computeSeekTarget(45, 10, 120), 55);
});

test("buildTikTokEmbedUrl supports autoplay when triggered from studio poster", () => {
  const pausedUrl = new URL(buildTikTokEmbedUrl("7412345678901234567", { autoplay: false }));
  assert.equal(pausedUrl.searchParams.get("autoplay"), "0");
  assert.equal(pausedUrl.searchParams.get("controls"), "1");

  const playingUrl = new URL(buildTikTokEmbedUrl("7412345678901234567", { autoplay: true }));
  assert.equal(playingUrl.searchParams.get("autoplay"), "1");
});

test("resolveYouTubePlayerState transitions loading -> playing/paused/ended cleanly", () => {
  assert.deepEqual(resolveYouTubePlayerState(1, "loading"), {
    nextPhase: "playing",
    shouldTriggerPlay: false,
    clearSettling: false,
  });
  assert.deepEqual(resolveYouTubePlayerState(2, "playing"), {
    nextPhase: "paused",
    shouldTriggerPlay: false,
    clearSettling: true,
  });
  assert.deepEqual(resolveYouTubePlayerState(0, "playing"), {
    nextPhase: "ended",
    shouldTriggerPlay: false,
    clearSettling: true,
  });
  assert.deepEqual(resolveYouTubePlayerState(5, "loading"), {
    nextPhase: "loading",
    shouldTriggerPlay: true,
    clearSettling: false,
  });
  assert.deepEqual(resolveYouTubePlayerState(3, "playing"), {
    nextPhase: "playing",
    shouldTriggerPlay: false,
    clearSettling: false,
  });
});

test("video quality helpers normalize levels, labels, HD detection, and YouTube mapping", async () => {
  const {
    DEFAULT_VIDEO_QUALITY_OPTIONS,
    getVideoQualityLabel,
    isHdVideoQuality,
    normalizeYouTubeQualityLevels,
    parseStoredVideoQuality,
    toYouTubeSuggestedQuality,
  } = await import("./lessonVideo");

  assert.deepEqual(normalizeYouTubeQualityLevels([]), [...DEFAULT_VIDEO_QUALITY_OPTIONS]);
  assert.deepEqual(normalizeYouTubeQualityLevels(null), [...DEFAULT_VIDEO_QUALITY_OPTIONS]);
  assert.deepEqual(
    normalizeYouTubeQualityLevels(["tiny", "hd1080", "auto", "unknown", "hd720", "hd1080"]),
    ["auto", "hd1080", "hd720", "tiny"]
  );

  assert.equal(getVideoQualityLabel("auto", "Otomatik"), "Otomatik");
  assert.equal(getVideoQualityLabel("default", "Auto"), "Auto");
  assert.equal(getVideoQualityLabel("hd1080"), "1080p");
  assert.equal(getVideoQualityLabel("hd720"), "720p");
  assert.equal(getVideoQualityLabel("large"), "480p");
  assert.equal(getVideoQualityLabel("medium"), "360p");
  assert.equal(getVideoQualityLabel("small"), "240p");
  assert.equal(getVideoQualityLabel("tiny"), "144p");

  assert.equal(isHdVideoQuality("hd1080"), true);
  assert.equal(isHdVideoQuality("hd720"), true);
  assert.equal(isHdVideoQuality("large"), false);
  assert.equal(isHdVideoQuality("auto"), false);

  assert.equal(parseStoredVideoQuality("hd720"), "hd720");
  assert.equal(parseStoredVideoQuality("invalid"), "auto");

  assert.equal(toYouTubeSuggestedQuality("auto"), "default");
  assert.equal(toYouTubeSuggestedQuality("small"), "small");

  const { computeYouTubeQualityViewport } = await import("./lessonVideo");
  assert.equal(computeYouTubeQualityViewport("auto", 800, 594, 1), null);
  assert.equal(computeYouTubeQualityViewport("hd1080", 0, 594, 1), null);

  const hd1080 = computeYouTubeQualityViewport("hd1080", 640, 475, 2);
  assert.ok(hd1080);
  assert.equal(hd1080.width, 1920);
  assert.ok(hd1080.height >= 1400);
  assert.ok(Math.abs(hd1080.width * hd1080.scale - 640) < 0.01);

  const sd144 = computeYouTubeQualityViewport("tiny", 800, 594, 2);
  assert.ok(sd144);
  assert.ok(sd144.width >= 270);
  assert.ok(sd144.height >= 200);
  assert.ok(Math.abs(sd144.width * sd144.scale - 800) < 0.01);
});
