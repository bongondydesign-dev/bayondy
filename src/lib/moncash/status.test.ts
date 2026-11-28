import test from "node:test";
import assert from "node:assert/strict";
import {
  amountsMatch,
  buildMonCashPayStatusHeaders,
  buildMonCashPayStatusLookupUrls,
  extractSafeHttpOrigin,
  extractSafeUpstreamError,
  normalizeMonCashStatus,
  normalizeMonCashWebhookEvent,
  parseMonCashPayStatusResponse,
  resolveMonCashCandidateOrigins,
  resolveMonCashRequestOrigin,
  resolveMonCashSecretKey,
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

test("parseMonCashPayStatusResponse parses standard, string-amount, boolean-paid, and nested payloads", () => {
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

  const booleanPaid = parseMonCashPayStatusResponse({
    result: {
      reference: "byd_bool_1",
      paid: true,
      amount: 1000,
    },
  });
  assert.equal(booleanPaid.ok, true);
  if (booleanPaid.ok) {
    assert.equal(booleanPaid.data.status, "completed");
    assert.equal(booleanPaid.data.amount, 1000);
  }

  const bad = parseMonCashPayStatusResponse({ foo: "bar" });
  assert.equal(bad.ok, false);
});

test("extractSafeHttpOrigin, resolveMonCashRequestOrigin, and resolveMonCashCandidateOrigins handle priorities safely", () => {
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

  assert.deepEqual(
    resolveMonCashCandidateOrigins({
      returnUrl: "https://bayondy.vercel.app/merci",
      requestOriginHeader: "https://bayondy.vercel.app",
      forwardedHost: "bayondy.com",
      forwardedProto: "https",
      configuredSiteUrl: "https://bayondy.com",
    }),
    ["https://bayondy.vercel.app", "https://bayondy.com"]
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

test("resolveMonCashSecretKey and extractSafeUpstreamError sanitize inputs cleanly", () => {
  assert.equal(
    resolveMonCashSecretKey({ MCC_SECRET_KEY: ' "sk_test_proj_abc" ' }),
    "sk_test_proj_abc"
  );
  assert.equal(
    resolveMonCashSecretKey({ MCC_SECRET: "sk_test_proj_fallback" }),
    "sk_test_proj_fallback"
  );
  assert.equal(resolveMonCashSecretKey({}), "");

  assert.deepEqual(
    extractSafeUpstreamError({ error: "project_lookup_failed", code: "ERR_LOOKUP" }),
    { code: "ERR_LOOKUP", message: "project_lookup_failed" }
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
