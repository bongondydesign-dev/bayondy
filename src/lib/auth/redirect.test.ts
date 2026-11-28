import test from "node:test";
import assert from "node:assert/strict";
import { getSafeRedirectPath } from "./redirect";

test("getSafeRedirectPath defaults to the student dashboard (/mes-formations)", () => {
  assert.equal(getSafeRedirectPath(undefined), "/mes-formations");
  assert.equal(getSafeRedirectPath(null), "/mes-formations");
  assert.equal(getSafeRedirectPath(""), "/mes-formations");
  assert.equal(getSafeRedirectPath("   "), "/mes-formations");
});

test("getSafeRedirectPath rejects external or unsafe URLs and falls back to dashboard", () => {
  assert.equal(getSafeRedirectPath("https://evil.example"), "/mes-formations");
  assert.equal(getSafeRedirectPath("//evil.example"), "/mes-formations");
  assert.equal(getSafeRedirectPath("javascript:alert(1)"), "/mes-formations");
  assert.equal(getSafeRedirectPath("/\\evil"), "/mes-formations");
});

test("getSafeRedirectPath preserves safe internal paths", () => {
  assert.equal(getSafeRedirectPath("/formations"), "/formations");
  assert.equal(getSafeRedirectPath("/mes-formations/react-101?tab=1"), "/mes-formations/react-101?tab=1");
  assert.equal(getSafeRedirectPath("/profil"), "/profil");
});
