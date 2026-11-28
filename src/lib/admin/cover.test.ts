import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_COVER_UPLOAD_BYTES,
  MAX_RAW_COVER_FILE_BYTES,
  isValidCoverId,
  isValidCoverUrl,
  matchesImageMagicBytes,
  parseCoverDataUrl,
  validateCoverFileMeta,
} from "./cover";

test("isValidCoverUrl accepts https URLs and internal /api/covers paths, rejects unsafe values", () => {
  assert.equal(isValidCoverUrl("https://cdn.example.com/cover.webp"), true);
  assert.equal(isValidCoverUrl("http://localhost:3000/cover.png"), true);
  assert.equal(isValidCoverUrl("/api/covers/abc123_XYZ-9"), true);

  assert.equal(isValidCoverUrl("http://example.com/cover.png"), false);
  assert.equal(isValidCoverUrl(""), false);
  assert.equal(isValidCoverUrl("javascript:alert(1)"), false);
  assert.equal(isValidCoverUrl("data:image/png;base64,AAAA"), false);
  assert.equal(isValidCoverUrl("/api/covers/../../etc/passwd"), false);
  assert.equal(isValidCoverUrl("/api/covers/short"), false);
  assert.equal(isValidCoverUrl("https://example.com/has space.png"), false);
});

test("isValidCoverId validates safe Firestore document IDs", () => {
  assert.equal(isValidCoverId("cover_123456"), true);
  assert.equal(isValidCoverId("aB9-xY2_09"), true);
  assert.equal(isValidCoverId("abc"), false);
  assert.equal(isValidCoverId("../secret"), false);
  assert.equal(isValidCoverId("a/b/c/d/e/f"), false);
});

test("validateCoverFileMeta accepts JPG/PNG/WebP under limit and rejects SVG or oversized", () => {
  assert.deepEqual(
    validateCoverFileMeta({ type: "image/jpeg", size: 1024 }),
    { ok: true }
  );
  assert.deepEqual(
    validateCoverFileMeta({ type: "image/png", size: 2048 }),
    { ok: true }
  );
  assert.deepEqual(
    validateCoverFileMeta({ type: "image/webp", size: MAX_RAW_COVER_FILE_BYTES }),
    { ok: true }
  );

  assert.deepEqual(
    validateCoverFileMeta({ type: "image/svg+xml", size: 500 }),
    { ok: false, code: "invalid_type" }
  );
  assert.deepEqual(
    validateCoverFileMeta({ type: "application/pdf", size: 500 }),
    { ok: false, code: "invalid_type" }
  );
  assert.deepEqual(
    validateCoverFileMeta({
      type: "image/png",
      size: MAX_RAW_COVER_FILE_BYTES + 1,
    }),
    { ok: false, code: "too_large" }
  );
});

test("parseCoverDataUrl validates PNG, JPEG, and WebP magic bytes and rejects forged payloads", () => {
  // Valid minimal PNG header + payload
  const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const pngResult = parseCoverDataUrl(
    `data:image/png;base64,${pngBytes.toString("base64")}`
  );
  assert.equal(pngResult.ok, true);
  if (pngResult.ok) {
    assert.equal(pngResult.mimeType, "image/png");
    assert.equal(pngResult.buffer.byteLength, pngBytes.byteLength);
  }

  // Valid JPEG header
  const jpgBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const jpgResult = parseCoverDataUrl(
    `data:image/jpeg;base64,${jpgBytes.toString("base64")}`
  );
  assert.equal(jpgResult.ok, true);

  // Valid WebP header
  const webpBytes = Buffer.from("RIFF\x00\x00\x00\x00WEBP", "ascii");
  assert.equal(matchesImageMagicBytes(webpBytes, "image/webp"), true);
  const webpResult = parseCoverDataUrl(
    `data:image/webp;base64,${webpBytes.toString("base64")}`
  );
  assert.equal(webpResult.ok, true);

  // Forged MIME: text pretending to be PNG
  const forged = parseCoverDataUrl(
    `data:image/png;base64,${Buffer.from("<svg></svg>").toString("base64")}`
  );
  assert.equal(forged.ok, false);

  // Disallowed SVG MIME
  const svg = parseCoverDataUrl(
    `data:image/svg+xml;base64,${Buffer.from("<svg/>").toString("base64")}`
  );
  assert.equal(svg.ok, false);

  // Oversized buffer
  const big = Buffer.alloc(MAX_COVER_UPLOAD_BYTES + 2048, 0xff);
  big[0] = 0xff;
  big[1] = 0xd8;
  big[2] = 0xff;
  const tooBig = parseCoverDataUrl(
    `data:image/jpeg;base64,${big.toString("base64")}`
  );
  assert.equal(tooBig.ok, false);
});
