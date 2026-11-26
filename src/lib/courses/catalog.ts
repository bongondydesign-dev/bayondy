import type { CourseLanguage, CourseLevel, PublicCourse } from "@/types/firestore";

const LEVEL_ORDER: CourseLevel[] = ["debutant", "intermediaire", "avance"];
const LANGUAGE_ORDER: CourseLanguage[] = ["ht", "fr", "en"];

export interface CatalogStats {
  totalCourses: number;
  totalLessons: number;
}

export interface CatalogFilterOptions {
  levels: CourseLevel[];
  languages: CourseLanguage[];
}

export function computeCatalogStats(courses: readonly PublicCourse[]): CatalogStats {
  const totalCourses = courses.length;
  const totalLessons = courses.reduce((sum, course) => {
    const count = typeof course.lessonsCount === "number" && course.lessonsCount > 0
      ? course.lessonsCount
      : 0;
    return sum + count;
  }, 0);

  return { totalCourses, totalLessons };
}

export function extractCatalogFilterOptions(
  courses: readonly PublicCourse[]
): CatalogFilterOptions {
  const presentLevels = new Set<CourseLevel>();
  const presentLanguages = new Set<CourseLanguage>();

  for (const course of courses) {
    if (course.level) {
      presentLevels.add(course.level);
    }
    if (course.language) {
      presentLanguages.add(course.language);
    }
  }

  const levels = LEVEL_ORDER.filter((lvl) => presentLevels.has(lvl));
  for (const lvl of presentLevels) {
    if (!levels.includes(lvl)) levels.push(lvl);
  }

  const languages = LANGUAGE_ORDER.filter((lang) => presentLanguages.has(lang));
  for (const lang of presentLanguages) {
    if (!languages.includes(lang)) languages.push(lang);
  }

  return { levels, languages };
}

export function filterCatalogCourses(
  courses: readonly PublicCourse[],
  selectedLevel: CourseLevel | "all",
  selectedLanguage: CourseLanguage | "all"
): PublicCourse[] {
  return courses.filter((course) => {
    if (selectedLevel !== "all" && course.level !== selectedLevel) {
      return false;
    }
    if (selectedLanguage !== "all" && course.language !== selectedLanguage) {
      return false;
    }
    return true;
  });
}
