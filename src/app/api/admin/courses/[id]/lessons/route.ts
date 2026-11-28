import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminLog } from "@/lib/admin/adminLog";
import { slugifyCourseText } from "@/lib/admin/courseHelpers";
import { validateLessonInput } from "@/lib/admin/validation";
import { recalcCourseSyllabus } from "@/lib/admin/syllabusUpdater";
import { resolveTikTokShortUrl } from "@/lib/video/resolveTikTok.server";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import { revalidateCoursesCache } from "@/lib/courses/revalidate";
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

  const resolvedModuleTitle = data.moduleTitle ?? "";
  const resolvedModuleId =
    data.moduleId ||
    (resolvedModuleTitle ? slugifyCourseText(resolvedModuleTitle, 80) || "modil-01" : "");

  const hasVideo = Boolean(data.videoProvider && (data.videoId || data.videoUrl));

  // Champs obligatoires
  if (!data.title || !hasVideo || !resolvedModuleId || !resolvedModuleTitle) {
    return NextResponse.json(
      { error: "Champs obligatoires: title, lien vidéo TikTok ou YouTube, moduleTitle." },
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

    let finalVideoId = data.videoId ?? "";
    let finalVideoUrl = data.videoUrl ?? "";
    if (data.videoProvider === "tiktok" && data.needsShortResolve && finalVideoUrl) {
      const resolved = await resolveTikTokShortUrl(finalVideoUrl);
      if (resolved.videoId) finalVideoId = resolved.videoId;
      if (resolved.videoUrl) finalVideoUrl = resolved.videoUrl;
    }

    // Déterminer l'ordre automatiquement si absent
    let resolvedOrder = data.order;
    if (resolvedOrder === undefined) {
      const existingLessons = await db
        .collection("lessons")
        .where("courseId", "==", courseId)
        .get();
      let maxOrder = 0;
      for (const doc of existingLessons.docs) {
        const ld = doc.data();
        if (ld.archived !== true && typeof ld.order === "number" && ld.order > maxOrder) {
          maxOrder = ld.order;
        }
      }
      resolvedOrder = Math.max(existingLessons.size + 1, maxOrder + 1);
    }

    const lessonRef = db.collection("lessons").doc();

    // Écriture avec liste blanche stricte — aucun lien vidéo dans syllabus ou logs
    await lessonRef.set({
      courseId: data.courseId,
      moduleId: resolvedModuleId,
      moduleTitle: resolvedModuleTitle,
      title: data.title,
      order: resolvedOrder,
      youtubeVideoId: data.youtubeVideoId ?? "",
      videoProvider: data.videoProvider,
      videoId: finalVideoId,
      videoUrl: finalVideoUrl,
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
      `Cours: ${courseId}, Module: "${resolvedModuleTitle}", Titre: "${data.title}", Source: ${data.videoProvider}`
    );

    const courseSlug = courseDoc.data()?.slug;
    revalidateCoursesCache(typeof courseSlug === "string" ? courseSlug : null);

    return NextResponse.json({ id: lessonRef.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
