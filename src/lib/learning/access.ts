import type { EnrollmentStatus } from "@/types/firestore";
import type { CourseWithId, EnrollmentWithId } from "@/lib/learning/queries";
import type { StudentCourseItem } from "@/lib/learning/stats";

/**
 * Détermine si un utilisateur a accès au contenu d'une formation.
 * Les administrateurs ont toujours accès gratuitement sans paiement ni inscription préalable.
 */
export function hasCourseAccess(params: {
  isAdmin: boolean;
  enrollmentStatus?: EnrollmentStatus | string | null;
}): boolean {
  if (params.isAdmin) return true;
  return params.enrollmentStatus === "active";
}

/**
 * Détermine si le bouton de paiement doit être affiché sur la fiche formation.
 * Les administrateurs n'ont jamais besoin de payer.
 */
export function shouldShowPaymentOption(params: {
  isAuthenticated: boolean;
  isAdmin: boolean;
  enrollmentStatus?: EnrollmentStatus | string | null;
}): boolean {
  if (!params.isAuthenticated) return false;
  if (params.isAdmin) return false;
  return params.enrollmentStatus !== "active";
}

/**
 * Fusionne toutes les formations disponibles avec les éventuelles inscriptions existantes
 * pour l'espace "Mes formations" d'un administrateur, sans dupliquer les cours.
 */
export function mergeAdminCoursesWithEnrollments(
  courses: CourseWithId[],
  enrollments: EnrollmentWithId[],
  adminUid: string
): StudentCourseItem[] {
  const enrollmentByCourseId = new Map<string, EnrollmentWithId>();
  for (const enr of enrollments) {
    if (enr.status === "active") {
      enrollmentByCourseId.set(enr.courseId, enr);
    }
  }

  return courses.map((course) => {
    const existing = enrollmentByCourseId.get(course.id);
    if (existing) {
      return { enrollment: existing, course };
    }

    const virtualEnrollment: EnrollmentWithId = {
      id: `admin_${course.id}`,
      uid: adminUid,
      courseId: course.id,
      status: "active",
      source: "manual",
      paymentId: null,
      grantedAt: course.createdAt,
      progress: {
        completedLessonIds: [],
        lastLessonId: "",
      },
    };

    return {
      enrollment: virtualEnrollment,
      course,
    };
  });
}
