import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminLog } from "@/lib/admin/adminLog";
import { slugifyCourseText } from "@/lib/admin/courseHelpers";
import { validateCourseInput } from "@/lib/admin/validation";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import { readJsonBodyWithLimit } from "@/lib/server/requestGuards";
import { FieldValue } from "firebase-admin/firestore";

// GET /api/admin/courses — liste toutes les formations (published + draft)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: "Konfigirasyon sèvè a enkonplè." }, { status: 503 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("courses").orderBy("createdAt", "desc").limit(200).get();
    const courses = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        slug: d.slug ?? "",
        title: d.title ?? "",
        status: d.status ?? "draft",
        lessonsCount: d.lessonsCount ?? 0,
        level: d.level ?? "",
        language: d.language ?? "",
        coverUrl: typeof d.coverUrl === "string" && d.coverUrl ? d.coverUrl : null,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });
    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}

// POST /api/admin/courses — crée une nouvelle formation
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: "Konfigirasyon sèvè a enkonplè." }, { status: 503 });
  }

  const bodyResult = await readJsonBodyWithLimit(req);
  if (!bodyResult.ok) {
    return NextResponse.json({ error: bodyResult.error }, { status: bodyResult.status });
  }
  const body = bodyResult.data;

  const { data, errors } = validateCourseInput(body, { isCreate: true });
  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  if (!data.title) {
    return NextResponse.json(
      { error: "Le titre de la formation est obligatoire." },
      { status: 400 }
    );
  }

  const level = data.level ?? "debutant";
  const language = data.language ?? "ht";
  const explicitSlug = Boolean(data.slug);
  let resolvedSlug = data.slug || slugifyCourseText(data.title);
  if (resolvedSlug.length < 2) {
    resolvedSlug = `formation-${Date.now().toString(36).slice(-5)}`;
  }

  const resolvedDescription = data.description ?? data.shortDescription ?? "";
  const resolvedShortDescription =
    data.shortDescription ??
    (resolvedDescription ? resolvedDescription.slice(0, 180) : data.title.slice(0, 180));

  try {
    const db = getAdminDb();

    // Vérifier l'unicité du slug
    const existing = await db.collection("courses").where("slug", "==", resolvedSlug).limit(1).get();
    if (!existing.empty) {
      if (explicitSlug) {
        return NextResponse.json({ error: "Ce slug est déjà utilisé par une autre formation." }, { status: 409 });
      }
      resolvedSlug = `${resolvedSlug.slice(0, 72)}-${Date.now().toString(36).slice(-4)}`;
    }

    const now = FieldValue.serverTimestamp();
    const docRef = db.collection("courses").doc();

    // Toujours créer en brouillon tant qu'aucune leçon n'a été ajoutée
    const initialStatus = "draft";

    // Liste blanche stricte — pas de spread du body
    await docRef.set({
      slug: resolvedSlug,
      title: data.title,
      shortDescription: resolvedShortDescription,
      description: resolvedDescription,
      level,
      language,
      status: initialStatus,
      durationMinutes: data.durationMinutes ?? 0,
      coverUrl: data.coverUrl ?? null,
      priceUSD: data.priceUSD ?? null,
      priceHTG: data.priceHTG ?? null,
      syllabus: [],
      lessonsCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await writeAdminLog(auth.user.uid, "course.create", { type: "course", id: docRef.id }, `Titre: "${data.title}", slug: "${resolvedSlug}"`);

    return NextResponse.json({ id: docRef.id, slug: resolvedSlug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
