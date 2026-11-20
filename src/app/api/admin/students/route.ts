import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getAdminDb } from "@/lib/firebase-admin";

// GET /api/admin/students?limit=50&startAfter=<docId>
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const db = getAdminDb();
  const url = new URL(req.url);
  const pageSize = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 50);
  const startAfter = url.searchParams.get("startAfter") ?? null;

  try {
    // Liste des utilisateurs
    let query = db.collection("users").orderBy("createdAt", "desc").limit(pageSize);
    if (startAfter) {
      const cursorDoc = await db.collection("users").doc(startAfter).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const usersSnap = await query.get();
    const userIds = usersSnap.docs.map((d) => d.id);

    // Inscriptions actives pour chaque utilisateur
    // Firestore "in" supporte jusqu'à 30 éléments par requête
    const enrollmentsByUid: Record<string, { courseId: string; status: string }[]> = {};
    if (userIds.length > 0) {
      const chunks: string[][] = [];
      for (let i = 0; i < userIds.length; i += 30) {
        chunks.push(userIds.slice(i, i + 30));
      }
      for (const chunk of chunks) {
        const enrollSnap = await db
          .collection("enrollments")
          .where("uid", "in", chunk)
          .get();
        for (const doc of enrollSnap.docs) {
          const uid = doc.data().uid as string;
          if (!enrollmentsByUid[uid]) enrollmentsByUid[uid] = [];
          enrollmentsByUid[uid].push({
            courseId: doc.data().courseId as string,
            status: doc.data().status as string,
          });
        }
      }
    }

    const students = usersSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        uid: doc.id,
        displayName: d.displayName ?? "",
        email: d.email ?? "",
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        enrollments: enrollmentsByUid[doc.id] ?? [],
      };
    });

    const nextCursor =
      usersSnap.docs.length === pageSize
        ? usersSnap.docs[usersSnap.docs.length - 1].id
        : null;

    return NextResponse.json({ students, nextCursor });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
