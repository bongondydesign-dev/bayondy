import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedOgCoverUrl, truncateOgTitle } from "./helpers";

test("isAllowedOgCoverUrl accepts trusted HTTPS hosts and rejects video/untrusted URLs", () => {
  assert.equal(
    isAllowedOgCoverUrl("https://firebasestorage.googleapis.com/v0/b/demo/o/cover.webp"),
    true
  );
  assert.equal(
    isAllowedOgCoverUrl("https://res.cloudinary.com/demo/image/upload/v1/cover.webp"),
    true
  );
  assert.equal(isAllowedOgCoverUrl("http://firebasestorage.googleapis.com/cover.webp"), false);
  assert.equal(isAllowedOgCoverUrl("https://i.ytimg.com/vi/abc123/maxresdefault.jpg"), false);
  assert.equal(isAllowedOgCoverUrl("https://www.youtube.com/watch?v=abc"), false);
  assert.equal(isAllowedOgCoverUrl("https://www.tiktok.com/@bayondy/video/123"), false);
  assert.equal(isAllowedOgCoverUrl("https://evil.example.com/cover.jpg"), false);
  assert.equal(isAllowedOgCoverUrl("/api/covers/abc123"), false);
  assert.equal(isAllowedOgCoverUrl(null), false);
});

test("truncateOgTitle truncates cleanly at word boundary without breaking short titles", () => {
  assert.equal(truncateOgTitle("   "), "BAYONDY");
  assert.equal(truncateOgTitle("Kòman pou w kreye sit entènèt"), "Kòman pou w kreye sit entènèt");
  const longTitle =
    "Fòmasyon konplè sou devlopman entènèt modèn ak React epi TypeScript pou debutan an kreyòl ayisyen";
  const truncated = truncateOgTitle(longTitle, 60);
  assert.ok(truncated.length <= 60);
  assert.ok(truncated.endsWith("…"));
});
