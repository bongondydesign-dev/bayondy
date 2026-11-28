import { MAX_COMPLETED_LESSONS, type EnrollmentProgress } from "@/types/firestore";

const SAFE_DOC_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function isValidLearningCourseId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") return false;
  return SAFE_DOC_ID_RE.test(trimmed);
}

export function normalizeProgress(
  input: Partial<EnrollmentProgress> | null | undefined
): EnrollmentProgress {
  const rawIds = Array.isArray(input?.completedLessonIds)
    ? input.completedLessonIds
    : [];

  const uniqueIds: string[] = [];
  const seen = new Set<string>();

  for (const raw of rawIds) {
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.length > 128 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    uniqueIds.push(trimmed);
    if (uniqueIds.length >= MAX_COMPLETED_LESSONS) break;
  }

  const rawLast = typeof input?.lastLessonId === "string" ? input.lastLessonId.trim() : "";
  const lastLessonId = rawLast.slice(0, 128);

  return {
    completedLessonIds: uniqueIds,
    lastLessonId,
  };
}

export function mergeProgressWithFallback(
  remote: Partial<EnrollmentProgress> | null | undefined,
  fallback: Partial<EnrollmentProgress> | null | undefined
): EnrollmentProgress {
  const normRemote = normalizeProgress(remote);
  const normFallback = normalizeProgress(fallback);

  const mergedIds = normalizeProgress({
    completedLessonIds: [
      ...normRemote.completedLessonIds,
      ...normFallback.completedLessonIds,
    ],
    lastLessonId: normRemote.lastLessonId || normFallback.lastLessonId,
  });

  return mergedIds;
}

export function hasUnsyncedFallbackLessons(
  remote: Partial<EnrollmentProgress> | null | undefined,
  fallback: Partial<EnrollmentProgress> | null | undefined
): boolean {
  const normRemote = normalizeProgress(remote);
  const normFallback = normalizeProgress(fallback);
  if (normFallback.completedLessonIds.length === 0) return false;

  const remoteSet = new Set(normRemote.completedLessonIds);
  return normFallback.completedLessonIds.some((id) => !remoteSet.has(id));
}

export function validateProgressPayload(body: unknown):
  | {
      ok: true;
      data: {
        courseId: string;
        progress: EnrollmentProgress;
      };
    }
  | {
      ok: false;
      status: number;
      code: string;
      error: string;
    } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_PAYLOAD",
      error: "Kò rekèt la pa valid.",
    };
  }

  const record = body as Record<string, unknown>;
  const rawCourseId = typeof record.courseId === "string" ? record.courseId.trim() : "";
  if (!isValidLearningCourseId(rawCourseId)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_COURSE_ID",
      error: "courseId pa valid.",
    };
  }

  if (!Array.isArray(record.completedLessonIds)) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_COMPLETED_LESSONS",
      error: "completedLessonIds dwe yon lis.",
    };
  }

  const dedupedRaw: string[] = [];
  const seen = new Set<string>();
  for (const item of record.completedLessonIds) {
    if (typeof item !== "string") {
      return {
        ok: false,
        status: 400,
        code: "INVALID_LESSON_ID",
        error: "Chak eleman nan completedLessonIds dwe yon tèks valid.",
      };
    }
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > 128) {
      return {
        ok: false,
        status: 400,
        code: "INVALID_LESSON_ID",
        error: "Idantifyan leson an pa valid.",
      };
    }
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      dedupedRaw.push(trimmed);
    }
  }

  if (dedupedRaw.length > MAX_COMPLETED_LESSONS) {
    return {
      ok: false,
      status: 400,
      code: "MAX_LESSONS_EXCEEDED",
      error: "Kantite leson konplete yo depase limit la.",
    };
  }

  if (
    record.lastLessonId !== undefined &&
    record.lastLessonId !== null &&
    typeof record.lastLessonId !== "string"
  ) {
    return {
      ok: false,
      status: 400,
      code: "INVALID_LAST_LESSON_ID",
      error: "lastLessonId pa valid.",
    };
  }

  const lastLessonId =
    typeof record.lastLessonId === "string"
      ? record.lastLessonId.trim().slice(0, 128)
      : "";

  return {
    ok: true,
    data: {
      courseId: rawCourseId,
      progress: {
        completedLessonIds: dedupedRaw,
        lastLessonId,
      },
    },
  };
}

export function buildLocalProgressStorageKey(uid: string, courseId: string): string {
  return `bayondy_progress_${uid}_${courseId}`;
}

export function getBrowserLocalStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readLocalProgressFallback(
  storage: StorageLike | null | undefined,
  uid: string,
  courseId: string
): EnrollmentProgress | null {
  if (!storage || !uid || !courseId) return null;
  try {
    const raw = storage.getItem(buildLocalProgressStorageKey(uid, courseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EnrollmentProgress> | null;
    if (!parsed || typeof parsed !== "object") return null;
    return normalizeProgress(parsed);
  } catch {
    return null;
  }
}

export function writeLocalProgressFallback(
  storage: StorageLike | null | undefined,
  uid: string,
  courseId: string,
  progress: Partial<EnrollmentProgress>
): void {
  if (!storage || !uid || !courseId) return;
  try {
    const normalized = normalizeProgress(progress);
    storage.setItem(
      buildLocalProgressStorageKey(uid, courseId),
      JSON.stringify(normalized)
    );
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function clearLocalProgressFallback(
  storage: StorageLike | null | undefined,
  uid: string,
  courseId: string
): void {
  if (!storage || !uid || !courseId) return;
  try {
    storage.removeItem(buildLocalProgressStorageKey(uid, courseId));
  } catch {
    // Ignore storage errors
  }
}
