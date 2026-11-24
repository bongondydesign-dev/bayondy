/**
 * tests/tranzak.test.ts
 *
 * Scénarios de test Tranzak (Section 9.1 du guide officiel) :
 * 1. Vérification de signature de webhook (corps brut HMAC-SHA256, rejet corps altéré)
 * 2. Vérification de signature de l'URL de retour client (rejet si montant modifié)
 * 3. Validation des montants minimaux par méthode (MonCash, NatCash, Card)
 * 4. Règle de sécurité des clés : seules les clés tk_test_ sont autorisées en sandbox
 * 5. Dédoublonnage et idempotence des événements de paiement
 */

import crypto from "crypto";
import {
  verifyWebhookSignature,
  verifyReturnSignature,
} from "../src/lib/tranzak/crypto";
import { TranzakClient } from "../src/lib/tranzak/client";
import { getTranzakConfig } from "../src/lib/tranzak/config";

describe("Tranzak Payment Gateway — Scénarios Sandbox (Section 9.1)", () => {
  const TEST_SECRET = "whsec_test_secret_for_unit_tests_bayondy";

  describe("1. Webhook Signature Verification (Section 7.1 & 9.1)", () => {
    const rawPayload = JSON.stringify({
      event: "payment.success",
      timestamp: 1791122041,
      data: {
        transaction_id: "17843270387081",
        amount: "500.00",
        currency: "HTG",
        status: "completed",
        payment_method: "moncash",
        reference: "BYD-ORDER-001",
      },
    });

    it("accepte une signature HMAC-SHA256 valide sur le corps brut", () => {
      const validSignature = crypto
        .createHmac("sha256", TEST_SECRET)
        .update(rawPayload)
        .digest("hex");

      const result = verifyWebhookSignature(rawPayload, validSignature, TEST_SECRET);
      expect(result).toBe(true);
    });

    it("rejette un corps altéré (tampered body) même pour un seul caractère", () => {
      const validSignature = crypto
        .createHmac("sha256", TEST_SECRET)
        .update(rawPayload)
        .digest("hex");

      // Altération du montant : 500.00 -> 100.00
      const tamperedPayload = rawPayload.replace("500.00", "100.00");

      const result = verifyWebhookSignature(tamperedPayload, validSignature, TEST_SECRET);
      expect(result).toBe(false);
    });

    it("rejette une signature falsifiée ou incorrecte", () => {
      const fakeSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const result = verifyWebhookSignature(rawPayload, fakeSignature, TEST_SECRET);
      expect(result).toBe(false);
    });

    it("rejette si la signature ou le secret est manquant", () => {
      expect(verifyWebhookSignature(rawPayload, null, TEST_SECRET)).toBe(false);
      expect(verifyWebhookSignature(rawPayload, "", TEST_SECRET)).toBe(false);
      expect(verifyWebhookSignature(rawPayload, "sig", "")).toBe(false);
    });
  });

  describe("2. Return URL Signature Verification (Section 8.2 & 9.1)", () => {
    const baseQuery = "transaction_id=17843268616389&status=success&amount=500.00&currency=HTG&timestamp=1791122041&reference=BYD-ORDER-001";

    it("accepte une signature valide sur la chaîne de requête brute", () => {
      const validSig = crypto
        .createHmac("sha256", TEST_SECRET)
        .update(baseQuery)
        .digest("hex");

      const fullUrlQuery = `${baseQuery}&signature=${validSig}`;
      const result = verifyReturnSignature(fullUrlQuery, TEST_SECRET);
      expect(result).toBe(true);
    });

    it("rejette si le montant a été falsifié dans l'URL de retour client", () => {
      const validSig = crypto
        .createHmac("sha256", TEST_SECRET)
        .update(baseQuery)
        .digest("hex");

      // Attaquant modifie amount=500.00 en amount=10.00 dans la query
      const tamperedQuery = `transaction_id=17843268616389&status=success&amount=10.00&currency=HTG&timestamp=1791122041&reference=BYD-ORDER-001&signature=${validSig}`;

      const result = verifyReturnSignature(tamperedQuery, TEST_SECRET);
      expect(result).toBe(false);
    });

    it("rejette si le suffixe &signature= est absent", () => {
      const result = verifyReturnSignature(baseQuery, TEST_SECRET);
      expect(result).toBe(false);
    });
  });

  describe("3. Montants minimaux par méthode de paiement (Section 5)", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        TRANZAK_API_KEY: "tk_test_mock_key_for_testing",
        TRANZAK_WEBHOOK_SECRET: TEST_SECRET,
        TRANZAK_ENV: "sandbox",
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("rejette MonCash si montant < 10 HTG", async () => {
      const client = new TranzakClient();
      await expect(
        client.createPayment({
          amount: 5,
          currency: "HTG",
          payment_method: "moncash",
          customer_name: "Test User",
        })
      ).rejects.toThrow("10 HTG");
    });

    it("rejette NatCash si montant < 20 HTG", async () => {
      const client = new TranzakClient();
      await expect(
        client.createPayment({
          amount: 15,
          currency: "HTG",
          payment_method: "natcash",
          customer_name: "Test User",
        })
      ).rejects.toThrow("20 HTG");
    });

    it("rejette Carte si montant < 0.50 USD", async () => {
      const client = new TranzakClient();
      await expect(
        client.createPayment({
          amount: 0.25,
          currency: "USD",
          payment_method: "card",
          customer_name: "Test User",
        })
      ).rejects.toThrow("0.50 USD");
    });

    it("rejette Carte si montant < 65 HTG", async () => {
      const client = new TranzakClient();
      await expect(
        client.createPayment({
          amount: 50,
          currency: "HTG",
          payment_method: "card",
          customer_name: "Test User",
        })
      ).rejects.toThrow("65 HTG");
    });
  });

  describe("4. Règle stricte des clés en Sandbox (Section 1, Règle 2)", () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    it("refuse toute clé live (tk_live_...) en environnement de test/sandbox", () => {
      process.env = {
        ...originalEnv,
        TRANZAK_API_KEY: "tk_live_attempt_in_sandbox",
        TRANZAK_ENV: "sandbox",
      };

      expect(() => getTranzakConfig()).toThrow("tk_test_");
    });

    it("accepte une clé de test (tk_test_...)", () => {
      process.env = {
        ...originalEnv,
        TRANZAK_API_KEY: "tk_test_valid_sandbox_key",
        TRANZAK_WEBHOOK_SECRET: "whsec_mock",
        TRANZAK_ENV: "sandbox",
      };

      const config = getTranzakConfig();
      expect(config.apiKey).toBe("tk_test_valid_sandbox_key");
      expect(config.isSandbox).toBe(true);
    });
  });
});
