import test from "node:test";
import assert from "node:assert/strict";
import {
  parseMonCashWebhookEvent,
  signMonCashWebhookPayload,
  verifyMonCashWebhookSignature,
  verifyMonCashWebhookTimestamp,
} from "./webhook";

const TEST_SECRET = "whsec_test_moncashconnect_secret";

test("verifyMonCashWebhookSignature validates sha256=<hex> over exact raw body", () => {
  const rawBody = JSON.stringify({
    event: "payment.completed",
    reference: "byd_course_123",
    amount: 2500,
    status: "completed",
    completedAt: "2026-11-27T18:20:00Z",
  });

  const validSig = signMonCashWebhookPayload(rawBody, TEST_SECRET);
  assert.equal(verifyMonCashWebhookSignature(rawBody, validSig, TEST_SECRET), true);

  // Altered body must fail
  assert.equal(
    verifyMonCashWebhookSignature(rawBody + " ", validSig, TEST_SECRET),
    false
  );

  // Wrong prefix or wrong secret must fail
  assert.equal(
    verifyMonCashWebhookSignature(rawBody, validSig.replace("sha256=", ""), TEST_SECRET),
    false
  );
  assert.equal(
    verifyMonCashWebhookSignature(rawBody, validSig, "wrong_secret"),
    false
  );
  assert.equal(verifyMonCashWebhookSignature(rawBody, null, TEST_SECRET), false);
});

test("verifyMonCashWebhookTimestamp enforces 300-second window", () => {
  const now = 1_700_000_000;

  assert.deepEqual(verifyMonCashWebhookTimestamp(String(now), now), {
    ok: true,
    timestamp: now,
  });
  assert.deepEqual(verifyMonCashWebhookTimestamp(String(now - 300), now), {
    ok: true,
    timestamp: now - 300,
  });
  assert.deepEqual(verifyMonCashWebhookTimestamp(String(now + 300), now), {
    ok: true,
    timestamp: now + 300,
  });

  assert.deepEqual(verifyMonCashWebhookTimestamp(String(now - 301), now), {
    ok: false,
    code: "TIMESTAMP_EXPIRED",
  });
  assert.deepEqual(verifyMonCashWebhookTimestamp(String(now + 301), now), {
    ok: false,
    code: "TIMESTAMP_EXPIRED",
  });
  assert.deepEqual(verifyMonCashWebhookTimestamp(String(now * 1000), now), {
    ok: true,
    timestamp: now,
  });
  assert.deepEqual(verifyMonCashWebhookTimestamp(String((now - 301) * 1000), now), {
    ok: false,
    code: "TIMESTAMP_EXPIRED",
  });
  assert.deepEqual(verifyMonCashWebhookTimestamp("not-a-timestamp", now), {
    ok: false,
    code: "INVALID_TIMESTAMP",
  });
  assert.deepEqual(verifyMonCashWebhookTimestamp(null, now), {
    ok: false,
    code: "MISSING_TIMESTAMP",
  });
});

test("parseMonCashWebhookEvent parses payment.completed and payment.failed events", () => {
  const completedRaw = JSON.stringify({
    event: "payment.completed",
    reference: "order_abc_01",
    amount: 5000,
    status: "completed",
    completedAt: "2026-11-27T18:25:00Z",
  });
  const parsedCompleted = parseMonCashWebhookEvent(completedRaw);
  assert.equal(parsedCompleted.ok, true);
  if (parsedCompleted.ok) {
    assert.equal(parsedCompleted.data.event, "payment.completed");
    assert.equal(parsedCompleted.data.reference, "order_abc_01");
    assert.equal(parsedCompleted.data.amount, 5000);
  }

  const failedRaw = JSON.stringify({
    event: "payment.failed",
    reference: "order_abc_02",
    amount: 5000,
    status: "failed",
    completedAt: "2026-11-27T18:25:00Z",
  });
  const parsedFailed = parseMonCashWebhookEvent(failedRaw);
  assert.equal(parsedFailed.ok, true);
  if (parsedFailed.ok) {
    assert.equal(parsedFailed.data.event, "payment.failed");
    assert.equal(parsedFailed.data.reference, "order_abc_02");
  }

  const cancelledRaw = JSON.stringify({
    event: "payment.cancelled",
    reference: "order_abc_03",
    amount: 5000,
    status: "cancelled",
    completedAt: null,
  });
  const parsedCancelled = parseMonCashWebhookEvent(cancelledRaw);
  assert.equal(parsedCancelled.ok, true);
  if (parsedCancelled.ok) {
    assert.equal(parsedCancelled.data.event, "payment.cancelled");
    assert.equal(parsedCancelled.data.reference, "order_abc_03");
    assert.equal(parsedCancelled.data.status, "cancelled");
  }

  const badJson = parseMonCashWebhookEvent("{broken");
  assert.equal(badJson.ok, false);
});
