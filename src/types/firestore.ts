// ============================================================
// src/types/firestore.ts
// Source de vérité du modèle de données Firestore de BAYONDY
// ============================================================
import type { Timestamp } from "firebase/firestore";

// ------------------------------------------------------------------
// users/{uid}
// Rôle admin exclusivement via custom claim (token.admin == true).
// Aucun champ "role" ici — interdit par les règles de sécurité.
// ------------------------------------------------------------------
export interface UserDoc {
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// ------------------------------------------------------------------
// courses/{courseId}
// Les prix sont stockés mais jamais inventés ici (valeur [À DÉCIDER]).
// ------------------------------------------------------------------
export type CourseLevel = "debutant" | "intermediaire" | "avance";
export type CourseLanguage = "ht" | "fr" | "en";
export type CourseStatus = "draft" | "published";

export interface SyllabusLesson {
  title: string;
  // Jamais d'identifiant vidéo dans le syllabus — sécurité oblige.
}

export interface SyllabusModule {
  title: string;
  lessons: SyllabusLesson[];
}

export interface CourseDoc {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  priceUSD?: number | null; // optionnel, sans valeur par défaut
  priceHTG?: number | null; // optionnel, sans valeur par défaut
  coverUrl: string;
  level: CourseLevel;
  language: CourseLanguage;
  durationMinutes: number;
  status: CourseStatus;
  syllabus: SyllabusModule[];
  lessonsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ------------------------------------------------------------------
// PublicCourse
// Projection sécurisée renvoyée aux composants publics côté serveur.
// Ne contient JAMAIS de données internes ni d'identifiant vidéo.
// ------------------------------------------------------------------
export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  priceUSD: number | null;
  priceHTG: number | null;
  coverUrl: string | null;
  level: CourseLevel;
  language: CourseLanguage;
  durationMinutes: number;
  lessonsCount: number;
  syllabus: SyllabusModule[];
}

export interface PublicPreviewLesson {
  id: string;
  title: string;
  moduleTitle: string;
  order: number;
  durationMinutes: number;
  youtubeVideoId: string;
  videoProvider?: VideoProvider;
  videoId?: string;
  videoUrl?: string;
}

// ------------------------------------------------------------------
// lessons/{lessonId}
// ⚠️  Les règles Firestore ne filtrent pas les requêtes de collection.
// Toute lecture côté client DOIT être filtrée par courseId.
// Pour un cours accessible, lire les leçons une par une ou
// via une requête where("courseId", "==", courseId).
// ------------------------------------------------------------------
export interface LessonResource {
  label: string;
  url: string;
}

export type VideoProvider = "tiktok" | "youtube";

export interface LessonDoc {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  order: number;
  youtubeVideoId: string;
  videoProvider?: VideoProvider;
  videoId?: string;
  videoUrl?: string;
  durationMinutes: number;
  isFreePreview: boolean;
  archived?: boolean;
  resources: LessonResource[];
}

// ------------------------------------------------------------------
// enrollments/{uid_courseId}
// ID = `${uid}_${courseId}` — convention, appliquée côté serveur.
// Le client ne peut modifier que le champ progress.
// ------------------------------------------------------------------
export type EnrollmentStatus = "active" | "revoked";
export type EnrollmentSource = "payment" | "manual";

/** Borne maximale d'éléments dans progress.completedLessonIds (imposée par firestore.rules) */
export const MAX_COMPLETED_LESSONS = 500;

export interface EnrollmentProgress {
  completedLessonIds: string[]; // max 500 éléments (règle MAX_COMPLETED_LESSONS)
  lastLessonId: string;
}

export interface EnrollmentDoc {
  uid: string;
  courseId: string;
  status: EnrollmentStatus;
  source: EnrollmentSource;
  paymentId: string | null;
  grantedAt: Timestamp;
  progress: EnrollmentProgress;
}

// ------------------------------------------------------------------
// lessonComments/{commentId}
// Lecture & création par élève inscrit (ou admin) ; suppression par admin uniquement.
// ------------------------------------------------------------------
export const MAX_COMMENT_LENGTH = 2000;

export interface LessonCommentDoc {
  courseId: string;
  lessonId: string;
  uid: string;
  authorName: string;
  authorPhotoURL: string | null;
  authorIsAdmin?: boolean;
  content: string;
  createdAt: Timestamp;
}

// ------------------------------------------------------------------
// payments/{paymentId}
// Lecture élève (propres paiements) — aucune écriture côté client.
// ------------------------------------------------------------------
export type PaymentMethod = "moncash" | "natcash" | "card" | (string & {});
export type PaymentStatus =
  | "awaiting_payment"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";

export interface PaymentDoc {
  uid: string;
  courseId: string;
  amount: number;
  currency: string; // "USD" | "HTG"
  method: PaymentMethod;
  orderId?: string;
  merchantReference: string;
  providerReference?: string;
  returnUrl?: string;
  status: PaymentStatus;
  paymentUrl?: string | null;
  failureReason?: string | null;
  createdAt: Timestamp;
  paidAt: Timestamp | null;
}

// ------------------------------------------------------------------
// adminLogs/{logId}
// Journal d'audit — lecture et écriture exclusivement via Admin SDK.
// Aucune lecture ni écriture côté client.
// ------------------------------------------------------------------
export type AdminLogAction =
  | "course.create"
  | "course.update"
  | "course.publish"
  | "course.unpublish"
  | "course.delete"
  | "lesson.create"
  | "lesson.update"
  | "lesson.archive"
  | "access.grant"
  | "access.revoke";

export interface AdminLogTarget {
  type: "course" | "lesson" | "enrollment";
  id: string;
}

export interface AdminLogDoc {
  adminUid: string;
  action: AdminLogAction;
  target: AdminLogTarget;
  summary: string; // résumé sans youtubeVideoId ni données personnelles
  timestamp: Timestamp;
}
