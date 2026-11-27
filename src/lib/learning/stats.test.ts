import test from "node:test";
import assert from "node:assert/strict";
import {
  computeCoursePercent,
  computeStudentStats,
  filterStudentCourses,
  type StudentCourseItem,
} from "./stats";

function makeItem(
  id: string,
  lessonsCount: number,
  completedIds: string[],
  lastLessonId = ""
): StudentCourseItem {
  return {
    course: {
      id,
      slug: `course-${id}`,
      title: `Course ${id}`,
      shortDescription: "Short",
      description: "Desc",
      coverUrl: "",
      level: "debutant",
      language: "ht",
      durationMinutes: 60,
      status: "published",
      syllabus: [],
      lessonsCount,
      createdAt: {} as StudentCourseItem["course"]["createdAt"],
      updatedAt: {} as StudentCourseItem["course"]["updatedAt"],
    },
    enrollment: {
      id: `u1_${id}`,
      uid: "u1",
      courseId: id,
      status: "active",
      source: "payment",
      paymentId: null,
      grantedAt: {} as StudentCourseItem["enrollment"]["grantedAt"],
      progress: {
        completedLessonIds: completedIds,
        lastLessonId,
      },
    },
  };
}

test("computeCoursePercent clamps safely between 0 and 100", () => {
  assert.equal(computeCoursePercent(0, 10), 0);
  assert.equal(computeCoursePercent(5, 0), 0);
  assert.equal(computeCoursePercent(3, 4), 75);
  assert.equal(computeCoursePercent(12, 10), 100);
});

test("computeStudentStats aggregates real lessons, percent, and resume priority", () => {
  const done = makeItem("1", 4, ["a", "b", "c", "d"], "d");
  const active = makeItem("2", 6, ["e", "f"], "f");
  const unstarted = makeItem("3", 10, [], "");

  const stats = computeStudentStats([done, active, unstarted]);
  assert.equal(stats.totalCourses, 3);
  assert.equal(stats.totalCompletedLessons, 6);
  assert.equal(stats.totalCourseLessons, 20);
  assert.equal(stats.globalPercent, 30);
  assert.equal(stats.completedCoursesCount, 1);
  assert.equal(stats.inProgressCount, 1);
  assert.equal(stats.resumeItem?.course.id, "2");
});

test("filterStudentCourses filters active vs completed courses", () => {
  const done = makeItem("1", 2, ["a", "b"]);
  const active = makeItem("2", 5, ["c"]);
  assert.equal(filterStudentCourses([done, active], "all").length, 2);
  assert.equal(filterStudentCourses([done, active], "completed").length, 1);
  assert.equal(filterStudentCourses([done, active], "active")[0].course.id, "2");
});
