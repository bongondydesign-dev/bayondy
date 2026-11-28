import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { parseCoverDataUrl } from "@/lib/admin/cover";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  MAX_COVER_JSON_BODY_BYTES,
  readJsonBodyWithLimit,
} from "@/lib/server/requestGuards";

// POST /api/admin/covers — téléverse une image de couverture (admin uniquement)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  if (!hasAdminCredentials()) {
    return NextResponse.json(
      { error: "Konfigirasyon sèvè a enkonplè." },
      { status: 503 }
    );
  }

  const bodyResult = await readJsonBodyWithLimit(req, MAX_COVER_JSON_BODY_BYTES);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }
  const body = bodyResult.data;

  const rawDataUrl =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).dataUrl
      : undefined;

  const parsed = parseCoverDataUrl(rawDataUrl);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const docRef = db.collection("courseCovers").doc();

    await docRef.set({
      mimeType: parsed.mimeType,
      bytes: parsed.buffer,
      sizeBytes: parsed.buffer.byteLength,
      uploadedBy: auth.user.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        id: docRef.id,
        url: `/api/covers/${docRef.id}`,
        sizeBytes: parsed.buffer.byteLength,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Erè sèvè." }, { status: 500 });
  }
}
