import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import type {
  CourseDoc,
  PublicCourse,
  PublicPreviewLesson,
} from "@/types/firestore";

/**
 * Mappe un document Firestore brut vers l'objet PublicCourse sécurisé.
 * Ne fait JAMAIS de spread du document complet.
 * Ne lit JAMAIS la collection lessons ni aucun identifiant vidéo (youtubeVideoId).
 */
function mapDocToPublicCourse(id: string, data: Partial<CourseDoc>): PublicCourse {
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
 * Récupère toutes les formations publiées pour le catalogue.
 * Filtre strictement where("status", "==", "published").
 */
export async function getPublishedCourses(): Promise<PublicCourse[]> {
  "use cache";
  cacheTag("courses");
  cacheLife({
    stale: 60,
    revalidate: 300,
    expire: 3600,
  });

  if (!hasAdminCredentials()) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[getPublishedCourses] Firebase Admin credentials missing.");
    }
    return [];
  }

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("courses")
      .where("status", "==", "published")
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) =>
      mapDocToPublicCourse(doc.id, doc.data() as Partial<CourseDoc>)
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getPublishedCourses error]", error);
    }
    return [];
  }
}

/**
 * Récupère une formation publiée spécifique par son slug.
 * Filtre strictement slug ET status == "published".
 * Renvoie null si la formation n'existe pas ou est en mode "draft".
 */
export async function getPublishedCourseBySlug(
  slug: string
): Promise<PublicCourse | null> {
  "use cache";
  cacheTag("courses", `course-${slug}`);
  cacheLife({
    stale: 60,
    revalidate: 300,
    expire: 3600,
  });

  if (!slug || typeof slug !== "string") {
    return null;
  }

  if (!hasAdminCredentials()) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[getPublishedCourseBySlug] Firebase Admin credentials missing.");
    }
    return null;
  }

  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection("courses")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return mapDocToPublicCourse(doc.id, doc.data() as Partial<CourseDoc>);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[getPublishedCourseBySlug error]",
        error instanceof Error ? error.name : "unknown"
      );
    }
    return null;
  }
}

/**
 * Les aperçus vidéo avant achat sont désactivés : aucune leçon n'est exposée
 * publiquement avant l'inscription active de l'élève.
 */
export async function getCourseFreePreviewLessons(
  courseId: string
): Promise<PublicPreviewLesson[]> {
  void courseId;
  return [];
}

