import test from "node:test";
import assert from "node:assert/strict";
import {
  canAccessLessonVideo,
  hasCourseAccess,
  mergeAdminCoursesWithEnrollments,
  shouldShowPaymentOption,
} from "./access";
import type { CourseWithId, EnrollmentWithId } from "./queries";

function makeCourse(id: string, title: string): CourseWithId {
  return {
    id,
    slug: id,
    title,
    shortDescription: "",
    description: "",
    coverUrl: "",
    level: "debutant",
    language: "ht",
    durationMinutes: 60,
    status: "published",
    syllabus: [],
    lessonsCount: 5,
    createdAt: {} as CourseWithId["createdAt"],
    updatedAt: {} as CourseWithId["updatedAt"],
  };
}

test("hasCourseAccess grants access to admins even without an enrollment", () => {
  assert.equal(hasCourseAccess({ isAdmin: true, enrollmentStatus: null }), true);
  assert.equal(hasCourseAccess({ isAdmin: true, enrollmentStatus: "revoked" }), true);
  assert.equal(hasCourseAccess({ isAdmin: false, enrollmentStatus: "active" }), true);
  assert.equal(hasCourseAccess({ isAdmin: false, enrollmentStatus: null }), false);
  assert.equal(hasCourseAccess({ isAdmin: false, enrollmentStatus: "revoked" }), false);
});

test("canAccessLessonVideo denies preview playback before purchase even when isFreePreview is true", () => {
  assert.equal(
    canAccessLessonVideo({ isAdmin: false, enrollmentStatus: null, isFreePreview: true }),
    false
  );
  assert.equal(
    canAccessLessonVideo({ isAdmin: false, enrollmentStatus: "revoked", isFreePreview: true }),
    false
  );
  assert.equal(
    canAccessLessonVideo({ isAdmin: false, enrollmentStatus: "active", isFreePreview: false }),
    true
  );
  assert.equal(
    canAccessLessonVideo({ isAdmin: true, enrollmentStatus: null, isFreePreview: false }),
    true
  );
});

test("shouldShowPaymentOption never asks admins to pay", () => {
  assert.equal(
    shouldShowPaymentOption({ isAuthenticated: true, isAdmin: true, enrollmentStatus: null }),
    false
  );
  assert.equal(
    shouldShowPaymentOption({ isAuthenticated: true, isAdmin: false, enrollmentStatus: null }),
    true
  );
  assert.equal(
    shouldShowPaymentOption({ isAuthenticated: true, isAdmin: false, enrollmentStatus: "active" }),
    false
  );
  assert.equal(
    shouldShowPaymentOption({ isAuthenticated: false, isAdmin: false, enrollmentStatus: null }),
    false
  );
});

test("mergeAdminCoursesWithEnrollments preserves real progress and includes unpaid courses", () => {
  const c1 = makeCourse("c1", "Course 1");
  const c2 = makeCourse("c2", "Course 2");
  const realEnrollment: EnrollmentWithId = {
    id: "admin1_c1",
    uid: "admin1",
    courseId: "c1",
    status: "active",
    source: "manual",
    paymentId: null,
    grantedAt: c1.createdAt,
    progress: {
      completedLessonIds: ["l1", "l2"],
      lastLessonId: "l2",
    },
  };

  const merged = mergeAdminCoursesWithEnrollments([c1, c2], [realEnrollment], "admin1");
  assert.equal(merged.length, 2);
  assert.equal(merged[0].enrollment.id, "admin1_c1");
  assert.deepEqual(merged[0].enrollment.progress.completedLessonIds, ["l1", "l2"]);
  assert.equal(merged[1].enrollment.id, "admin_c2");
  assert.equal(merged[1].enrollment.status, "active");
  assert.deepEqual(merged[1].enrollment.progress.completedLessonIds, []);
});
