import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { t } from "@/lib/i18n";
import { type AppLang, DEFAULT_APP_LANG } from "@/lib/i18n/config";
import {
  normalizeCommentItem,
  sanitizeAuthorName,
  sanitizeAuthorPhotoURL,
  sortLessonComments,
  type LessonCommentItem,
} from "@/lib/learning/comments";
import {
  MAX_COMPLETED_LESSONS,
  type CourseDoc,
  type LessonCommentDoc,
  type LessonDoc,
  type EnrollmentDoc,
  type EnrollmentProgress,
  type PaymentDoc,
  type PublicCourse,
  type PublicPreviewLesson,
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

function mapDocToPublicCourseClient(id: string, data: Partial<CourseDoc>): PublicCourse {
  return {
    id,
    slug: typeof data.slug === "string" ? data.slug : "",
    title: typeof data.title === "string" ? data.title : "",
    shortDescription: typeof data.shortDescription === "string" ? data.shortDescription : "",
    description: typeof data.description === "string" ? data.description : "",
    priceUSD: typeof data.priceUSD === "number" ? data.priceUSD : null,
    priceHTG: typeof data.priceHTG === "number" ? data.priceHTG : null,
    coverUrl: typeof data.coverUrl === "string" && data.coverUrl ? data.coverUrl : null,
    level: data.level ?? "debutant",
    language: data.language ?? "ht",
    durationMinutes: typeof data.durationMinutes === "number" ? data.durationMinutes : 0,
    lessonsCount: typeof data.lessonsCount === "number" ? data.lessonsCount : 0,
    syllabus: Array.isArray(data.syllabus)
      ? data.syllabus.map((m) => ({
          title: typeof m.title === "string" ? m.title : "",
          lessons: Array.isArray(m.lessons)
            ? m.lessons.map((l) => ({
                title: typeof l.title === "string" ? l.title : "",
              }))
            : [],
        }))
      : [],
  };
}

/**
 * Récupère les formations publiées côté client pour le catalogue intégré à l'espace élève.
 */
export async function getPublishedCoursesClient(): Promise<PublicCourse[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "courses"),
    where("status", "==", "published"),
    limit(200)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) =>
    mapDocToPublicCourseClient(d.id, d.data() as Partial<CourseDoc>)
  );
}

/**
 * Récupère une formation publiée (ou brouillon pour admin) par son slug côté client.
 */
export async function getPublishedCourseBySlugClient(
  slug: string,
  allowDraft = false
): Promise<PublicCourse | null> {
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
  return mapDocToPublicCourseClient(d.id, d.data() as Partial<CourseDoc>);
}

/**
 * Les aperçus vidéo avant achat sont désactivés : aucune leçon n'est exposée
 * côté client avant l'achat / inscription active.
 */
export async function getCourseFreePreviewLessonsClient(
  courseId: string
): Promise<PublicPreviewLesson[]> {
  void courseId;
  return [];
}

import { normalizeProgress } from "@/lib/learning/progress";

/**
 * Récupère l'inscription d'un élève pour un cours donné.
 * Vérifie d'abord l'ID canonique `${uid}_${courseId}`, puis recherche une
 * inscription active correspondante pour l'utilisateur si besoin.
 */
export async function getEnrollment(
  uid: string,
  courseId: string
): Promise<EnrollmentWithId | null> {
  if (!uid || !courseId) return null;
  const db = getFirebaseDb();
  const ref = doc(db, "enrollments", `${uid}_${courseId}`);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return {
      id: snap.id,
      ...(snap.data() as EnrollmentDoc),
    };
  }

  const q = query(
    collection(db, "enrollments"),
    where("uid", "==", uid),
    limit(100)
  );
  const querySnap = await getDocs(q);
  const matching = querySnap.docs.find((d) => {
    const data = d.data() as Partial<EnrollmentDoc>;
    return data.courseId === courseId && data.status === "active";
  });

  if (!matching) return null;
  return {
    id: matching.id,
    ...(matching.data() as EnrollmentDoc),
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
  progress: EnrollmentProgress,
  lang: AppLang = DEFAULT_APP_LANG,
  enrollmentId?: string
): Promise<void> {
  if (!uid || !courseId) {
    throw new Error("uid ak courseId obligatwa pou anrejistre pwogrè a.");
  }

  // Dédoublonnage et vérification de la borne stricte (500)
  const rawUnique = Array.from(new Set(progress.completedLessonIds || []));
  if (rawUnique.length > MAX_COMPLETED_LESSONS) {
    throw new Error(t("lecteur.limiteLeconsDepassee", lang));
  }
  const normalized = normalizeProgress({
    completedLessonIds: rawUnique,
    lastLessonId: progress.lastLessonId,
  });

  const db = getFirebaseDb();
  const targetDocId = enrollmentId || `${uid}_${courseId}`;
  const ref = doc(db, "enrollments", targetDocId);

  // Seul le champ progress est inclus dans la mise à jour
  await updateDoc(ref, {
    progress: normalized,
  });
}

export interface SaveProgressApiResult {
  ok: boolean;
  status: number;
  code?: string;
  enrollmentId?: string;
  error?: string;
}

export async function saveProgressViaApi(params: {
  idToken: string;
  courseId: string;
  progress: EnrollmentProgress;
}): Promise<SaveProgressApiResult> {
  const { idToken, courseId, progress } = params;
  const normalized = normalizeProgress(progress);

  try {
    const res = await fetch("/api/learning/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        courseId,
        completedLessonIds: normalized.completedLessonIds,
        lastLessonId: normalized.lastLessonId,
      }),
    });

    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      code?: string;
      enrollmentId?: string;
      error?: string;
    } | null;

    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        status: res.status,
        code: data?.code,
        error: data?.error,
      };
    }

    return {
      ok: true,
      status: res.status,
      enrollmentId: data.enrollmentId,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
    };
  }
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

export async function getLessonCommentsClient(
  courseId: string,
  lessonId: string
): Promise<LessonCommentItem[]> {
  if (!courseId || !lessonId) return [];
  const db = getFirebaseDb();
  const q = query(
    collection(db, "lessonComments"),
    where("lessonId", "==", lessonId),
    limit(200)
  );
  const snapshot = await getDocs(q);
  const rows = snapshot.docs
    .map((d) => {
      const data = d.data() as Partial<LessonCommentDoc>;
      return normalizeCommentItem({
        id: d.id,
        courseId: data.courseId ?? "",
        lessonId: data.lessonId ?? "",
        uid: data.uid ?? "",
        authorName: data.authorName,
        authorPhotoURL: data.authorPhotoURL ?? null,
        authorIsAdmin: data.authorIsAdmin === true,
        content: data.content ?? "",
        createdAtMs: data.createdAt?.toMillis?.() ?? 0,
      });
    })
    .filter((item) => item.courseId === courseId && item.content.length > 0);

  return sortLessonComments(rows);
}

export async function createLessonCommentClient(params: {
  courseId: string;
  lessonId: string;
  uid: string;
  authorName: string;
  authorPhotoURL: string | null;
  authorIsAdmin: boolean;
  content: string;
}): Promise<LessonCommentItem> {
  const db = getFirebaseDb();
  const safeName = sanitizeAuthorName(params.authorName);
  const safePhoto = sanitizeAuthorPhotoURL(params.authorPhotoURL);
  const cleanContent = params.content.trim();
  const nowMs = Date.now();

  const ref = await addDoc(collection(db, "lessonComments"), {
    courseId: params.courseId,
    lessonId: params.lessonId,
    uid: params.uid,
    authorName: safeName,
    authorPhotoURL: safePhoto,
    authorIsAdmin: params.authorIsAdmin,
    content: cleanContent,
    createdAt: serverTimestamp(),
  });

  return {
    id: ref.id,
    courseId: params.courseId,
    lessonId: params.lessonId,
    uid: params.uid,
    authorName: safeName,
    authorPhotoURL: safePhoto,
    authorIsAdmin: params.authorIsAdmin,
    content: cleanContent,
    createdAtMs: nowMs,
  };
}

export async function deleteLessonCommentClient(commentId: string): Promise<void> {
  if (!commentId) return;
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "lessonComments", commentId));
}

export interface FetchCommentsApiResult {
  ok: boolean;
  status: number;
  code?: string;
  comments?: LessonCommentItem[];
  error?: string;
}

export async function fetchLessonCommentsViaApi(params: {
  idToken: string;
  courseId: string;
  lessonId: string;
}): Promise<FetchCommentsApiResult> {
  const { idToken, courseId, lessonId } = params;
  try {
    const search = new URLSearchParams({ courseId, lessonId });
    const res = await fetch(`/api/learning/comments?${search.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      code?: string;
      comments?: LessonCommentItem[];
      error?: string;
    } | null;

    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        status: res.status,
        code: data?.code,
        error: data?.error,
      };
    }

    return {
      ok: true,
      status: res.status,
      comments: Array.isArray(data.comments) ? sortLessonComments(data.comments) : [],
    };
  } catch {
    return {
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
    };
  }
}

export interface PostCommentApiResult {
  ok: boolean;
  status: number;
  code?: string;
  comment?: LessonCommentItem;
  error?: string;
}

export async function postLessonCommentViaApi(params: {
  idToken: string;
  courseId: string;
  lessonId: string;
  content: string;
}): Promise<PostCommentApiResult> {
  const { idToken, courseId, lessonId, content } = params;
  try {
    const res = await fetch("/api/learning/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ courseId, lessonId, content }),
    });
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      code?: string;
      comment?: LessonCommentItem;
      error?: string;
    } | null;

    if (!res.ok || !data?.ok || !data.comment) {
      return {
        ok: false,
        status: res.status,
        code: data?.code,
        error: data?.error,
      };
    }

    return {
      ok: true,
      status: res.status,
      comment: data.comment,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
    };
  }
}

export interface DeleteCommentApiResult {
  ok: boolean;
  status: number;
  code?: string;
  error?: string;
}

export async function deleteLessonCommentViaApi(params: {
  idToken: string;
  commentId: string;
}): Promise<DeleteCommentApiResult> {
  const { idToken, commentId } = params;
  try {
    const search = new URLSearchParams({ commentId });
    const res = await fetch(`/api/learning/comments?${search.toString()}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      code?: string;
      error?: string;
    } | null;

    if (!res.ok || !data?.ok) {
      return {
        ok: false,
        status: res.status,
        code: data?.code,
        error: data?.error,
      };
    }

    return {
      ok: true,
      status: res.status,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
    };
  }
}
