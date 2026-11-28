import { isValidCoverId } from "./cover";

const INTERNAL_COVER_PREFIX = "/api/covers/";
const COURSE_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

export function isValidCourseDocId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  if (!trimmed || trimmed === "." || trimmed === "..") return false;
  return COURSE_ID_RE.test(trimmed);
}

export function extractInternalCoverId(coverUrl: unknown): string | null {
  if (typeof coverUrl !== "string") return null;
  const trimmed = coverUrl.trim();
  if (!trimmed.startsWith(INTERNAL_COVER_PREFIX)) return null;
  const candidate = trimmed.slice(INTERNAL_COVER_PREFIX.length);
  return isValidCoverId(candidate) ? candidate : null;
}

export function chunkArray<T>(items: readonly T[], size = 450): T[][] {
  if (size <= 0) throw new Error("Chunk size must be positive");
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function removeCourseFromList<T extends { id: string }>(
  courses: readonly T[],
  courseId: string
): T[] {
  return courses.filter((course) => course.id !== courseId);
}
