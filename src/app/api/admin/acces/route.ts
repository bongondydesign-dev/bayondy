import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminLog } from "@/lib/admin/adminLog";
import { isValidCourseDocId } from "@/lib/admin/courseDeletion";
import { getAdminDb, getAdminAuth, hasAdminCredentials } from "@/lib/firebase-admin";
import { readJsonBodyWithLimit } from "@/lib/server/requestGuards";
import { FieldValue } from "firebase-admin/firestore";
import { SITE_NAME } from "@/lib/site";

// POST /api/admin/acces — donne ou retire l'accès à une formation
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

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  // Validation stricte — champs connus uniquement
  const email = typeof b.email === "string" ? b.email.trim() : null;
  const courseId = typeof b.courseId === "string" ? b.courseId.trim() : null;
  const action = b.action;

  if (!email || email.length === 0 || email.length > 320 || !email.includes("@")) {
    return NextResponse.json({ error: "email: adresse valide requise." }, { status: 400 });
  }
  if (!isValidCourseDocId(courseId)) {
    return NextResponse.json({ error: "courseId: identifiant invalide." }, { status: 400 });
  }
  if (action !== "grant" && action !== "revoke") {
    return NextResponse.json({ error: 'action: "grant" ou "revoke" requis.' }, { status: 400 });
  }

  const adminAuth = getAdminAuth();
  const db = getAdminDb();

  // Résolution email → uid
  let targetUid: string;
  try {
    const userRecord = await adminAuth.getUserByEmail(email);
    targetUid = userRecord.uid;
  } catch {
    return NextResponse.json(
      { error: `Okenn kont jwenn pou imèl sa a. Verifye ke li gen yon kont ${SITE_NAME}.` },
      { status: 404 }
    );
  }

  // Vérifier que le cours existe
  const courseDoc = await db.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) {
    return NextResponse.json({ error: "Formation introuvable." }, { status: 404 });
  }

  const enrollmentId = `${targetUid}_${courseId}`;
  const enrollmentRef = db.collection("enrollments").doc(enrollmentId);

  try {
    if (action === "grant") {
      const existing = await enrollmentRef.get();

      if (existing.exists) {
        // Mise à jour idempotente : status → active, conserve progress existant
        await enrollmentRef.update({
          status: "active",
          source: "manual",
          grantedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // Nouvelle inscription — progress vide
        await enrollmentRef.set({
          uid: targetUid,
          courseId,
          status: "active",
          source: "manual",
          paymentId: null,
          grantedAt: FieldValue.serverTimestamp(),
          progress: {
            completedLessonIds: [],
            lastLessonId: "",
          },
        });
      }

      await writeAdminLog(
        auth.user.uid,
        "access.grant",
        { type: "enrollment", id: enrollmentId },
        `Aksè bay pou kont ${targetUid} nan kou ${courseId}`
      );

      return NextResponse.json({ ok: true, action: "grant", enrollmentId });
    } else {
      // Révocation — status → revoked, progress inchangé
      const existing = await enrollmentRef.get();
      if (!existing.exists) {
        return NextResponse.json({ ok: true, action: "revoke", note: "Enskripsyon pa t egziste." });
      }

      await enrollmentRef.update({ status: "revoked" });

      await writeAdminLog(
        auth.user.uid,
        "access.revoke",
        { type: "enrollment", id: enrollmentId },
        `Aksè retire pou kont ${targetUid} nan kou ${courseId}`
      );

      return NextResponse.json({ ok: true, action: "revoke", enrollmentId });
    }
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
