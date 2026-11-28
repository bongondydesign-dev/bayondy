import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminLog } from "@/lib/admin/adminLog";
import { slugifyCourseText } from "@/lib/admin/courseHelpers";
import { validateLessonInput } from "@/lib/admin/validation";
import { recalcCourseSyllabus } from "@/lib/admin/syllabusUpdater";
import { resolveTikTokShortUrl } from "@/lib/video/resolveTikTok.server";
import { getAdminDb } from "@/lib/firebase-admin";
import { revalidateCoursesCache } from "@/lib/courses/revalidate";
import { FieldValue } from "firebase-admin/firestore";

interface RouteContext {
  params: Promise<{ lessonId: string }>;
}

// PATCH /api/admin/lessons/[lessonId] — modifie une leçon
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { lessonId } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { data, errors } = validateLessonInput(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide à modifier." }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    const lessonRef = db.collection("lessons").doc(lessonId);
    const lessonDoc = await lessonRef.get();
    if (!lessonDoc.exists) {
      return NextResponse.json({ error: "Leçon introuvable." }, { status: 404 });
    }

    const courseId = lessonDoc.data()!.courseId as string;

    // Liste blanche stricte
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (data.moduleId !== undefined) {
      update.moduleId = data.moduleId;
    } else if (data.moduleTitle !== undefined && !lessonDoc.data()!.moduleId) {
      update.moduleId = slugifyCourseText(data.moduleTitle, 80) || "modil-01";
    }
    if (data.moduleTitle !== undefined) update.moduleTitle = data.moduleTitle;
    if (data.title !== undefined) update.title = data.title;
    if (data.order !== undefined) update.order = data.order;

    if (data.videoProvider !== undefined) {
      let finalVideoId = data.videoId ?? "";
      let finalVideoUrl = data.videoUrl ?? "";
      if (data.videoProvider === "tiktok" && data.needsShortResolve && finalVideoUrl) {
        const resolved = await resolveTikTokShortUrl(finalVideoUrl);
        if (resolved.videoId) finalVideoId = resolved.videoId;
        if (resolved.videoUrl) finalVideoUrl = resolved.videoUrl;
      }
      update.videoProvider = data.videoProvider;
      update.videoId = finalVideoId;
      update.videoUrl = finalVideoUrl;
      update.youtubeVideoId = data.youtubeVideoId ?? "";
    } else if (data.youtubeVideoId !== undefined) {
      update.youtubeVideoId = data.youtubeVideoId;
    }

    if (data.durationMinutes !== undefined) update.durationMinutes = data.durationMinutes;
    if (data.isFreePreview !== undefined) update.isFreePreview = data.isFreePreview;
    if (data.resources !== undefined) update.resources = data.resources;

    await lessonRef.update(update);

    // Recalcul du syllabus après modif
    await recalcCourseSyllabus(courseId);

    const changed = Object.keys(update)
      .filter((k) => k !== "updatedAt" && k !== "videoId" && k !== "videoUrl" && k !== "youtubeVideoId")
      .join(", ");

    await writeAdminLog(
      auth.user.uid,
      "lesson.update",
      { type: "lesson", id: lessonId },
      `Champs modifiés: ${changed || "video"}`
    );

    const courseDoc = await db.collection("courses").doc(courseId).get();
    const courseSlug = courseDoc.data()?.slug;
    revalidateCoursesCache(typeof courseSlug === "string" ? courseSlug : null);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}

// DELETE /api/admin/lessons/[lessonId] — archivage logique (jamais de suppression définitive)
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { lessonId } = await ctx.params;
  const db = getAdminDb();

  try {
    const lessonRef = db.collection("lessons").doc(lessonId);
    const lessonDoc = await lessonRef.get();
    if (!lessonDoc.exists) {
      return NextResponse.json({ error: "Leçon introuvable." }, { status: 404 });
    }

    const courseId = lessonDoc.data()!.courseId as string;
    const title = lessonDoc.data()!.title as string;

    // Archivage logique — jamais de suppression définitive
    await lessonRef.update({ archived: true, updatedAt: FieldValue.serverTimestamp() });

    // Recalcul du syllabus (leçon archivée exclue)
    await recalcCourseSyllabus(courseId);

    await writeAdminLog(
      auth.user.uid,
      "lesson.archive",
      { type: "lesson", id: lessonId },
      `Leson archivée: "${title}", cours: ${courseId}`
    );

    const courseDoc = await db.collection("courses").doc(courseId).get();
    const courseSlug = courseDoc.data()?.slug;
    revalidateCoursesCache(typeof courseSlug === "string" ? courseSlug : null);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
