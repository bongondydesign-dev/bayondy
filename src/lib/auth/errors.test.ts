import test from "node:test";
import assert from "node:assert/strict";
import {
  extractAuthErrorCode,
  getAuthErrorMessageKey,
  shouldIgnoreAuthError,
} from "./errors";
import { t } from "../i18n";

test("extractAuthErrorCode reads Firebase error.code and falls back to message pattern", () => {
  assert.equal(
    extractAuthErrorCode({ code: "auth/unauthorized-domain" }),
    "auth/unauthorized-domain"
  );
  assert.equal(
    extractAuthErrorCode({
      message: "Firebase: Error (auth/popup-blocked).",
    }),
    "auth/popup-blocked"
  );
  assert.equal(extractAuthErrorCode(null), "");
  assert.equal(extractAuthErrorCode("unexpected"), "");
});

test("shouldIgnoreAuthError ignores user-cancelled popup actions only", () => {
  assert.equal(shouldIgnoreAuthError("auth/popup-closed-by-user"), true);
  assert.equal(shouldIgnoreAuthError("auth/cancelled-popup-request"), true);
  assert.equal(shouldIgnoreAuthError("auth/unauthorized-domain"), false);
  assert.equal(shouldIgnoreAuthError("auth/popup-blocked"), false);
});

test("getAuthErrorMessageKey maps Google and email auth errors to localized keys", () => {
  const cases: Array<[string, string]> = [
    ["auth/unauthorized-domain", "auth.erreurs.domaineNonAutorise"],
    ["auth/popup-blocked", "auth.erreurs.popupBloquee"],
    ["auth/cancelled-popup-request", "auth.erreurs.popupFermee"],
    ["auth/popup-closed-by-user", "auth.erreurs.popupFermee"],
    ["auth/operation-not-allowed", "auth.erreurs.methodeNonAutorisee"],
    [
      "auth/account-exists-with-different-credential",
      "auth.erreurs.compteAutreMethode",
    ],
    ["auth/invalid-api-key", "auth.erreurs.configurationInvalide"],
    ["auth/missing-config", "auth.erreurs.configurationInvalide"],
    ["auth/network-request-failed", "auth.erreurs.erreurReseau"],
    ["auth/unknown-code", "auth.erreurs.generique"],
  ];

  for (const [code, expectedKey] of cases) {
    const key = getAuthErrorMessageKey(code);
    assert.equal(key, expectedKey);
    // Verify key resolves to an actual translated message in all 3 locales
    for (const lang of ["kr", "fr", "en"] as const) {
      const text = t(key, lang);
      assert.notEqual(text, key, `Missing translation for ${key} in ${lang}`);
      assert.ok(text.length > 0);
    }
  }
});
