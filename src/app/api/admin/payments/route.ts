import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { getAdminDb } from "@/lib/firebase-admin";

// GET /api/admin/payments?limit=50&startAfter=<docId>
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const db = getAdminDb();
  const url = new URL(req.url);
  const pageSize = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 50);
  const startAfter = url.searchParams.get("startAfter") ?? null;

  try {
    let query = db.collection("payments").orderBy("createdAt", "desc").limit(pageSize);

    if (startAfter) {
      const cursorDoc = await db.collection("payments").doc(startAfter).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snap = await query.get();

    const payments = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        uid: d.uid ?? "",
        courseId: d.courseId ?? "",
        amount: d.amount ?? 0,
        currency: d.currency ?? "",
        method: d.method ?? "",
        status: d.status ?? "",
        merchantReference: d.merchantReference ?? "",
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        paidAt: d.paidAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    const nextCursor =
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null;

    return NextResponse.json({ payments, nextCursor });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
