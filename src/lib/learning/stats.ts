import type { CourseWithId, EnrollmentWithId } from "./queries";

export interface StudentCourseItem {
  enrollment: EnrollmentWithId;
  course: CourseWithId;
}

export type StudentCourseFilter = "all" | "active" | "completed";

export interface StudentStats {
  totalCourses: number;
  totalCompletedLessons: number;
  totalCourseLessons: number;
  globalPercent: number;
  inProgressCount: number;
  completedCoursesCount: number;
  resumeItem: StudentCourseItem | null;
}

export function computeCoursePercent(completedCount: number, totalCount: number): number {
  if (totalCount <= 0 || completedCount <= 0) return 0;
  return Math.min(100, Math.round((completedCount / totalCount) * 100));
}

export function isCourseCompleted(item: StudentCourseItem): boolean {
  const total = item.course.lessonsCount || 0;
  const completed = item.enrollment.progress?.completedLessonIds?.length || 0;
  return total > 0 && completed >= total;
}

export function computeStudentStats(items: StudentCourseItem[]): StudentStats {
  let totalCompletedLessons = 0;
  let totalCourseLessons = 0;
  let inProgressCount = 0;
  let completedCoursesCount = 0;

  let firstInProgress: StudentCourseItem | null = null;
  let firstUnstarted: StudentCourseItem | null = null;

  for (const item of items) {
    const total = Math.max(0, item.course.lessonsCount || 0);
    const completed = Math.min(
      total > 0 ? total : Number.MAX_SAFE_INTEGER,
      Math.max(0, item.enrollment.progress?.completedLessonIds?.length || 0)
    );

    totalCourseLessons += total;
    totalCompletedLessons += total > 0 ? completed : 0;

    if (total > 0 && completed >= total) {
      completedCoursesCount++;
    } else if (completed > 0 || Boolean(item.enrollment.progress?.lastLessonId)) {
      inProgressCount++;
      if (!firstInProgress) firstInProgress = item;
    } else {
      if (!firstUnstarted) firstUnstarted = item;
    }
  }

  const globalPercent = computeCoursePercent(totalCompletedLessons, totalCourseLessons);
  const resumeItem = firstInProgress ?? firstUnstarted ?? items[0] ?? null;

  return {
    totalCourses: items.length,
    totalCompletedLessons,
    totalCourseLessons,
    globalPercent,
    inProgressCount,
    completedCoursesCount,
    resumeItem,
  };
}

export function filterStudentCourses(
  items: StudentCourseItem[],
  filter: StudentCourseFilter,
  query = ""
): StudentCourseItem[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    if (filter === "completed" && !isCourseCompleted(item)) return false;
    if (filter === "active" && isCourseCompleted(item)) return false;
    if (normalized) {
      const titleMatch = item.course.title.toLowerCase().includes(normalized);
      const descMatch = (item.course.shortDescription || "").toLowerCase().includes(normalized);
      return titleMatch || descMatch;
    }
    return true;
  });
}
