import test from "node:test";
import assert from "node:assert/strict";
import { MAX_COMPLETED_LESSONS } from "@/types/firestore";
import {
  buildLocalProgressStorageKey,
  clearLocalProgressFallback,
  hasUnsyncedFallbackLessons,
  mergeProgressWithFallback,
  normalizeProgress,
  readLocalProgressFallback,
  validateProgressPayload,
  writeLocalProgressFallback,
  type StorageLike,
} from "./progress";

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

test("normalizeProgress deduplicates IDs, filters invalid values, and caps lastLessonId", () => {
  const result = normalizeProgress({
    completedLessonIds: ["l1", " l2 ", "l1", "", "l3"],
    lastLessonId: `  ${"x".repeat(200)}`,
  });

  assert.deepEqual(result.completedLessonIds, ["l1", "l2", "l3"]);
  assert.equal(result.lastLessonId.length, 128);
});

test("mergeProgressWithFallback preserves union of remote and fallback completed lessons", () => {
  const merged = mergeProgressWithFallback(
    { completedLessonIds: ["l1"], lastLessonId: "l1" },
    { completedLessonIds: ["l1", "l2"], lastLessonId: "l2" }
  );

  assert.deepEqual(merged.completedLessonIds, ["l1", "l2"]);
  assert.equal(merged.lastLessonId, "l1");
});

test("hasUnsyncedFallbackLessons detects lessons missing from remote progress", () => {
  assert.equal(
    hasUnsyncedFallbackLessons(
      { completedLessonIds: ["l1"], lastLessonId: "l1" },
      { completedLessonIds: ["l1", "l2"], lastLessonId: "l2" }
    ),
    true
  );
  assert.equal(
    hasUnsyncedFallbackLessons(
      { completedLessonIds: ["l1", "l2"], lastLessonId: "l2" },
      { completedLessonIds: ["l1"], lastLessonId: "l1" }
    ),
    false
  );
});

test("validateProgressPayload validates courseId, array bounds, and lesson IDs", () => {
  const valid = validateProgressPayload({
    courseId: "course_123",
    completedLessonIds: ["lesson-1", "lesson-1", "lesson-2"],
    lastLessonId: "lesson-2",
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.data.courseId, "course_123");
    assert.deepEqual(valid.data.progress.completedLessonIds, [
      "lesson-1",
      "lesson-2",
    ]);
  }

  const invalidCourse = validateProgressPayload({
    courseId: "../secret",
    completedLessonIds: ["lesson-1"],
  });
  assert.equal(invalidCourse.ok, false);

  const oversized = validateProgressPayload({
    courseId: "course_123",
    completedLessonIds: Array.from(
      { length: MAX_COMPLETED_LESSONS + 1 },
      (_, i) => `lesson-${i}`
    ),
  });
  assert.equal(oversized.ok, false);
});

test("localStorage fallback reads, writes, and clears scoped course progress", () => {
  const storage = createMemoryStorage();
  const key = buildLocalProgressStorageKey("u1", "c1");
  assert.equal(key, "bayondy_progress_u1_c1");

  writeLocalProgressFallback(storage, "u1", "c1", {
    completedLessonIds: ["l1", "l2"],
    lastLessonId: "l2",
  });

  assert.deepEqual(readLocalProgressFallback(storage, "u1", "c1"), {
    completedLessonIds: ["l1", "l2"],
    lastLessonId: "l2",
  });

  clearLocalProgressFallback(storage, "u1", "c1");
  assert.equal(readLocalProgressFallback(storage, "u1", "c1"), null);
});
