import test from "node:test";
import assert from "node:assert/strict";
import {
  isInternalAvatarPath,
  isRenderableAvatarSrc,
  isSafeAvatarUrl,
  isValidAvatarId,
  MAX_AVATAR_UPLOAD_BYTES,
  MAX_RAW_AVATAR_FILE_BYTES,
  parseAvatarDataUrl,
  validateAvatarFileMeta,
} from "./avatar";

test("isValidAvatarId and isInternalAvatarPath enforce strict internal avatar format", () => {
  assert.equal(isValidAvatarId("abc123_XYZ"), true);
  assert.equal(isValidAvatarId("../evil"), false);
  assert.equal(isValidAvatarId("short"), false);

  assert.equal(isInternalAvatarPath("/api/avatars/abc123_XYZ"), true);
  assert.equal(isInternalAvatarPath("/api/covers/abc123_XYZ"), false);
  assert.equal(isInternalAvatarPath("/api/avatars/../secret"), false);
});

test("isSafeAvatarUrl and isRenderableAvatarSrc reject unsafe schemes and untrusted hosts", () => {
  assert.equal(isSafeAvatarUrl("/api/avatars/userAvatar01"), true);
  assert.equal(
    isSafeAvatarUrl("https://lh3.googleusercontent.com/a/photo"),
    true
  );
  assert.equal(isSafeAvatarUrl("javascript:alert(1)"), false);
  assert.equal(isSafeAvatarUrl("data:image/png;base64,AAAA"), false);

  assert.equal(isRenderableAvatarSrc("/api/avatars/userAvatar01"), true);
  assert.equal(
    isRenderableAvatarSrc("https://lh3.googleusercontent.com/a/photo"),
    true
  );
  assert.equal(isRenderableAvatarSrc("https://evil.example.com/a.png"), false);
});

test("validateAvatarFileMeta validates MIME type and file size bounds", () => {
  assert.deepEqual(
    validateAvatarFileMeta({ type: "image/webp", size: 2048 }),
    { ok: true }
  );
  assert.deepEqual(
    validateAvatarFileMeta({ type: "image/svg+xml", size: 500 }),
    { ok: false, code: "invalid_type" }
  );
  assert.deepEqual(
    validateAvatarFileMeta({
      type: "image/jpeg",
      size: MAX_RAW_AVATAR_FILE_BYTES + 1,
    }),
    { ok: false, code: "too_large" }
  );
});

test("parseAvatarDataUrl verifies magic bytes and rejects spoofed or oversized payloads", () => {
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  const validPng = `data:image/png;base64,${pngHeader.toString("base64")}`;
  const parsed = parseAvatarDataUrl(validPng);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.mimeType, "image/png");
    assert.equal(parsed.buffer.byteLength, pngHeader.byteLength);
  }

  const spoofedPng = `data:image/png;base64,${Buffer.from("<svg></svg>").toString("base64")}`;
  assert.equal(parseAvatarDataUrl(spoofedPng).ok, false);

  const oversized = `data:image/jpeg;base64,${Buffer.alloc(MAX_AVATAR_UPLOAD_BYTES + 10, 0xff).toString("base64")}`;
  assert.equal(parseAvatarDataUrl(oversized).ok, false);
});
