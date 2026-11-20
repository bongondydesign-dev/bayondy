// server-only — recalcule syllabus + lessonsCount d'un cours après toute modif de leçon.
import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import type { SyllabusModule } from "@/types/firestore";

interface LessonRow {
  moduleId: string;
  moduleTitle: string;
  title: string;
  order: number;
  archived?: boolean;
}

/**
 * Relit toutes les leçons actives (non archivées) d'un cours,
 * reconstruit le syllabus (titres uniquement, jamais de youtubeVideoId)
 * et met à jour lessonsCount + syllabus du cours en une seule écriture.
 */
export async function recalcCourseSyllabus(courseId: string): Promise<void> {
  const db = getAdminDb();

  // Lecture de toutes les leçons du cours (non archivées, triées par order)
  const lessonsSnap = await db
    .collection("lessons")
    .where("courseId", "==", courseId)
    .orderBy("order", "asc")
    .get();

  // Regroupement par module
  const moduleMap = new Map<string, { title: string; lessons: { title: string; order: number }[] }>();

  for (const doc of lessonsSnap.docs) {
    const data = doc.data() as LessonRow;
    // Exclure les leçons archivées
    if (data.archived === true) continue;

    const existing = moduleMap.get(data.moduleId);
    if (existing) {
      existing.lessons.push({ title: data.title, order: data.order });
    } else {
      moduleMap.set(data.moduleId, {
        title: data.moduleTitle,
        lessons: [{ title: data.title, order: data.order }],
      });
    }
  }

  // Reconstruction du syllabus (titres uniquement — jamais d'identifiant vidéo)
  const syllabus: SyllabusModule[] = [];
  let totalLessons = 0;

  for (const [, mod] of moduleMap) {
    const sortedLessons = mod.lessons
      .sort((a, b) => a.order - b.order)
      .map((l) => ({ title: l.title })); // SyllabusLesson : title uniquement
    syllabus.push({ title: mod.title, lessons: sortedLessons });
    totalLessons += sortedLessons.length;
  }

  // Écriture atomique dans le document cours
  await db.collection("courses").doc(courseId).update({
    syllabus,
    lessonsCount: totalLessons,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
