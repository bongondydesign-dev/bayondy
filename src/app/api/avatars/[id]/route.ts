import { NextRequest, NextResponse } from "next/server";
import { isValidAvatarId } from "@/lib/auth/avatar";
import { getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ALLOWED_RESPONSE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function toUint8Array(value: unknown): Uint8Array | null {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (typeof value === "string" && value.length > 0) {
    return new Uint8Array(Buffer.from(value, "base64"));
  }
  return null;
}

// GET /api/avatars/[id] — sert la photo de profil stockée côté serveur
export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  if (!isValidAvatarId(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!hasAdminCredentials()) {
    return new NextResponse("Service unavailable", { status: 503 });
  }

  try {
    const db = getAdminDb();
    const doc = await db.collection("userAvatars").doc(id).get();
    if (!doc.exists) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = doc.data();
    const mimeType =
      typeof data?.mimeType === "string" && ALLOWED_RESPONSE_MIME.has(data.mimeType)
        ? data.mimeType
        : "image/webp";

    const bytes = toUint8Array(data?.bytes);
    if (!bytes || bytes.byteLength === 0) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[avatars GET]", err instanceof Error ? err.message : err);
    return new NextResponse("Server error", { status: 500 });
  }
}
