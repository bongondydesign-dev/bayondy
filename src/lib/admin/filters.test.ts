import test from "node:test";
import assert from "node:assert/strict";
import {
  computePaymentSummary,
  filterAdminCourses,
  filterAdminPayments,
  filterAdminStudents,
} from "./filters";

test("filterAdminCourses filters by status and search text", () => {
  const rows = [
    { id: "1", slug: "react-ht", title: "React an Kreyòl", status: "published" as const },
    { id: "2", slug: "design-draft", title: "Design UI", status: "draft" as const },
  ];
  assert.equal(filterAdminCourses(rows, "", "all").length, 2);
  assert.equal(filterAdminCourses(rows, "", "published").length, 1);
  assert.equal(filterAdminCourses(rows, "design", "draft").length, 1);
  assert.equal(filterAdminCourses(rows, "design", "published").length, 0);
});

test("filterAdminStudents filters by active enrollment and search query", () => {
  const rows = [
    { uid: "1", displayName: "Jean", email: "jean@example.com", enrollments: [{ courseId: "c1", status: "active" }] },
    { uid: "2", displayName: "Marie", email: "marie@example.com", enrollments: [] },
  ];
  assert.equal(filterAdminStudents(rows, "", "enrolled").length, 1);
  assert.equal(filterAdminStudents(rows, "", "unenrolled").length, 1);
  assert.equal(filterAdminStudents(rows, "marie", "all")[0].uid, "2");
});

test("filterAdminPayments and computePaymentSummary calculate real totals", () => {
  const rows = [
    { id: "p1", uid: "u1", courseId: "c1", amount: 2500, currency: "HTG", method: "moncash", status: "paid", merchantReference: "REF-1" },
    { id: "p2", uid: "u2", courseId: "c2", amount: 25, currency: "USD", method: "card", status: "paid", merchantReference: "REF-2" },
    { id: "p3", uid: "u3", courseId: "c1", amount: 2500, currency: "HTG", method: "natcash", status: "pending", merchantReference: "REF-3" },
    { id: "p4", uid: "u4", courseId: "c1", amount: 2500, currency: "HTG", method: "moncash", status: "expired", merchantReference: "REF-4" },
    { id: "p5", uid: "u5", courseId: "c1", amount: 1500, currency: "HTG", method: "moncash", status: "awaiting_payment", merchantReference: "REF-5" },
  ];
  assert.equal(filterAdminPayments(rows, "", "failed").length, 1);
  assert.equal(filterAdminPayments(rows, "", "pending").length, 2);
  assert.equal(filterAdminPayments(rows, "REF-2", "all").length, 1);

  const summary = computePaymentSummary(rows);
  assert.equal(summary.totalCount, 5);
  assert.equal(summary.paidCount, 2);
  assert.equal(summary.pendingCount, 2);
  assert.equal(summary.totalHTG, 2500);
  assert.equal(summary.totalUSD, 25);
});
