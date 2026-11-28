import test from "node:test";
import assert from "node:assert/strict";
import {
  computeNextLessonOrder,
  computeOrderUpdatesForMove,
  slugifyCourseText,
} from "./courseHelpers";

test("slugifyCourseText normalizes accents, spaces, and punctuation cleanly", () => {
  assert.equal(slugifyCourseText("Modil 1 : Entwodiksyon ak Baz yo"), "modil-1-entwodiksyon-ak-baz-yo");
  assert.equal(slugifyCourseText("  Kreyòl & React 101! "), "kreyol-react-101");
  assert.equal(slugifyCourseText("---"), "");
});

test("computeNextLessonOrder picks sequential next order", () => {
  assert.equal(computeNextLessonOrder([]), 1);
  assert.equal(computeNextLessonOrder([{ order: 0 }, { order: 0 }]), 3);
  assert.equal(computeNextLessonOrder([{ order: 1 }, { order: 4 }]), 5);
});

test("computeOrderUpdatesForMove handles both distinct and duplicate lesson orders", () => {
  const distinct = [
    { id: "l1", order: 1 },
    { id: "l2", order: 2 },
  ];
  assert.deepEqual(computeOrderUpdatesForMove(distinct, "l2", "up"), [
    { id: "l2", order: 1 },
    { id: "l1", order: 2 },
  ]);

  const duplicateZero = [
    { id: "l1", order: 0 },
    { id: "l2", order: 0 },
  ];
  assert.deepEqual(computeOrderUpdatesForMove(duplicateZero, "l2", "up"), [
    { id: "l2", order: 1 },
    { id: "l1", order: 2 },
  ]);
});
