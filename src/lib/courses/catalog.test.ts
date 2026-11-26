import test from "node:test";
import assert from "node:assert/strict";
import type { PublicCourse } from "@/types/firestore";
import {
  computeCatalogStats,
  extractCatalogFilterOptions,
  filterCatalogCourses,
} from "./catalog";

function makeCourse(overrides: Partial<PublicCourse> = {}): PublicCourse {
  return {
    id: "c1",
    slug: "formation-test",
    title: "Formation Test",
    shortDescription: "Description courte",
    description: "Description",
    priceUSD: null,
    priceHTG: null,
    coverUrl: null,
    level: "debutant",
    language: "ht",
    durationMinutes: 60,
    lessonsCount: 5,
    syllabus: [],
    ...overrides,
  };
}

test("computeCatalogStats sums published courses and positive lessonsCount", () => {
  assert.deepEqual(computeCatalogStats([]), {
    totalCourses: 0,
    totalLessons: 0,
  });

  const courses = [
    makeCourse({ id: "c1", lessonsCount: 8 }),
    makeCourse({ id: "c2", lessonsCount: 12 }),
    makeCourse({ id: "c3", lessonsCount: 0 }),
  ];

  assert.deepEqual(computeCatalogStats(courses), {
    totalCourses: 3,
    totalLessons: 20,
  });
});

test("extractCatalogFilterOptions returns only levels and languages present in published courses", () => {
  const courses = [
    makeCourse({ id: "c1", level: "avance", language: "fr" }),
    makeCourse({ id: "c2", level: "debutant", language: "ht" }),
    makeCourse({ id: "c3", level: "debutant", language: "fr" }),
  ];

  assert.deepEqual(extractCatalogFilterOptions(courses), {
    levels: ["debutant", "avance"],
    languages: ["ht", "fr"],
  });
  assert.deepEqual(extractCatalogFilterOptions([]), {
    levels: [],
    languages: [],
  });
});

test("filterCatalogCourses filters in memory by level and language", () => {
  const courses = [
    makeCourse({ id: "c1", level: "debutant", language: "ht" }),
    makeCourse({ id: "c2", level: "intermediaire", language: "fr" }),
    makeCourse({ id: "c3", level: "debutant", language: "fr" }),
  ];

  assert.equal(filterCatalogCourses(courses, "all", "all").length, 3);
  assert.deepEqual(
    filterCatalogCourses(courses, "debutant", "all").map((c) => c.id),
    ["c1", "c3"]
  );
  assert.deepEqual(
    filterCatalogCourses(courses, "all", "fr").map((c) => c.id),
    ["c2", "c3"]
  );
  assert.deepEqual(
    filterCatalogCourses(courses, "intermediaire", "ht"),
    []
  );
});
