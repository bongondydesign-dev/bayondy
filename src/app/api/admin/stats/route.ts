import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const db = getAdminDb();

  try {
    // Formations : published vs draft
    const coursesSnap = await db.collection("courses").get();
    let publishedCourses = 0;
    let draftCourses = 0;
    for (const doc of coursesSnap.docs) {
      const status = doc.data().status;
      if (status === "published") publishedCourses++;
      else draftCourses++;
    }

    // Inscriptions actives + élèves uniques inscrits
    const enrollSnap = await db
      .collection("enrollments")
      .where("status", "==", "active")
      .get();
    const activeEnrollments = enrollSnap.size;
    const uniqueStudents = new Set(enrollSnap.docs.map((d) => d.data().uid as string)).size;

    // Paiements par statut
    const paymentsSnap = await db.collection("payments").get();
    const paymentsByStatus: Record<string, number> = {};
    for (const doc of paymentsSnap.docs) {
      const s = (doc.data().status as string) ?? "unknown";
      paymentsByStatus[s] = (paymentsByStatus[s] ?? 0) + 1;
    }

    return NextResponse.json({
      courses: { published: publishedCourses, draft: draftCourses },
      enrollments: { active: activeEnrollments },
      students: { unique: uniqueStudents },
      payments: paymentsByStatus,
    });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
