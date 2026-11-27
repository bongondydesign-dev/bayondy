import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminLog } from "@/lib/admin/adminLog";
import { validateCourseInput } from "@/lib/admin/validation";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import { revalidateCoursesCache } from "@/lib/courses/revalidate";
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
    const snap = await db.collection("courses").orderBy("createdAt", "desc").get();
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
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });
    return NextResponse.json({ courses });
  } catch (err) {
    console.error("[admin/courses GET]", err instanceof Error ? err.message : err);
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

  // Champs obligatoires à la création
  if (!data.title || !data.shortDescription || !data.description || !data.level || !data.language || !data.slug) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants: title, shortDescription, description, level, language, slug." },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();

    // Vérifier l'unicité du slug
    const existing = await db.collection("courses").where("slug", "==", data.slug).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé par une autre formation." }, { status: 409 });
    }

    const now = FieldValue.serverTimestamp();
    const docRef = db.collection("courses").doc();

    // Liste blanche stricte — pas de spread du body
    await docRef.set({
      slug: data.slug,
      title: data.title,
      shortDescription: data.shortDescription,
      description: data.description,
      level: data.level,
      language: data.language,
      status: data.status ?? "draft",
      durationMinutes: data.durationMinutes ?? 0,
      coverUrl: data.coverUrl ?? null,
      priceUSD: data.priceUSD ?? null,
      priceHTG: data.priceHTG ?? null,
      syllabus: [],
      lessonsCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await writeAdminLog(auth.user.uid, "course.create", { type: "course", id: docRef.id }, `Titre: "${data.title}", slug: "${data.slug}"`);

    if ((data.status ?? "draft") === "published") {
      revalidateCoursesCache(data.slug);
    }

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
