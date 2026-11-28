import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { buildAdminPaymentOverview, type RawAdminPaymentRecord } from "@/lib/admin/stats";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: "Konfigirasyon sèvè a enkonplè." }, { status: 503 });
  }

  try {
    const db = getAdminDb();
    // Formations : projection légère + limite bornée
    const coursesSnap = await db
      .collection("courses")
      .select("status", "title")
      .limit(500)
      .get();
    let publishedCourses = 0;
    let draftCourses = 0;
    const courseTitles = new Map<string, string>();
    for (const doc of coursesSnap.docs) {
      const data = doc.data();
      const status = data.status;
      if (status === "published") publishedCourses++;
      else draftCourses++;
      if (typeof data.title === "string" && data.title.trim()) {
        courseTitles.set(doc.id, data.title.trim());
      }
    }

    // Inscriptions actives via count() agrégé + échantillon borné des uid pour déduplication
    const activeEnrollmentsQuery = db
      .collection("enrollments")
      .where("status", "==", "active");

    const [enrollCountSnap, enrollUidSnap, paymentsSnap] = await Promise.all([
      activeEnrollmentsQuery.count().get(),
      activeEnrollmentsQuery.select("uid").limit(2000).get(),
      db
        .collection("payments")
        .select(
          "courseId",
          "amount",
          "currency",
          "method",
          "status",
          "merchantReference",
          "createdAt"
        )
        .limit(1000)
        .get(),
    ]);

    const activeEnrollments = enrollCountSnap.data().count;
    const uniqueStudents = new Set(enrollUidSnap.docs.map((d) => d.data().uid as string)).size;

    // Paiements : statuts, revenus, activité sur 6 mois et transactions récentes
    const paymentRecords: RawAdminPaymentRecord[] = paymentsSnap.docs.map((doc) => {
      const d = doc.data();
      const courseId = typeof d.courseId === "string" ? d.courseId : "";
      return {
        id: doc.id,
        courseId,
        courseTitle: courseTitles.get(courseId),
        amount: typeof d.amount === "number" ? d.amount : Number(d.amount) || 0,
        currency: typeof d.currency === "string" ? d.currency : "",
        method: typeof d.method === "string" ? d.method : "",
        status: typeof d.status === "string" ? d.status : "unknown",
        merchantReference: typeof d.merchantReference === "string" ? d.merchantReference : "",
        createdAtIso: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });

    const overview = buildAdminPaymentOverview(paymentRecords);

    return NextResponse.json({
      courses: { published: publishedCourses, draft: draftCourses },
      enrollments: { active: activeEnrollments },
      students: { unique: uniqueStudents },
      payments: overview.paymentsByStatus,
      revenue: overview.revenue,
      monthlyActivity: overview.monthlyActivity,
      recentPayments: overview.recentPayments,
    });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
