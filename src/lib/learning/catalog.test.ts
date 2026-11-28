import test from "node:test";
import assert from "node:assert/strict";
import type { PublicCourse } from "@/types/firestore";
import {
  computeStudentMarketplaceSummary,
  filterStudentMarketplaceCourses,
  isCourseOwnedByStudent,
} from "./catalog";

function makeCourse(overrides: Partial<PublicCourse> & { id: string }): PublicCourse {
  return {
    id: overrides.id,
    slug: overrides.slug ?? overrides.id,
    title: overrides.title ?? `Formation ${overrides.id}`,
    shortDescription: overrides.shortDescription ?? "Description courte",
    description: overrides.description ?? "Description complète",
    priceUSD: overrides.priceUSD ?? 29,
    priceHTG: overrides.priceHTG ?? 3800,
    coverUrl: overrides.coverUrl ?? null,
    level: overrides.level ?? "debutant",
    language: overrides.language ?? "ht",
    durationMinutes: overrides.durationMinutes ?? 90,
    lessonsCount: overrides.lessonsCount ?? 8,
    syllabus: overrides.syllabus ?? [],
  };
}

test("isCourseOwnedByStudent respects active enrollment set and admin bypass", () => {
  const owned = new Set(["c1"]);
  assert.equal(isCourseOwnedByStudent("c1", owned, false), true);
  assert.equal(isCourseOwnedByStudent("c2", owned, false), false);
  assert.equal(isCourseOwnedByStudent("c2", owned, true), true);
});

test("computeStudentMarketplaceSummary counts owned vs available courses accurately", () => {
  const courses = [
    makeCourse({ id: "c1" }),
    makeCourse({ id: "c2" }),
    makeCourse({ id: "c3" }),
  ];

  const studentSummary = computeStudentMarketplaceSummary(
    courses,
    new Set(["c1"]),
    false
  );
  assert.deepEqual(studentSummary, {
    totalCount: 3,
    ownedCount: 1,
    availableCount: 2,
  });

  const adminSummary = computeStudentMarketplaceSummary(
    courses,
    new Set(),
    true
  );
  assert.deepEqual(adminSummary, {
    totalCount: 3,
    ownedCount: 3,
    availableCount: 0,
  });
});

test("filterStudentMarketplaceCourses combines availability, level, language, and search query", () => {
  const courses = [
    makeCourse({
      id: "c1",
      title: "Montage Vidéo CapCut",
      shortDescription: "Apprenez à éditer rapidement",
      level: "debutant",
      language: "ht",
    }),
    makeCourse({
      id: "c2",
      title: "Design Canva Pro",
      shortDescription: "Créer des visuels pros",
      level: "intermediaire",
      language: "fr",
    }),
    makeCourse({
      id: "c3",
      title: "Marketing Digital Haïti",
      shortDescription: "Vendre en ligne avec MonCash",
      level: "avance",
      language: "ht",
    }),
  ];

  const owned = new Set(["c1"]);

  const onlyAvailable = filterStudentMarketplaceCourses(courses, {
    ownedCourseIds: owned,
    isAdmin: false,
    availability: "available",
    level: "all",
    language: "all",
    query: "",
  });
  assert.deepEqual(
    onlyAvailable.map((c) => c.id),
    ["c2", "c3"]
  );

  const onlyOwned = filterStudentMarketplaceCourses(courses, {
    ownedCourseIds: owned,
    isAdmin: false,
    availability: "owned",
    level: "all",
    language: "all",
    query: "",
  });
  assert.deepEqual(
    onlyOwned.map((c) => c.id),
    ["c1"]
  );

  const queryMatch = filterStudentMarketplaceCourses(courses, {
    ownedCourseIds: owned,
    isAdmin: false,
    availability: "available",
    level: "avance",
    language: "ht",
    query: "moncash",
  });
  assert.deepEqual(
    queryMatch.map((c) => c.id),
    ["c3"]
  );
});
