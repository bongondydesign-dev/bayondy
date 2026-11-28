import test from "node:test";
import assert from "node:assert/strict";
import {
  formatProfileDate,
  getPrimaryAuthProviderLabel,
  getUserInitials,
  isDisplayNameDirty,
} from "./profile";

test("getUserInitials extracts 1 or 2 initials from display name or falls back to email/B", () => {
  assert.equal(getUserInitials("Bayondy Edouard", "b@bayondy.com"), "BE");
  assert.equal(getUserInitials("  Jean   Baptiste  ", null), "JB");
  assert.equal(getUserInitials("Kreyol", null), "K");
  assert.equal(getUserInitials("", "alex@example.com"), "A");
  assert.equal(getUserInitials(null, null), "B");
});

test("getPrimaryAuthProviderLabel maps Firebase provider IDs cleanly", () => {
  assert.equal(getPrimaryAuthProviderLabel(["google.com"]), "Google");
  assert.equal(getPrimaryAuthProviderLabel(["password"]), "Email");
  assert.equal(getPrimaryAuthProviderLabel(["password", "google.com"]), "Google");
  assert.equal(getPrimaryAuthProviderLabel([]), "Email");
});

test("formatProfileDate formats valid timestamps and handles invalid/empty values", () => {
  assert.equal(formatProfileDate(undefined), "—");
  assert.equal(formatProfileDate(null), "—");
  assert.equal(formatProfileDate("not-a-date"), "—");
  assert.match(formatProfileDate("2026-11-27T16:00:00Z"), /^\d{2}\/\d{2}\/\d{4}$/);
});

test("isDisplayNameDirty detects meaningful unsaved name edits", () => {
  assert.equal(isDisplayNameDirty(null, "Jean"), false);
  assert.equal(isDisplayNameDirty("   ", "Jean"), false);
  assert.equal(isDisplayNameDirty("Jean", "Jean"), false);
  assert.equal(isDisplayNameDirty("  Jean  ", "Jean"), false);
  assert.equal(isDisplayNameDirty("Jean Pierre", "Jean"), true);
});
