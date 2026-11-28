import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { writeAdminLog } from "@/lib/admin/adminLog";
import { chunkArray, validateClearPaymentsBody } from "@/lib/admin/paymentDeletion";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";

// GET /api/admin/payments?limit=50&startAfter=<docId>
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: "Konfigirasyon sèvè a enkonplè." }, { status: 503 });
  }

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

// DELETE /api/admin/payments — efase tout istwa tranzaksyon yo (admin sèlman)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: "Konfigirasyon sèvè a enkonplè." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Kò JSON an pa valid." }, { status: 400 });
  }

  const validation = validateClearPaymentsBody(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("payments").select().get();

    if (snap.empty) {
      return NextResponse.json({ ok: true, deletedCount: 0 });
    }

    const refs = snap.docs.map((doc) => doc.ref);
    for (const batchRefs of chunkArray(refs, 450)) {
      const batch = db.batch();
      for (const ref of batchRefs) {
        batch.delete(ref);
      }
      await batch.commit();
    }

    await writeAdminLog(
      auth.user.uid,
      "payments.clear",
      { type: "payment", id: "all" },
      `Historique des transactions supprimé (${snap.size} transaction(s))`
    );

    return NextResponse.json({ ok: true, deletedCount: snap.size });
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
