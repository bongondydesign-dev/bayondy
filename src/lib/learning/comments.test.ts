import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLocalCommentsStorageKey,
  mergeCommentsWithFallback,
  readLocalCommentsFallback,
  removeLocalCommentFallback,
  sanitizeAuthorName,
  sanitizeAuthorPhotoURL,
  sortLessonComments,
  upsertLocalCommentFallback,
  validateCommentCreateInput,
  validateCommentDeleteInput,
  type LessonCommentItem,
} from "./comments";
import type { StorageLike } from "./progress";
import { MAX_COMMENT_LENGTH } from "@/types/firestore";

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

function makeComment(overrides: Partial<LessonCommentItem> = {}): LessonCommentItem {
  return {
    id: overrides.id ?? "c-1",
    courseId: overrides.courseId ?? "course-1",
    lessonId: overrides.lessonId ?? "lesson-1",
    uid: overrides.uid ?? "user-1",
    authorName: overrides.authorName ?? "Jean",
    authorPhotoURL: overrides.authorPhotoURL ?? null,
    authorIsAdmin: overrides.authorIsAdmin ?? false,
    content: overrides.content ?? "Super explication !",
    createdAtMs: overrides.createdAtMs ?? 1700000000000,
  };
}

test("validateCommentCreateInput rejects invalid payloads and empty/oversized comments", () => {
  assert.equal(validateCommentCreateInput(null).ok, false);
  assert.equal(
    validateCommentCreateInput({ courseId: "../bad", lessonId: "l1", content: "ok" }).ok,
    false
  );
  assert.equal(
    validateCommentCreateInput({ courseId: "c1", lessonId: "", content: "ok" }).ok,
    false
  );

  const emptyRes = validateCommentCreateInput({
    courseId: "course-1",
    lessonId: "lesson-1",
    content: "   \n  ",
  });
  assert.equal(emptyRes.ok, false);
  if (!emptyRes.ok) {
    assert.equal(emptyRes.code, "EMPTY_COMMENT");
  }

  const tooLongRes = validateCommentCreateInput({
    courseId: "course-1",
    lessonId: "lesson-1",
    content: "a".repeat(MAX_COMMENT_LENGTH + 1),
  });
  assert.equal(tooLongRes.ok, false);
  if (!tooLongRes.ok) {
    assert.equal(tooLongRes.code, "COMMENT_TOO_LONG");
  }
});

test("validateCommentCreateInput trims valid comment content", () => {
  const res = validateCommentCreateInput({
    courseId: "course_123",
    lessonId: "lesson-456",
    content: "  Merci pour cette leçon !  ",
  });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.deepEqual(res.data, {
      courseId: "course_123",
      lessonId: "lesson-456",
      content: "Merci pour cette leçon !",
    });
  }
});

test("validateCommentDeleteInput validates string and object payloads", () => {
  assert.equal(validateCommentDeleteInput("").ok, false);
  assert.equal(validateCommentDeleteInput({ commentId: ".." }).ok, false);

  const fromStr = validateCommentDeleteInput("comment_1");
  assert.equal(fromStr.ok, true);
  if (fromStr.ok) assert.equal(fromStr.data.commentId, "comment_1");

  const fromObj = validateCommentDeleteInput({ commentId: " comment-2 " });
  assert.equal(fromObj.ok, true);
  if (fromObj.ok) assert.equal(fromObj.data.commentId, "comment-2");
});

test("sortLessonComments orders newest first with deterministic id tie-breaker", () => {
  const sorted = sortLessonComments([
    makeComment({ id: "c-b", createdAtMs: 100 }),
    makeComment({ id: "c-latest", createdAtMs: 300 }),
    makeComment({ id: "c-a", createdAtMs: 100 }),
  ]);

  assert.deepEqual(
    sorted.map((c) => c.id),
    ["c-latest", "c-a", "c-b"]
  );
});

test("sanitizeAuthorName and sanitizeAuthorPhotoURL enforce safe bounds", () => {
  assert.equal(sanitizeAuthorName("   "), "Élève");
  assert.equal(sanitizeAuthorName("Marie   Claire").length, 12);
  assert.equal(sanitizeAuthorName("X".repeat(150)).length, 120);
  assert.equal(sanitizeAuthorPhotoURL("javascript:alert(1)"), null);
  assert.equal(
    sanitizeAuthorPhotoURL("https://lh3.googleusercontent.com/a/avatar.png"),
    "https://lh3.googleusercontent.com/a/avatar.png"
  );
});

test("local comments fallback CRUD stays scoped per course and lesson", () => {
  const storage = createMemoryStorage();
  const c1 = makeComment({ id: "c1", content: "Premier commentaire", createdAtMs: 1000 });
  const c2 = makeComment({ id: "c2", content: "Deuxième commentaire", createdAtMs: 2000 });

  upsertLocalCommentFallback(storage, "course-1", "lesson-1", c1);
  upsertLocalCommentFallback(storage, "course-1", "lesson-1", c2);

  assert.equal(
    storage.getItem(buildLocalCommentsStorageKey("course-1", "lesson-1")) !== null,
    true
  );
  assert.deepEqual(
    readLocalCommentsFallback(storage, "course-1", "lesson-2"),
    []
  );

  const loaded = readLocalCommentsFallback(storage, "course-1", "lesson-1");
  assert.deepEqual(
    loaded.map((c) => c.id),
    ["c2", "c1"]
  );

  const afterRemove = removeLocalCommentFallback(storage, "course-1", "lesson-1", "c2");
  assert.deepEqual(
    afterRemove.map((c) => c.id),
    ["c1"]
  );

  const afterRemoveAll = removeLocalCommentFallback(storage, "course-1", "lesson-1", "c1");
  assert.deepEqual(afterRemoveAll, []);
  assert.equal(storage.getItem(buildLocalCommentsStorageKey("course-1", "lesson-1")), null);
});

test("mergeCommentsWithFallback deduplicates by id with remote winning", () => {
  const local = [
    makeComment({ id: "c1", content: "Local draft", createdAtMs: 100 }),
    makeComment({ id: "c2", content: "Only local", createdAtMs: 300 }),
  ];
  const remote = [
    makeComment({ id: "c1", content: "Remote synced", createdAtMs: 200 }),
  ];
  const merged = mergeCommentsWithFallback(remote, local);
  assert.equal(merged.length, 2);
  assert.equal(merged.find((c) => c.id === "c1")?.content, "Remote synced");
  assert.deepEqual(
    merged.map((c) => c.id),
    ["c2", "c1"]
  );
});
