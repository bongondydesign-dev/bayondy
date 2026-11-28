import test from "node:test";
import assert from "node:assert/strict";
import {
  amountsMatch,
  buildMonCashPayStatusHeaders,
  buildMonCashPayStatusLookupUrls,
  extractSafeHttpOrigin,
  normalizeMonCashStatus,
  normalizeMonCashWebhookEvent,
  parseMonCashPayStatusResponse,
  resolveMonCashRequestOrigin,
} from "./status";

test("normalizeMonCashStatus normalizes completed, failed, and pending statuses", () => {
  assert.equal(normalizeMonCashStatus("completed"), "completed");
  assert.equal(normalizeMonCashStatus("Complete"), "completed");
  assert.equal(normalizeMonCashStatus("Complété"), "completed");
  assert.equal(normalizeMonCashStatus("confirmed"), "completed");
  assert.equal(normalizeMonCashStatus("PAID"), "completed");
  assert.equal(normalizeMonCashStatus("succeeded"), "completed");
  assert.equal(normalizeMonCashStatus("failed"), "failed");
  assert.equal(normalizeMonCashStatus("cancelled"), "failed");
  assert.equal(normalizeMonCashStatus("expired"), "failed");
  assert.equal(normalizeMonCashStatus("pending"), "pending");
  assert.equal(normalizeMonCashStatus("awaiting_payment"), "pending");
  assert.equal(normalizeMonCashStatus("other"), "unknown");
});

test("normalizeMonCashWebhookEvent maps completed, failed, and ignored events", () => {
  assert.equal(normalizeMonCashWebhookEvent("payment.completed", "completed"), "completed");
  assert.equal(normalizeMonCashWebhookEvent("payment.succeeded", null), "completed");
  assert.equal(normalizeMonCashWebhookEvent("payment.updated", "paid"), "completed");
  assert.equal(normalizeMonCashWebhookEvent("payment.failed", "failed"), "failed");
  assert.equal(normalizeMonCashWebhookEvent("payment.cancelled", "cancelled"), "failed");
  assert.equal(normalizeMonCashWebhookEvent("payment.updated", "expired"), "failed");
  assert.equal(normalizeMonCashWebhookEvent("payout.completed", "completed"), "ignored");
});

test("amountsMatch validates integer HTG amounts cleanly", () => {
  assert.equal(amountsMatch(1500, 1500), true);
  assert.equal(amountsMatch(1500, null), true);
  assert.equal(amountsMatch(1500, 1499), false);
  assert.equal(amountsMatch(1500, "1500"), false);
});

test("parseMonCashPayStatusResponse parses standard, string-amount, and nested transaction payloads", () => {
  const completed = parseMonCashPayStatusResponse({
    reference: "byd_c1_abc",
    status: "completed",
    amount: 500,
    netAmount: 485,
    completedAt: "2026-11-27T18:20:00Z",
    failureReason: null,
  });
  assert.equal(completed.ok, true);
  if (completed.ok) {
    assert.equal(completed.data.status, "completed");
    assert.equal(completed.data.reference, "byd_c1_abc");
    assert.equal(completed.data.amount, 500);
  }

  const nestedTransaction = parseMonCashPayStatusResponse({
    data: {
      transaction: {
        orderId: "byd_qhtFbd9LzIoyakVAZlhx_mwzs6kh9_7bdbb0d4",
        paymentStatus: "Complété",
        amount: "2000",
        paidAt: "2026-11-27T21:18:00Z",
      },
    },
  });
  assert.equal(nestedTransaction.ok, true);
  if (nestedTransaction.ok) {
    assert.equal(nestedTransaction.data.status, "completed");
    assert.equal(
      nestedTransaction.data.reference,
      "byd_qhtFbd9LzIoyakVAZlhx_mwzs6kh9_7bdbb0d4"
    );
    assert.equal(nestedTransaction.data.amount, 2000);
    assert.equal(nestedTransaction.data.completedAt, "2026-11-27T21:18:00Z");
  }

  const bad = parseMonCashPayStatusResponse({ foo: "bar" });
  assert.equal(bad.ok, false);
});

test("extractSafeHttpOrigin and resolveMonCashRequestOrigin prioritize returnUrl safely", () => {
  assert.equal(extractSafeHttpOrigin("https://bayondy.com/merci?orderId=1"), "https://bayondy.com");
  assert.equal(extractSafeHttpOrigin("javascript:alert(1)"), null);

  assert.equal(
    resolveMonCashRequestOrigin({
      returnUrl: "https://bayondy.vercel.app/merci?orderId=abc",
      requestOriginHeader: "https://other.example",
      forwardedHost: "proxy.example",
      forwardedProto: "https",
      configuredSiteUrl: "https://bayondy.com",
    }),
    "https://bayondy.vercel.app"
  );

  assert.equal(
    resolveMonCashRequestOrigin({
      returnUrl: null,
      requestOriginHeader: null,
      forwardedHost: "bayondy.com, internal.proxy",
      forwardedProto: "https, http",
      configuredSiteUrl: "https://fallback.com",
    }),
    "https://bayondy.com"
  );

  assert.equal(
    resolveMonCashRequestOrigin({
      returnUrl: "not-a-url",
      forwardedHost: "evil host/path",
      configuredSiteUrl: "https://bayondy.com/app",
    }),
    "https://bayondy.com"
  );
});

test("buildMonCashPayStatusHeaders includes Authorization and valid Origin", () => {
  const headers = buildMonCashPayStatusHeaders("sk_live_test", "https://bayondy.com/merci");
  assert.deepEqual(headers, {
    Authorization: "Bearer sk_live_test",
    Accept: "application/json",
    Origin: "https://bayondy.com",
  });

  const withoutOrigin = buildMonCashPayStatusHeaders("sk_live_test", null);
  assert.equal(withoutOrigin.Origin, undefined);
});

test("buildMonCashPayStatusLookupUrls builds deduplicated referenceId then reference URLs", () => {
  const urls = buildMonCashPayStatusLookupUrls(
    "https://api.moncashconnect.com/v1/pay-status",
    ["byd_123", "byd_123", "mcc_ref_456", null, ""]
  );
  assert.deepEqual(urls, [
    "https://api.moncashconnect.com/v1/pay-status?referenceId=byd_123",
    "https://api.moncashconnect.com/v1/pay-status?reference=byd_123",
    "https://api.moncashconnect.com/v1/pay-status?referenceId=mcc_ref_456",
    "https://api.moncashconnect.com/v1/pay-status?reference=mcc_ref_456",
  ]);
});
