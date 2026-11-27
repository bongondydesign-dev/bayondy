import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminLog } from "@/lib/admin/adminLog";
import { validateLessonInput } from "@/lib/admin/validation";
import { recalcCourseSyllabus } from "@/lib/admin/syllabusUpdater";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/admin/courses/[id]/lessons — ajoute une leçon à une formation
export async function POST(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: "Konfigirasyon sèvè a enkonplè." }, { status: 503 });
  }

  const { id: courseId } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  // Injecter courseId dans le body avant validation
  const bodyWithCourse =
    typeof body === "object" && body !== null
      ? { ...(body as Record<string, unknown>), courseId }
      : { courseId };

  const { data, errors } = validateLessonInput(bodyWithCourse);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Champs obligatoires
  if (!data.title || !data.youtubeVideoId || !data.moduleId || !data.moduleTitle) {
    return NextResponse.json(
      { error: "Champs obligatoires: title, youtubeVideoId, moduleId, moduleTitle." },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();

    // Vérifier que le cours existe
    const courseDoc = await db.collection("courses").doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Formation introuvable." }, { status: 404 });
    }

    const lessonRef = db.collection("lessons").doc();

    // Écriture avec liste blanche stricte — pas de youtubeVideoId dans syllabus ici
    await lessonRef.set({
      courseId: data.courseId,
      moduleId: data.moduleId,
      moduleTitle: data.moduleTitle,
      title: data.title,
      order: data.order ?? 0,
      youtubeVideoId: data.youtubeVideoId,
      durationMinutes: data.durationMinutes ?? 0,
      isFreePreview: data.isFreePreview ?? false,
      archived: false,
      resources: data.resources ?? [],
      createdAt: FieldValue.serverTimestamp(),
    });

    // Recalcul atomique du syllabus (titres seulement) + lessonsCount
    await recalcCourseSyllabus(courseId);

    await writeAdminLog(
      auth.user.uid,
      "lesson.create",
      { type: "lesson", id: lessonRef.id },
      `Cours: ${courseId}, Module: "${data.moduleTitle}", Titre: "${data.title}"`
    );

    return NextResponse.json({ id: lessonRef.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
