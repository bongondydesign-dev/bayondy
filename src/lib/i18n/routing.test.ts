import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_APP_LANG,
  appLangToHtmlLang,
  resolveAppLang,
  routeLangToAppLang,
} from "./config";
import {
  buildLanguageCookieString,
  buildSwitchLanguageUrl,
  extractAppLangFromPathname,
  getRedirectLocaleForIncomingRequest,
  isBotUserAgent,
  localizePath,
  stripLocalePrefix,
} from "./routing";

test("default language is French for new visitors and unknown values", () => {
  assert.equal(DEFAULT_APP_LANG, "fr");
  assert.equal(resolveAppLang(undefined), "fr");
  assert.equal(resolveAppLang(null), "fr");
  assert.equal(resolveAppLang(""), "fr");
  assert.equal(resolveAppLang("en"), "fr");
  assert.equal(resolveAppLang("fr"), "fr");
  assert.equal(resolveAppLang("kr"), "kr");
  assert.equal(resolveAppLang("ht"), "kr");
  assert.equal(routeLangToAppLang("fr"), "fr");
  assert.equal(routeLangToAppLang("ht"), "kr");
  assert.equal(routeLangToAppLang("en"), null);
  assert.equal(appLangToHtmlLang("fr"), "fr");
  assert.equal(appLangToHtmlLang("kr"), "ht");
});

test("buildSwitchLanguageUrl preserves path, query string, and hash across fr and kr", () => {
  assert.equal(buildSwitchLanguageUrl("/", "kr"), "/ht");
  assert.equal(buildSwitchLanguageUrl("/ht", "fr"), "/");
  assert.equal(
    buildSwitchLanguageUrl("/formations?niveau=debutant#catalogue", "kr"),
    "/ht/formations?niveau=debutant#catalogue"
  );
  assert.equal(
    buildSwitchLanguageUrl("/ht/formations/react-bases?foo=1&bar=2#programme", "fr"),
    "/formations/react-bases?foo=1&bar=2#programme"
  );
  assert.equal(buildSwitchLanguageUrl("/#kijan", "kr"), "/ht#kijan");
  assert.equal(buildSwitchLanguageUrl("/ht#kijan", "fr"), "/#kijan");
  assert.equal(buildSwitchLanguageUrl("/admin/paiements?page=2", "kr"), "/admin/paiements?page=2");
  assert.equal(buildSwitchLanguageUrl("/admin/paiements?page=2", "fr"), "/admin/paiements?page=2");
});

test("buildSwitchLanguageUrl rejects external URLs, protocol-relative URLs, and arbitrary schemes", () => {
  const maliciousInputs = [
    "https://evil.example/formations",
    "http://evil.example/formations",
    "//evil.example/formations",
    "///evil.example/formations",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "/\\evil.example",
    "formations",
    "",
  ];

  for (const input of maliciousInputs) {
    assert.equal(buildSwitchLanguageUrl(input, "fr"), "/");
    assert.equal(buildSwitchLanguageUrl(input, "kr"), "/ht");
  }
});

test("localizePath strips stale prefixes and maps paths correctly", () => {
  assert.equal(stripLocalePrefix("/ht/faq"), "/faq");
  assert.equal(stripLocalePrefix("/fr/faq"), "/faq");
  assert.equal(stripLocalePrefix("/ht"), "/");
  assert.equal(extractAppLangFromPathname("/ht/formations"), "kr");
  assert.equal(extractAppLangFromPathname("/formations"), "fr");
  assert.equal(localizePath("/mes-formations/react", "kr"), "/ht/mes-formations/react");
  assert.equal(localizePath("/ht/mes-formations/react", "fr"), "/mes-formations/react");
});

test("incoming request resolution respects default fr, returning kr cookie, and crawlers", () => {
  // New visitor (no cookie) on "/" -> rewrite internally to /fr
  assert.deepEqual(
    getRedirectLocaleForIncomingRequest({ pathname: "/" }),
    { action: "rewrite", destinationPathname: "/fr" }
  );

  // Returning human visitor with kr cookie on "/formations" -> redirect to /ht/formations
  assert.deepEqual(
    getRedirectLocaleForIncomingRequest({
      pathname: "/formations",
      cookieLang: "kr",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    }),
    { action: "redirect", destinationPathname: "/ht/formations" }
  );

  // Crawler/bot even with kr cookie -> never redirected, served default French
  assert.equal(isBotUserAgent("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
  assert.deepEqual(
    getRedirectLocaleForIncomingRequest({
      pathname: "/formations",
      cookieLang: "kr",
      userAgent: "Googlebot/2.1 (+http://www.google.com/bot.html)",
    }),
    { action: "rewrite", destinationPathname: "/fr/formations" }
  );

  // Explicit /fr prefix redirects to canonical unprefixed path
  assert.deepEqual(
    getRedirectLocaleForIncomingRequest({ pathname: "/fr/faq" }),
    { action: "redirect", destinationPathname: "/faq" }
  );

  // /ht passes directly
  assert.deepEqual(
    getRedirectLocaleForIncomingRequest({ pathname: "/ht/faq", cookieLang: "fr" }),
    { action: "next" }
  );

  // /admin and /api are never prefixed
  assert.deepEqual(
    getRedirectLocaleForIncomingRequest({ pathname: "/admin/eleves", cookieLang: "kr" }),
    { action: "next" }
  );
  assert.deepEqual(
    getRedirectLocaleForIncomingRequest({ pathname: "/api/moncash/webhook", cookieLang: "kr" }),
    { action: "next" }
  );
});

test("buildLanguageCookieString produces a 1-year SameSite=Lax functional cookie", () => {
  assert.equal(
    buildLanguageCookieString("kr", false),
    "bayondy_lang=kr; Path=/; Max-Age=31536000; SameSite=Lax"
  );
  assert.equal(
    buildLanguageCookieString("fr", true),
    "bayondy_lang=fr; Path=/; Max-Age=31536000; SameSite=Lax; Secure"
  );
});
