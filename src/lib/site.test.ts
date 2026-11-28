import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SITE_NAME,
  SITE_ALTERNATE_NAMES,
  SITE_WORDMARK,
  SITE_LOCALE,
  SITE_ICON_PATH,
  SITE_TITLE_TEMPLATE,
  formatPageTitle,
} from "./site";

function flattenEntries(
  obj: Record<string, unknown>,
  prefix = ""
): Array<[string, unknown]> {
  return Object.entries(obj).flatMap(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flattenEntries(value as Record<string, unknown>, nextKey);
    }
    return [[nextKey, value] as [string, unknown]];
  });
}

function readLocale(name: "kr" | "fr" | "en"): Record<string, unknown> {
  const filePath = path.join(process.cwd(), "src", "messages", `${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
}

test("site constants match official BAYONDY branding", () => {
  assert.equal(SITE_NAME, "BAYONDY");
  assert.deepEqual(SITE_ALTERNATE_NAMES, []);
  assert.equal(SITE_WORDMARK, "BAYONDY");
  assert.equal(SITE_LOCALE, "ht_HT");
  assert.equal(SITE_ICON_PATH, "/icons/icon-192.png");
  assert.equal(SITE_TITLE_TEMPLATE, "%s | BAYONDY");
  assert.equal(formatPageTitle("FAQ"), "FAQ | BAYONDY");
});

test("kr, fr, and en translation dictionaries share identical non-empty keys", () => {
  const krEntries = flattenEntries(readLocale("kr"));
  const frEntries = flattenEntries(readLocale("fr"));
  const enEntries = flattenEntries(readLocale("en"));

  const kr = krEntries.map(([k]) => k).sort();
  const fr = frEntries.map(([k]) => k).sort();
  const en = enEntries.map(([k]) => k).sort();

  assert.deepEqual(fr, kr);
  assert.deepEqual(en, kr);

  for (const [locale, entries] of [
    ["kr", krEntries],
    ["fr", frEntries],
    ["en", enEntries],
  ] as const) {
    for (const [key, val] of entries) {
      assert.equal(
        typeof val,
        "string",
        `${locale} translation key ${key} must be a string`
      );
      assert.ok(
        typeof val === "string" && val.trim().length > 0,
        `${locale} translation key ${key} must not be empty`
      );
    }
  }
});

test("SEO metadata strings meet length and naming requirements in all locales", () => {
  for (const locale of ["kr", "fr", "en"] as const) {
    const dict = readLocale(locale) as {
      accueil: { titre: string };
      seo: { nom: string; titreAccueil: string; description: string; llmsResume: string };
    };

    assert.equal(dict.accueil.titre, "BAYONDY");
    assert.equal(dict.seo.nom, "BAYONDY");
    assert.ok(
      dict.seo.description.length >= 120 && dict.seo.description.length <= 160,
      `${locale} seo.description length (${dict.seo.description.length}) must be between 120 and 160`
    );
    assert.ok(
      dict.seo.titreAccueil.includes("BAYONDY"),
      `${locale} seo.titreAccueil must contain BAYONDY`
    );
  }

  const kr = readLocale("kr") as { seo: { titreAccueil: string } };
  assert.equal(
    kr.seo.titreAccueil,
    "BAYONDY — Fòmasyon videyo an kreyòl ayisyen"
  );
});
