import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminLog } from "@/lib/admin/adminLog";
import { validateCourseInput } from "@/lib/admin/validation";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import { revalidateCoursesCache } from "@/lib/courses/revalidate";
import { FieldValue } from "firebase-admin/firestore";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/courses/[id] — détail d'une formation + ses leçons (admin)
export async function GET(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: "Konfigirasyon sèvè a enkonplè." }, { status: 503 });
  }

  const { id } = await ctx.params;

  try {
    const db = getAdminDb();
    const courseDoc = await db.collection("courses").doc(id).get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Formation introuvable." }, { status: 404 });
    }

    const d = courseDoc.data()!;

    // Récupérer les leçons du cours — youtubeVideoId inclus (admin uniquement)
    const lessonsSnap = await db
      .collection("lessons")
      .where("courseId", "==", id)
      .orderBy("order", "asc")
      .get();

    const lessons = lessonsSnap.docs.map((doc) => {
      const ld = doc.data();
      return {
        id: doc.id,
        courseId: ld.courseId ?? "",
        moduleId: ld.moduleId ?? "",
        moduleTitle: ld.moduleTitle ?? "",
        title: ld.title ?? "",
        order: ld.order ?? 0,
        youtubeVideoId: ld.youtubeVideoId ?? "",
        durationMinutes: ld.durationMinutes ?? 0,
        isFreePreview: ld.isFreePreview ?? false,
        archived: ld.archived ?? false,
        resources: ld.resources ?? [],
      };
    });

    return NextResponse.json({
      course: {
        id: courseDoc.id,
        slug: d.slug ?? "",
        title: d.title ?? "",
        shortDescription: d.shortDescription ?? "",
        description: d.description ?? "",
        level: d.level ?? "",
        language: d.language ?? "",
        status: d.status ?? "draft",
        durationMinutes: d.durationMinutes ?? 0,
        coverUrl: d.coverUrl ?? null,
        priceUSD: d.priceUSD ?? null,
        priceHTG: d.priceHTG ?? null,
        lessonsCount: d.lessonsCount ?? 0,
        syllabus: d.syllabus ?? [],
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      },
      lessons,
    });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}

// PATCH /api/admin/courses/[id] — modifie une formation
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: "Konfigirasyon sèvè a enkonplè." }, { status: 503 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { data, errors } = validateCourseInput(body);
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Aucun champ à modifier
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide à modifier." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const courseRef = db.collection("courses").doc(id);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Formation introuvable." }, { status: 404 });
    }

    const existing = courseDoc.data()!;

    // Vérification publication : title, description, au moins 1 leçon
    if (data.status === "published") {
      const title = data.title ?? existing.title;
      const description = data.description ?? existing.description;
      const lessonsCount = existing.lessonsCount ?? 0;
      if (!title || !description || lessonsCount < 1) {
        return NextResponse.json(
          { error: "Pou pibliye, fòmasyon an dwe gen yon tit, yon deskripsyon ak omwen yon leson." },
          { status: 422 }
        );
      }
    }

    // Le slug ne change pas après publication (sauf décision explicite)
    if (data.slug && existing.status === "published") {
      delete data.slug;
    }

    // Vérifier unicité slug si modifié
    if (data.slug && data.slug !== existing.slug) {
      const dup = await db.collection("courses").where("slug", "==", data.slug).limit(1).get();
      if (!dup.empty) {
        return NextResponse.json({ error: "Ce slug est déjà utilisé par une autre formation." }, { status: 409 });
      }
    }

    // Liste blanche stricte — construction manuelle de l'objet update
    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
    if (data.title !== undefined) update.title = data.title;
    if (data.shortDescription !== undefined) update.shortDescription = data.shortDescription;
    if (data.description !== undefined) update.description = data.description;
    if (data.level !== undefined) update.level = data.level;
    if (data.language !== undefined) update.language = data.language;
    if (data.status !== undefined) update.status = data.status;
    if (data.slug !== undefined) update.slug = data.slug;
    if (data.durationMinutes !== undefined) update.durationMinutes = data.durationMinutes;
    if ("coverUrl" in data) update.coverUrl = data.coverUrl;
    if ("priceUSD" in data) update.priceUSD = data.priceUSD;
    if ("priceHTG" in data) update.priceHTG = data.priceHTG;

    await courseRef.update(update);

    // Log d'audit — résumé des champs modifiés (sans données sensibles)
    const changed = Object.keys(update)
      .filter((k) => k !== "updatedAt")
      .join(", ");

    const action =
      data.status === "published"
        ? "course.publish"
        : data.status === "draft"
        ? "course.unpublish"
        : "course.update";

    await writeAdminLog(auth.user.uid, action, { type: "course", id }, `Champs modifiés: ${changed}`);

    revalidateCoursesCache([
      typeof existing.slug === "string" ? existing.slug : null,
      typeof data.slug === "string" ? data.slug : null,
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
