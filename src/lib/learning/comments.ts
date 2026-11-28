import { MAX_COMMENT_LENGTH } from "@/types/firestore";
import { type StorageLike } from "@/lib/learning/progress";

const SAFE_DOC_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export interface LessonCommentItem {
  id: string;
  courseId: string;
  lessonId: string;
  uid: string;
  authorName: string;
  authorPhotoURL: string | null;
  authorIsAdmin: boolean;
  content: string;
  createdAtMs: number;
}

export function isValidSafeResourceId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") return false;
  return SAFE_DOC_ID_RE.test(trimmed);
}

export function sanitizeAuthorName(name: unknown, fallback = "Élève"): string {
  if (typeof name !== "string") return fallback;
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return fallback;
  return trimmed.slice(0, 120);
}

export function sanitizeAuthorPhotoURL(photoURL: unknown): string | null {
  if (typeof photoURL !== "string") return null;
  const trimmed = photoURL.trim();
  if (!trimmed || trimmed.length > 1000) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

export type CommentValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string; error: string };

export function validateCommentCreateInput(body: unknown): CommentValidationResult<{
  courseId: string;
  lessonId: string;
  content: string;
}> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_PAYLOAD",
      error: "Kò rekèt la pa valid.",
    };
  }

  const record = body as Record<string, unknown>;
  const courseId = typeof record.courseId === "string" ? record.courseId.trim() : "";
  if (!isValidSafeResourceId(courseId)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_COURSE_ID",
      error: "courseId pa valid.",
    };
  }

  const lessonId = typeof record.lessonId === "string" ? record.lessonId.trim() : "";
  if (!isValidSafeResourceId(lessonId)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_LESSON_ID",
      error: "lessonId pa valid.",
    };
  }

  if (typeof record.content !== "string") {
    return {
      ok: false,
      status: 400,
      code: "INVALID_COMMENT",
      error: "Kòmantè a dwe yon tèks.",
    };
  }

  const content = record.content.trim();
  if (!content) {
    return {
      ok: false,
      status: 400,
      code: "EMPTY_COMMENT",
      error: "Ekri yon kòmantè anvan ou pibliye.",
    };
  }

  if (content.length > MAX_COMMENT_LENGTH) {
    return {
      ok: false,
      status: 400,
      code: "COMMENT_TOO_LONG",
      error: `Kòmantè a pa ka depase ${MAX_COMMENT_LENGTH} karaktè.`,
    };
  }

  return {
    ok: true,
    data: {
      courseId,
      lessonId,
      content,
    },
  };
}

export function validateCommentDeleteInput(input: unknown): CommentValidationResult<{
  commentId: string;
}> {
  let rawId = "";
  if (typeof input === "string") {
    rawId = input.trim();
  } else if (typeof input === "object" && input !== null && !Array.isArray(input)) {
    const record = input as Record<string, unknown>;
    rawId = typeof record.commentId === "string" ? record.commentId.trim() : "";
  }

  if (!isValidSafeResourceId(rawId)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_COMMENT_ID",
      error: "commentId pa valid.",
    };
  }

  return {
    ok: true,
    data: { commentId: rawId },
  };
}

export function sortLessonComments(comments: LessonCommentItem[]): LessonCommentItem[] {
  return [...comments].sort((a, b) => {
    const diff = (b.createdAtMs || 0) - (a.createdAtMs || 0);
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}

export function normalizeCommentItem(
  raw: Partial<LessonCommentItem> & { id: string }
): LessonCommentItem {
  return {
    id: raw.id,
    courseId: typeof raw.courseId === "string" ? raw.courseId : "",
    lessonId: typeof raw.lessonId === "string" ? raw.lessonId : "",
    uid: typeof raw.uid === "string" ? raw.uid : "",
    authorName: sanitizeAuthorName(raw.authorName),
    authorPhotoURL: sanitizeAuthorPhotoURL(raw.authorPhotoURL),
    authorIsAdmin: raw.authorIsAdmin === true,
    content: typeof raw.content === "string" ? raw.content.trim().slice(0, MAX_COMMENT_LENGTH) : "",
    createdAtMs: typeof raw.createdAtMs === "number" && Number.isFinite(raw.createdAtMs)
      ? raw.createdAtMs
      : 0,
  };
}

export function mergeCommentsWithFallback(
  remote: LessonCommentItem[],
  local: LessonCommentItem[]
): LessonCommentItem[] {
  const map = new Map<string, LessonCommentItem>();
  for (const item of local) {
    if (item?.id && item.content) {
      map.set(item.id, item);
    }
  }
  for (const item of remote) {
    if (item?.id && item.content) {
      map.set(item.id, item);
    }
  }
  return sortLessonComments(Array.from(map.values()));
}

export function buildLocalCommentsStorageKey(courseId: string, lessonId: string): string {
  return `bayondy_lesson_comments_${courseId}_${lessonId}`;
}

export function readLocalCommentsFallback(
  storage: StorageLike | null | undefined,
  courseId: string,
  lessonId: string
): LessonCommentItem[] {
  if (!storage || !courseId || !lessonId) return [];
  try {
    const raw = storage.getItem(buildLocalCommentsStorageKey(courseId, lessonId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const valid = parsed
      .filter(
        (item): item is Partial<LessonCommentItem> & { id: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string" &&
          (item as { id: string }).id.length > 0
      )
      .map((item) => normalizeCommentItem(item))
      .filter((item) => item.content.length > 0);
    return sortLessonComments(valid);
  } catch {
    return [];
  }
}

export function upsertLocalCommentFallback(
  storage: StorageLike | null | undefined,
  courseId: string,
  lessonId: string,
  comment: LessonCommentItem
): LessonCommentItem[] {
  if (!storage || !courseId || !lessonId) return [comment];
  const existing = readLocalCommentsFallback(storage, courseId, lessonId);
  const next = mergeCommentsWithFallback([comment], existing).slice(0, 200);
  try {
    storage.setItem(
      buildLocalCommentsStorageKey(courseId, lessonId),
      JSON.stringify(next)
    );
  } catch {
    // Ignore storage quota or private mode failures
  }
  return next;
}

export function removeLocalCommentFallback(
  storage: StorageLike | null | undefined,
  courseId: string,
  lessonId: string,
  commentId: string
): LessonCommentItem[] {
  if (!storage || !courseId || !lessonId) return [];
  const existing = readLocalCommentsFallback(storage, courseId, lessonId);
  const next = existing.filter((item) => item.id !== commentId);
  try {
    if (next.length === 0) {
      storage.removeItem(buildLocalCommentsStorageKey(courseId, lessonId));
    } else {
      storage.setItem(
        buildLocalCommentsStorageKey(courseId, lessonId),
        JSON.stringify(next)
      );
    }
  } catch {
    // Ignore storage failures
  }
  return next;
}
