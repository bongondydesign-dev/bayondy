import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAdminPaymentOverview,
  buildLastSixMonthsBuckets,
  filterRecentDashboardPayments,
} from "./stats";

test("buildLastSixMonthsBuckets builds 6 chronological month buckets", () => {
  const buckets = buildLastSixMonthsBuckets(new Date("2026-11-15T12:00:00Z"));
  assert.equal(buckets.length, 6);
  assert.deepEqual(
    buckets.map((b) => b.monthKey),
    ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]
  );
  assert.deepEqual(
    buckets.map((b) => b.label),
    ["Jen", "Jiy", "Out", "Sep", "Okt", "Nov"]
  );
});

test("buildAdminPaymentOverview aggregates revenue, monthly bars, and recent rows", () => {
  const overview = buildAdminPaymentOverview(
    [
      {
        id: "p1",
        courseId: "c1",
        courseTitle: "React Avanse",
        amount: 2500,
        currency: "HTG",
        method: "moncash",
        status: "paid",
        merchantReference: "MCC-001",
        createdAtIso: "2026-11-10T10:00:00Z",
      },
      {
        id: "p2",
        courseId: "c2",
        amount: 35,
        currency: "USD",
        method: "card",
        status: "paid",
        merchantReference: "CRD-002",
        createdAtIso: "2026-10-05T08:00:00Z",
      },
      {
        id: "p3",
        courseId: "c1",
        amount: 2500,
        currency: "HTG",
        method: "moncash",
        status: "pending",
        merchantReference: "MCC-003",
        createdAtIso: "2026-11-20T15:30:00Z",
      },
      {
        id: "p4",
        courseId: "c3",
        amount: 1000,
        currency: "HTG",
        method: "moncash",
        status: "failed",
        merchantReference: "MCC-004",
        createdAtIso: "2025-01-01T00:00:00Z",
      },
    ],
    new Date("2026-11-28T00:00:00Z")
  );

  assert.deepEqual(overview.revenue, { HTG: 2500, USD: 35 });
  assert.deepEqual(overview.paymentsByStatus, {
    paid: 2,
    pending: 1,
    failed: 1,
  });

  const nov = overview.monthlyActivity.find((m) => m.monthKey === "2026-11");
  assert.deepEqual(nov, {
    monthKey: "2026-11",
    label: "Nov",
    paidCount: 1,
    otherCount: 1,
    totalCount: 2,
  });

  assert.equal(overview.recentPayments.length, 4);
  assert.equal(overview.recentPayments[0].id, "p3");
  assert.equal(overview.recentPayments[1].courseTitle, "React Avanse");
  assert.equal(overview.recentPayments[2].courseTitle, "c2");
});

test("filterRecentDashboardPayments filters case-insensitively across title, ref, and status", () => {
  const rows = [
    {
      id: "1",
      courseId: "c1",
      courseTitle: "TypeScript Pro",
      merchantReference: "MCC-900",
      method: "moncash",
      status: "paid",
    },
    {
      id: "2",
      courseId: "c2",
      courseTitle: "Node Basics",
      merchantReference: "MCC-901",
      method: "moncash",
      status: "pending",
    },
  ];

  assert.equal(filterRecentDashboardPayments(rows, "").length, 2);
  assert.equal(filterRecentDashboardPayments(rows, "typescript").length, 1);
  assert.equal(filterRecentDashboardPayments(rows, "MCC-901")[0].id, "2");
  assert.equal(filterRecentDashboardPayments(rows, "paid")[0].id, "1");
});
