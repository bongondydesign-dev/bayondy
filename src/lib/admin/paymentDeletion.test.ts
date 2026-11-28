import test from "node:test";
import assert from "node:assert/strict";
import {
  buildClearedPaymentsState,
  chunkArray,
  isPaymentsClearAllowed,
  validateClearPaymentsBody,
} from "./paymentDeletion";

test("isPaymentsClearAllowed only enables clearing when idle and non-empty", () => {
  assert.equal(isPaymentsClearAllowed(5, false, false), true);
  assert.equal(isPaymentsClearAllowed(1, false, false), true);
  assert.equal(isPaymentsClearAllowed(0, false, false), false);
  assert.equal(isPaymentsClearAllowed(5, true, false), false);
  assert.equal(isPaymentsClearAllowed(5, false, true), false);
  assert.equal(isPaymentsClearAllowed(-1, false, false), false);
  assert.equal(isPaymentsClearAllowed(Number.NaN, false, false), false);
});

test("validateClearPaymentsBody requires explicit confirm: true", () => {
  assert.deepEqual(validateClearPaymentsBody({ confirm: true }), { ok: true });
  assert.equal(validateClearPaymentsBody({ confirm: false }).ok, false);
  assert.equal(validateClearPaymentsBody({}).ok, false);
  assert.equal(validateClearPaymentsBody(null).ok, false);
  assert.equal(validateClearPaymentsBody("confirm").ok, false);
  assert.equal(validateClearPaymentsBody([]).ok, false);
});

test("buildClearedPaymentsState resets list, cursor, search and filter", () => {
  assert.deepEqual(buildClearedPaymentsState(), {
    payments: [],
    nextCursor: null,
    search: "",
    statusFilter: "all",
  });
});

test("chunkArray batches payment refs within Firestore limits", () => {
  const ids = Array.from({ length: 1000 }, (_, i) => `pay_${i}`);
  const chunks = chunkArray(ids, 450);
  assert.equal(chunks.length, 3);
  assert.equal(chunks[0].length, 450);
  assert.equal(chunks[1].length, 450);
  assert.equal(chunks[2].length, 100);
});
