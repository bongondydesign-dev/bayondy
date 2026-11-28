import test from "node:test";
import assert from "node:assert/strict";
import {
  runFulfillPaidOrderTransaction,
  type FulfillmentDbAdapter,
  type TransactionDocRefLike,
} from "./fulfillmentCore";

function createStrictMockDb(initialDocs: Record<string, Record<string, unknown>>) {
  const store = new Map<string, Record<string, unknown>>(
    Object.entries(initialDocs).map(([k, v]) => [k, { ...v }])
  );
  const operations: string[] = [];

  const db: FulfillmentDbAdapter = {
    getEnrollmentRef(uid, courseId): TransactionDocRefLike {
      return { id: `${uid}_${courseId}` };
    },
    async runTransaction(fn) {
      let hasWritten = false;
      const pendingWrites: Array<() => void> = [];

      const tx = {
        async get(ref: TransactionDocRefLike) {
          if (hasWritten) {
            throw new Error(
              "Firestore transactions require all reads to be executed before all writes."
            );
          }
          operations.push(`get:${ref.id}`);
          const doc = store.get(ref.id);
          return {
            exists: Boolean(doc),
            data: () => (doc ? { ...doc } : undefined),
          };
        },
        update(ref: TransactionDocRefLike, patch: Record<string, unknown>) {
          hasWritten = true;
          operations.push(`update:${ref.id}`);
          pendingWrites.push(() => {
            const prev = store.get(ref.id) ?? {};
            store.set(ref.id, { ...prev, ...patch });
          });
        },
        set(ref: TransactionDocRefLike, data: Record<string, unknown>) {
          hasWritten = true;
          operations.push(`set:${ref.id}`);
          pendingWrites.push(() => {
            store.set(ref.id, { ...data });
          });
        },
      };

      const result = await fn(tx);
      for (const write of pendingWrites) write();
      return result;
    },
  };

  return { db, store, operations };
}

test("runFulfillPaidOrderTransaction executes all reads before writes and activates new enrollment", async () => {
  const orderId = "byd_qhtFbd9LzIoyakVAZlhx_mwzs6kh9_7bdbb0d4";
  const { db, store, operations } = createStrictMockDb({
    [orderId]: {
      uid: "user_1",
      courseId: "course_1",
      amount: 2000,
      status: "awaiting_payment",
    },
  });

  const result = await runFulfillPaidOrderTransaction({
    db,
    paymentRef: { id: orderId },
    reference: orderId,
    amount: 2000,
    paidAtValue: "2026-11-27T21:18:00.000Z",
    serverTimestamp: "SERVER_TS",
  });

  assert.equal(result.outcome, "paid");
  assert.deepEqual(operations, [
    `get:${orderId}`,
    "get:user_1_course_1",
    `update:${orderId}`,
    "set:user_1_course_1",
  ]);
  assert.equal(store.get(orderId)?.status, "paid");
  assert.equal(store.get("user_1_course_1")?.status, "active");
});

test("runFulfillPaidOrderTransaction reactivates inactive enrollment when payment was already paid", async () => {
  const orderId = "byd_paid_order";
  const { db, store } = createStrictMockDb({
    [orderId]: {
      uid: "user_2",
      courseId: "course_2",
      amount: 1500,
      status: "paid",
    },
    user_2_course_2: {
      uid: "user_2",
      courseId: "course_2",
      status: "revoked",
    },
  });

  const result = await runFulfillPaidOrderTransaction({
    db,
    paymentRef: { id: orderId },
    reference: orderId,
    amount: 1500,
    paidAtValue: null,
    serverTimestamp: "SERVER_TS",
  });

  assert.equal(result.outcome, "already_paid");
  assert.equal(store.get("user_2_course_2")?.status, "active");
});

test("runFulfillPaidOrderTransaction rejects amount mismatch without performing any writes", async () => {
  const orderId = "byd_mismatch";
  const { db, store, operations } = createStrictMockDb({
    [orderId]: {
      uid: "user_3",
      courseId: "course_3",
      amount: 2000,
      status: "awaiting_payment",
    },
  });

  const result = await runFulfillPaidOrderTransaction({
    db,
    paymentRef: { id: orderId },
    reference: orderId,
    amount: 500,
    paidAtValue: null,
    serverTimestamp: "SERVER_TS",
  });

  assert.equal(result.outcome, "amount_mismatch");
  assert.deepEqual(operations, [`get:${orderId}`]);
  assert.equal(store.get(orderId)?.status, "awaiting_payment");
  assert.equal(store.get("user_3_course_3"), undefined);
});

test("runFulfillPaidOrderTransaction rejects null amount on unpaid order without writes", async () => {
  const orderId = "byd_missing_amount";
  const { db, store, operations } = createStrictMockDb({
    [orderId]: {
      uid: "user_4",
      courseId: "course_4",
      amount: 2000,
      status: "awaiting_payment",
    },
  });

  const result = await runFulfillPaidOrderTransaction({
    db,
    paymentRef: { id: orderId },
    reference: orderId,
    amount: null,
    paidAtValue: null,
    serverTimestamp: "SERVER_TS",
  });

  assert.equal(result.outcome, "amount_mismatch");
  assert.deepEqual(operations, [`get:${orderId}`]);
  assert.equal(store.get(orderId)?.status, "awaiting_payment");
  assert.equal(store.get("user_4_course_4"), undefined);
});
