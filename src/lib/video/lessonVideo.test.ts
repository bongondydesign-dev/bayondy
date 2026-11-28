import test from "node:test";
import assert from "node:assert/strict";
import { getLessonPlaybackInfo, parseLessonVideoInput } from "./lessonVideo";

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
});
