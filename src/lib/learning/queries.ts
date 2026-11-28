import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { t } from "@/lib/i18n";
import {
  MAX_COMPLETED_LESSONS,
  type CourseDoc,
  type LessonDoc,
  type EnrollmentDoc,
  type EnrollmentProgress,
  type PaymentDoc,
} from "@/types/firestore";

export interface EnrollmentWithId extends EnrollmentDoc {
  id: string;
}

export interface CourseWithId extends CourseDoc {
  id: string;
}

export interface LessonWithId extends LessonDoc {
  id: string;
}

export interface PaymentWithId extends PaymentDoc {
  id: string;
}

/**
 * Récupère les inscriptions actives de l'élève connecté.
 * Filtre strictement where("uid", "==", uid) et where("status", "==", "active").
 */
export async function getMyEnrollments(uid: string): Promise<EnrollmentWithId[]> {
  if (!uid) return [];
  const db = getFirebaseDb();
  const q = query(
    collection(db, "enrollments"),
    where("uid", "==", uid),
    where("status", "==", "active"),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as EnrollmentDoc),
  }));
}

/**
 * Récupère l'inscription de l'élève pour un cours spécifique.
 */
export async function getEnrollmentForCourse(
  uid: string,
  courseId: string
): Promise<EnrollmentDoc | null> {
  if (!uid || !courseId) return null;
  const db = getFirebaseDb();
  const enrollmentDocRef = doc(db, "enrollments", `${uid}_${courseId}`);
  const snap = await getDoc(enrollmentDocRef);
  if (!snap.exists()) return null;
  return snap.data() as EnrollmentDoc;
}

/**
 * Récupère un cours par son ID (pour le tableau de bord de l'élève).
 * Le client ne peut lire que les cours avec status == 'published' (ou si admin).
 */
export async function getCourseByIdForStudent(
  courseId: string
): Promise<CourseWithId | null> {
  if (!courseId) return null;
  const db = getFirebaseDb();
  const ref = doc(db, "courses", courseId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...(snap.data() as CourseDoc),
  };
}

/**
 * Récupère un cours par son slug pour un élève connecté (published) ou un admin (published + draft).
 */
export async function getCourseBySlugForStudent(
  slug: string,
  allowDraft = false
): Promise<CourseWithId | null> {
  if (!slug) return null;
  const db = getFirebaseDb();
  const q = allowDraft
    ? query(collection(db, "courses"), where("slug", "==", slug), limit(1))
    : query(
        collection(db, "courses"),
        where("slug", "==", slug),
        where("status", "==", "published"),
        limit(1)
      );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return {
    id: d.id,
    ...(d.data() as CourseDoc),
  };
}

/**
 * Récupère toutes les formations pour un administrateur connecté (accès gratuit global).
 */
export async function getAllCoursesForAdmin(): Promise<CourseWithId[]> {
  const db = getFirebaseDb();
  const snapshot = await getDocs(query(collection(db, "courses"), limit(200)));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as CourseDoc),
  }));
}

/**
 * Récupère l'inscription d'un élève pour un cours donné.
 * ID canonique = `${uid}_${courseId}`.
 */
export async function getEnrollment(
  uid: string,
  courseId: string
): Promise<EnrollmentWithId | null> {
  if (!uid || !courseId) return null;
  const db = getFirebaseDb();
  const ref = doc(db, "enrollments", `${uid}_${courseId}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    ...(snap.data() as EnrollmentDoc),
  };
}

/**
 * Récupère toutes les leçons d'un cours ordonnées.
 *
 * ⚠️ TOUJOURS filtrer par courseId :
 * Les règles de sécurité Firestore évaluent les requêtes de façon globale
 * et ne filtrent PAS automatiquement les documents. Toute requête sur la
 * collection `lessons` sans filtre where("courseId", "==", courseId)
 * sera immédiatement rejetée avec permission-denied.
 */
export async function getCourseLessons(
  courseId: string
): Promise<LessonWithId[]> {
  if (!courseId) return [];
  const db = getFirebaseDb();
  const q = query(
    collection(db, "lessons"),
    where("courseId", "==", courseId),
    orderBy("order", "asc"),
    limit(500)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({
      id: d.id,
      ...(d.data() as LessonDoc),
    }))
    .filter((lesson) => lesson.archived !== true);
}

/**
 * Met à jour UNIQUEMENT le champ progress d'une inscription active.
 * - completedLessonIds est borné à 500 éléments (MAX_COMPLETED_LESSONS, imposé par firestore.rules)
 * - si completedLessonIds dépasse la borne, bloque l'écriture avec une erreur via t()
 * - lastLessonId est tronqué à 128 caractères maximum
 * - AUCUN autre champ n'est modifié, sous peine de refus par firestore.rules
 */
export async function saveProgress(
  uid: string,
  courseId: string,
  progress: EnrollmentProgress
): Promise<void> {
  if (!uid || !courseId) {
    throw new Error("uid ak courseId obligatwa pou anrejistre pwogrè a.");
  }

  // Dédoublonnage et vérification de la borne stricte (500)
  const uniqueIds = Array.from(new Set(progress.completedLessonIds || []));
  if (uniqueIds.length > MAX_COMPLETED_LESSONS) {
    throw new Error(t("lecteur.limiteLeconsDepassee"));
  }
  const sanitizedLastLessonId = (progress.lastLessonId || "").slice(0, 128);

  const db = getFirebaseDb();
  const ref = doc(db, "enrollments", `${uid}_${courseId}`);

  // Seul le champ progress est inclus dans la mise à jour
  await updateDoc(ref, {
    progress: {
      completedLessonIds: uniqueIds,
      lastLessonId: sanitizedLastLessonId,
    },
  });
}

/**
 * Récupère les paiements de l'élève connecté.
 * Filtre strictement where("uid", "==", uid) conformément aux règles Firestore.
 */
export async function getMyPayments(uid: string): Promise<PaymentWithId[]> {
  if (!uid) return [];
  const db = getFirebaseDb();
  const q = query(
    collection(db, "payments"),
    where("uid", "==", uid),
    limit(25)
  );
  const snapshot = await getDocs(q);
  const rows = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as PaymentDoc),
  }));

  rows.sort((a, b) => {
    const msA = a.createdAt?.toMillis?.() ?? 0;
    const msB = b.createdAt?.toMillis?.() ?? 0;
    return msB - msA;
  });

  return rows;
}

