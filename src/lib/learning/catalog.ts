import type { CourseLanguage, CourseLevel, PublicCourse } from "@/types/firestore";

export type StudentMarketplaceAvailability = "all" | "available" | "owned";

export interface StudentMarketplaceFilterOptions {
  ownedCourseIds: ReadonlySet<string>;
  isAdmin: boolean;
  availability: StudentMarketplaceAvailability;
  level: CourseLevel | "all";
  language: CourseLanguage | "all";
  query: string;
}

export interface StudentMarketplaceSummary {
  totalCount: number;
  ownedCount: number;
  availableCount: number;
}

export function isCourseOwnedByStudent(
  courseId: string,
  ownedCourseIds: ReadonlySet<string>,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  return ownedCourseIds.has(courseId);
}

export function computeStudentMarketplaceSummary(
  courses: PublicCourse[],
  ownedCourseIds: ReadonlySet<string>,
  isAdmin: boolean
): StudentMarketplaceSummary {
  let ownedCount = 0;
  for (const course of courses) {
    if (isCourseOwnedByStudent(course.id, ownedCourseIds, isAdmin)) {
      ownedCount += 1;
    }
  }
  const totalCount = courses.length;
  return {
    totalCount,
    ownedCount,
    availableCount: Math.max(0, totalCount - ownedCount),
  };
}

export function filterStudentMarketplaceCourses(
  courses: PublicCourse[],
  options: StudentMarketplaceFilterOptions
): PublicCourse[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  return courses.filter((course) => {
    const owned = isCourseOwnedByStudent(
      course.id,
      options.ownedCourseIds,
      options.isAdmin
    );

    if (options.availability === "owned" && !owned) return false;
    if (options.availability === "available" && owned) return false;

    if (options.level !== "all" && course.level !== options.level) {
      return false;
    }

    if (options.language !== "all" && course.language !== options.language) {
      return false;
    }

    if (normalizedQuery) {
      const title = (course.title || "").toLowerCase();
      const shortDesc = (course.shortDescription || "").toLowerCase();
      if (!title.includes(normalizedQuery) && !shortDesc.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });
}
