import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_THEME,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  getNextTheme,
  normalizeTheme,
  resolveTheme,
} from "./theme";

test("normalizeTheme accepts only light or dark", () => {
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("dark"), "dark");
  assert.equal(normalizeTheme("system"), null);
  assert.equal(normalizeTheme(""), null);
  assert.equal(normalizeTheme(null), null);
  assert.equal(normalizeTheme(undefined), null);
});

test("resolveTheme returns stored valid theme or safe fallback", () => {
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("dark"), "dark");
  assert.equal(resolveTheme("invalid"), DEFAULT_THEME);
  assert.equal(resolveTheme(null), DEFAULT_THEME);
  assert.equal(resolveTheme(undefined, "light"), "light");
});

test("getNextTheme toggles cleanly between dark and light", () => {
  assert.equal(getNextTheme("dark"), "light");
  assert.equal(getNextTheme("light"), "dark");
});

test("THEME_INIT_SCRIPT references storage key and both theme classes", () => {
  assert.ok(THEME_INIT_SCRIPT.includes(THEME_STORAGE_KEY));
  assert.ok(THEME_INIT_SCRIPT.includes("light"));
  assert.ok(THEME_INIT_SCRIPT.includes("dark"));
});
