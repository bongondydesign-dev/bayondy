import test from "node:test";
import assert from "node:assert/strict";
import {
  amountsMatch,
  normalizeMonCashStatus,
  normalizeMonCashWebhookEvent,
  parseMonCashPayStatusResponse,
} from "./status";

test("normalizeMonCashStatus normalizes completed, failed, and pending statuses", () => {
  assert.equal(normalizeMonCashStatus("completed"), "completed");
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

test("parseMonCashPayStatusResponse parses standard and nested MonCashConnect payloads", () => {
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

  const nestedPending = parseMonCashPayStatusResponse({
    data: {
      referenceId: "byd_c1_def",
      status: "pending",
      amount: 1000,
    },
  });
  assert.equal(nestedPending.ok, true);
  if (nestedPending.ok) {
    assert.equal(nestedPending.data.status, "pending");
    assert.equal(nestedPending.data.reference, "byd_c1_def");
  }

  const bad = parseMonCashPayStatusResponse({ foo: "bar" });
  assert.equal(bad.ok, false);
});
