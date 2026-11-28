import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_THEME,
  DEFAULT_THEME_PREFERENCE,
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  detectSystemThemeFromFlags,
  getNextTheme,
  normalizeTheme,
  normalizeThemePreference,
  resolveTheme,
  resolveThemePreference,
} from "./theme";

test("normalizeTheme accepts only light or dark", () => {
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("dark"), "dark");
  assert.equal(normalizeTheme("system"), null);
  assert.equal(normalizeTheme(""), null);
  assert.equal(normalizeTheme(null), null);
  assert.equal(normalizeTheme(undefined), null);
});

test("normalizeThemePreference accepts light, dark, or system", () => {
  assert.equal(normalizeThemePreference("light"), "light");
  assert.equal(normalizeThemePreference("dark"), "dark");
  assert.equal(normalizeThemePreference("system"), "system");
  assert.equal(normalizeThemePreference("auto"), null);
  assert.equal(normalizeThemePreference(null), null);
});

test("resolveThemePreference defaults to system for fresh browsers", () => {
  assert.equal(resolveThemePreference(null), DEFAULT_THEME_PREFERENCE);
  assert.equal(resolveThemePreference("invalid"), "system");
  assert.equal(resolveThemePreference("light"), "light");
  assert.equal(resolveThemePreference("dark"), "dark");
  assert.equal(resolveThemePreference("system"), "system");
});

test("detectSystemThemeFromFlags mirrors browser prefers-color-scheme", () => {
  assert.equal(detectSystemThemeFromFlags(false, true), "light");
  assert.equal(detectSystemThemeFromFlags(true, false), "dark");
  assert.equal(detectSystemThemeFromFlags(false, false, "dark"), "dark");
  assert.equal(detectSystemThemeFromFlags(false, false, "light"), "light");
});

test("resolveTheme returns stored explicit theme or browser system fallback", () => {
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("dark"), "dark");
  assert.equal(resolveTheme("invalid"), DEFAULT_THEME);
  assert.equal(resolveTheme(null), DEFAULT_THEME);
  assert.equal(resolveTheme(null, "light"), "light");
  assert.equal(resolveTheme("system", "light"), "light");
  assert.equal(resolveTheme("system", "dark"), "dark");
  assert.equal(resolveTheme("light", "dark"), "light");
  assert.equal(resolveTheme("dark", "light"), "dark");
});

test("getNextTheme toggles cleanly between dark and light", () => {
  assert.equal(getNextTheme("dark"), "light");
  assert.equal(getNextTheme("light"), "dark");
});

test("THEME_INIT_SCRIPT references storage key, prefers-color-scheme, and both theme classes", () => {
  assert.ok(THEME_INIT_SCRIPT.includes(THEME_STORAGE_KEY));
  assert.ok(THEME_INIT_SCRIPT.includes("prefers-color-scheme: light"));
  assert.ok(THEME_INIT_SCRIPT.includes("prefers-color-scheme: dark"));
  assert.ok(THEME_INIT_SCRIPT.includes("light"));
  assert.ok(THEME_INIT_SCRIPT.includes("dark"));
});
