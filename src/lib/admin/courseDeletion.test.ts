import test from "node:test";
import assert from "node:assert/strict";
import {
  chunkArray,
  extractInternalCoverId,
  isValidCourseDocId,
  removeCourseFromList,
} from "./courseDeletion";

test("isValidCourseDocId validates Firestore document IDs safely", () => {
  assert.equal(isValidCourseDocId("abc_123-XYZ"), true);
  assert.equal(isValidCourseDocId(""), false);
  assert.equal(isValidCourseDocId("."), false);
  assert.equal(isValidCourseDocId(".."), false);
  assert.equal(isValidCourseDocId("bad/id"), false);
  assert.equal(isValidCourseDocId("a".repeat(129)), false);
});

test("extractInternalCoverId extracts only valid internal /api/covers IDs", () => {
  assert.equal(extractInternalCoverId("/api/covers/cover_123456"), "cover_123456");
  assert.equal(extractInternalCoverId("  /api/covers/abcDEF99  "), "abcDEF99");
  assert.equal(extractInternalCoverId("https://example.com/image.png"), null);
  assert.equal(extractInternalCoverId("/api/covers/../../etc"), null);
  assert.equal(extractInternalCoverId(null), null);
});

test("chunkArray splits batches cleanly without exceeding max batch size", () => {
  assert.deepEqual(chunkArray([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunkArray([], 450), []);
});

test("removeCourseFromList removes only the deleted course ID", () => {
  const input = [{ id: "c1", title: "One" }, { id: "c2", title: "Two" }];
  assert.deepEqual(removeCourseFromList(input, "c1"), [{ id: "c2", title: "Two" }]);
  assert.deepEqual(removeCourseFromList(input, "missing"), input);
});
