import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  MAX_AVATAR_JSON_BODY_BYTES,
  parseAvatarDataUrl,
} from "@/lib/auth/avatar";
import {
  checkFirestoreUidRateLimit,
  readJsonBodyWithLimit,
} from "@/lib/server/requestGuards";

interface AuthenticatedCaller {
  uid: string;
  email: string;
  name: string;
}

async function authenticateCaller(
  req: NextRequest
): Promise<
  | { ok: true; caller: AuthenticatedCaller }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!idToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Otantifikasyon obligatwa.", code: "AUTH_REQUIRED" },
        { status: 401 }
      ),
    };
  }

  if (!hasAdminCredentials()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Konfigirasyon sèvè a enkonplè.", code: "SERVER_CONFIG_MISSING" },
        { status: 503 }
      ),
    };
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken, true);
    return {
      ok: true,
      caller: {
        uid: decoded.uid,
        email: typeof decoded.email === "string" ? decoded.email : "",
        name: typeof decoded.name === "string" ? decoded.name : "",
      },
    };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sesyon ou a ekspire oswa li pa valid.", code: "INVALID_AUTH_TOKEN" },
        { status: 401 }
      ),
    };
  }
}

async function deletePreviousUserAvatars(
  db: FirebaseFirestore.Firestore,
  uid: string,
  keepId?: string
): Promise<void> {
  try {
    const snap = await db
      .collection("userAvatars")
      .where("uid", "==", uid)
      .limit(20)
      .get();

    const deletions = snap.docs
      .filter((d) => d.id !== keepId)
      .map((d) => d.ref.delete());

    if (deletions.length > 0) {
      await Promise.allSettled(deletions);
    }
  } catch {
    // Cleanup best-effort only
  }
}

// POST /api/profile/avatar — téléverse la photo de profil de l'utilisateur connecté
export async function POST(req: NextRequest) {
  const auth = await authenticateCaller(req);
  if (!auth.ok) return auth.response;

  const db = getAdminDb();

  const allowed = await checkFirestoreUidRateLimit({
    db,
    scope: "avatar_upload",
    uid: auth.caller.uid,
    maxRequests: 15,
    windowSeconds: 3600,
  });

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Twòp chanjman foto nan yon ti tan. Eseye ankò talè.",
        code: "RATE_LIMITED",
      },
      { status: 429 }
    );
  }

  const bodyResult = await readJsonBodyWithLimit(req, MAX_AVATAR_JSON_BODY_BYTES);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error, code: bodyResult.code },
      { status: bodyResult.status }
    );
  }

  const rawDataUrl =
    typeof bodyResult.data === "object" && bodyResult.data !== null
      ? (bodyResult.data as Record<string, unknown>).dataUrl
      : undefined;

  const parsed = parseAvatarDataUrl(rawDataUrl);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, code: "INVALID_AVATAR" },
      { status: 400 }
    );
  }

  try {
    const avatarRef = db.collection("userAvatars").doc();
    const photoURL = `/api/avatars/${avatarRef.id}`;

    await avatarRef.set({
      uid: auth.caller.uid,
      mimeType: parsed.mimeType,
      bytes: parsed.buffer,
      sizeBytes: parsed.buffer.byteLength,
      createdAt: FieldValue.serverTimestamp(),
    });

    const userRef = db.collection("users").doc(auth.caller.uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      await userRef.update({ photoURL });
    } else {
      await userRef.set({
        displayName: auth.caller.name,
        email: auth.caller.email,
        photoURL,
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      });
    }

    await deletePreviousUserAvatars(db, auth.caller.uid, avatarRef.id);

    return NextResponse.json(
      {
        ok: true,
        id: avatarRef.id,
        photoURL,
        sizeBytes: parsed.buffer.byteLength,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/profile/avatar POST error]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Erè sèvè pandan anrejistreman foto a.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/avatar — supprime la photo de profil personnalisée
export async function DELETE(req: NextRequest) {
  const auth = await authenticateCaller(req);
  if (!auth.ok) return auth.response;

  const db = getAdminDb();

  try {
    const userRef = db.collection("users").doc(auth.caller.uid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      await userRef.update({ photoURL: null });
    }

    await deletePreviousUserAvatars(db, auth.caller.uid);

    return NextResponse.json({
      ok: true,
      photoURL: null,
    });
  } catch (err) {
    console.error("[/api/profile/avatar DELETE error]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Erè sèvè pandan sipresyon foto a.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
