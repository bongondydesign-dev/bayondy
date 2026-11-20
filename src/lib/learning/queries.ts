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
import type {
  CourseDoc,
  LessonDoc,
  EnrollmentDoc,
  EnrollmentProgress,
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
    where("status", "==", "active")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as EnrollmentDoc),
  }));
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
 * Récupère un cours par son slug pour un élève connecté.
 * Filtre strictement slug et status == "published".
 */
export async function getCourseBySlugForStudent(
  slug: string
): Promise<CourseWithId | null> {
  if (!slug) return null;
  const db = getFirebaseDb();
  const q = query(
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
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as LessonDoc),
  }));
}

/**
 * Met à jour UNIQUEMENT le champ progress d'une inscription active.
 * - completedLessonIds est borné à 200 éléments (limite des règles <= 500)
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

  // Dédoublonnage et conservation de l'ordre, borné à 200 éléments
  const uniqueIds = Array.from(new Set(progress.completedLessonIds || [])).slice(
    0,
    200
  );
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
