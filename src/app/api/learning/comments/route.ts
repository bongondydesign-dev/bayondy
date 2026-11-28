import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type Firestore, type Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import {
  isValidSafeResourceId,
  normalizeCommentItem,
  sanitizeAuthorName,
  sanitizeAuthorPhotoURL,
  sortLessonComments,
  validateCommentCreateInput,
  validateCommentDeleteInput,
  type LessonCommentItem,
} from "@/lib/learning/comments";
import { readJsonBodyWithLimit } from "@/lib/server/requestGuards";

interface VerifiedCaller {
  uid: string;
  isAdmin: boolean;
  name?: string;
  email?: string;
  picture?: string;
}

async function authenticateCaller(
  req: NextRequest
): Promise<
  | { ok: true; caller: VerifiedCaller }
  | { ok: false; response: NextResponse }
> {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

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
        isAdmin: decoded.admin === true,
        name: typeof decoded.name === "string" ? decoded.name : undefined,
        email: typeof decoded.email === "string" ? decoded.email : undefined,
        picture: typeof decoded.picture === "string" ? decoded.picture : undefined,
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

async function hasActiveCourseAccess(
  db: Firestore,
  uid: string,
  courseId: string,
  isAdmin: boolean
): Promise<boolean> {
  if (isAdmin) return true;

  const canonicalSnap = await db.collection("enrollments").doc(`${uid}_${courseId}`).get();
  if (canonicalSnap.exists) {
    const data = canonicalSnap.data() as { status?: string } | undefined;
    if (data?.status === "active") return true;
  }

  const userEnrollments = await db
    .collection("enrollments")
    .where("uid", "==", uid)
    .limit(100)
    .get();

  return userEnrollments.docs.some((d) => {
    const data = d.data() as { courseId?: string; status?: string };
    return data.courseId === courseId && data.status === "active";
  });
}

function timestampToMs(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value) {
    const fn = (value as Timestamp).toMillis;
    if (typeof fn === "function") return fn.call(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
}

export async function GET(req: NextRequest) {
  const authResult = await authenticateCaller(req);
  if (!authResult.ok) return authResult.response;

  const { caller } = authResult;
  const courseId = req.nextUrl.searchParams.get("courseId")?.trim() ?? "";
  const lessonId = req.nextUrl.searchParams.get("lessonId")?.trim() ?? "";

  if (!isValidSafeResourceId(courseId) || !isValidSafeResourceId(lessonId)) {
    return NextResponse.json(
      { error: "courseId ak lessonId obligatwa.", code: "INVALID_PARAMS" },
      { status: 400 }
    );
  }

  const db = getAdminDb();

  try {
    const allowed = await hasActiveCourseAccess(db, caller.uid, courseId, caller.isAdmin);
    if (!allowed) {
      return NextResponse.json(
        { error: "Ou pa gen aksè ak kòmantè fòmasyon sa a.", code: "ENROLLMENT_REQUIRED" },
        { status: 403 }
      );
    }

    const snap = await db
      .collection("lessonComments")
      .where("lessonId", "==", lessonId)
      .limit(200)
      .get();

    const mapped: LessonCommentItem[] = snap.docs
      .filter((d) => {
        const data = d.data() as { courseId?: string };
        return data.courseId === courseId;
      })
      .map((d) => {
        const data = d.data() as Record<string, unknown>;
        return normalizeCommentItem({
          id: d.id,
          courseId: typeof data.courseId === "string" ? data.courseId : courseId,
          lessonId: typeof data.lessonId === "string" ? data.lessonId : lessonId,
          uid: typeof data.uid === "string" ? data.uid : "",
          authorName: typeof data.authorName === "string" ? data.authorName : undefined,
          authorPhotoURL: typeof data.authorPhotoURL === "string" ? data.authorPhotoURL : null,
          authorIsAdmin: data.authorIsAdmin === true,
          content: typeof data.content === "string" ? data.content : "",
          createdAtMs: timestampToMs(data.createdAt),
        });
      })
      .filter((item) => item.content.length > 0);

    return NextResponse.json({
      ok: true,
      comments: sortLessonComments(mapped),
    });
  } catch (err) {
    console.error("[/api/learning/comments GET error]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Erè sèvè pandan chajman kòmantè yo.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateCaller(req);
  if (!authResult.ok) return authResult.response;

  const { caller } = authResult;

  const bodyResult = await readJsonBodyWithLimit(req, 32 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error, code: bodyResult.code },
      { status: bodyResult.status }
    );
  }

  const validation = validateCommentCreateInput(bodyResult.data);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error, code: validation.code },
      { status: validation.status }
    );
  }

  const { courseId, lessonId, content } = validation.data;
  const db = getAdminDb();

  try {
    const allowed = await hasActiveCourseAccess(db, caller.uid, courseId, caller.isAdmin);
    if (!allowed) {
      return NextResponse.json(
        { error: "Ou pa enskri nan fòmasyon sa a.", code: "ENROLLMENT_REQUIRED" },
        { status: 403 }
      );
    }

    const [courseSnap, lessonSnap, userSnap] = await Promise.all([
      db.collection("courses").doc(courseId).get(),
      db.collection("lessons").doc(lessonId).get(),
      db.collection("users").doc(caller.uid).get(),
    ]);

    if (!courseSnap.exists) {
      return NextResponse.json(
        { error: "Fòmasyon sa a pa egziste.", code: "COURSE_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!lessonSnap.exists) {
      return NextResponse.json(
        { error: "Leson sa a pa egziste.", code: "LESSON_NOT_FOUND" },
        { status: 404 }
      );
    }

    const lessonData = lessonSnap.data() as { courseId?: string; archived?: boolean } | undefined;
    if (lessonData?.courseId !== courseId || (lessonData?.archived === true && !caller.isAdmin)) {
      return NextResponse.json(
        { error: "Leson sa a pa disponib pou kòmantè.", code: "LESSON_UNAVAILABLE" },
        { status: 404 }
      );
    }

    const userData = userSnap.exists
      ? (userSnap.data() as { displayName?: string; photoURL?: string | null } | undefined)
      : undefined;

    const emailFallback = caller.email ? caller.email.split("@")[0] : undefined;
    const authorName = sanitizeAuthorName(
      userData?.displayName || caller.name || emailFallback,
      "Élève"
    );
    const authorPhotoURL = sanitizeAuthorPhotoURL(userData?.photoURL ?? caller.picture ?? null);

    const nowMs = Date.now();
    const docRef = await db.collection("lessonComments").add({
      courseId,
      lessonId,
      uid: caller.uid,
      authorName,
      authorPhotoURL,
      authorIsAdmin: caller.isAdmin,
      content,
      createdAt: FieldValue.serverTimestamp(),
    });

    const comment: LessonCommentItem = {
      id: docRef.id,
      courseId,
      lessonId,
      uid: caller.uid,
      authorName,
      authorPhotoURL,
      authorIsAdmin: caller.isAdmin,
      content,
      createdAtMs: nowMs,
    };

    return NextResponse.json({ ok: true, comment }, { status: 201 });
  } catch (err) {
    console.error("[/api/learning/comments POST error]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Erè sèvè pandan piblikasyon kòmantè a.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await authenticateCaller(req);
  if (!authResult.ok) return authResult.response;

  const { caller } = authResult;
  if (!caller.isAdmin) {
    return NextResponse.json(
      { error: "Se administratè sèlman ki ka efase kòmantè.", code: "ADMIN_REQUIRED" },
      { status: 403 }
    );
  }

  let rawInput: unknown = req.nextUrl.searchParams.get("commentId");
  if (!rawInput) {
    const bodyResult = await readJsonBodyWithLimit(req, 16 * 1024);
    if (!bodyResult.ok) {
      return NextResponse.json(
        { error: bodyResult.error, code: bodyResult.code },
        { status: bodyResult.status }
      );
    }
    rawInput = bodyResult.data;
  }

  const validation = validateCommentDeleteInput(rawInput);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error, code: validation.code },
      { status: validation.status }
    );
  }

  const { commentId } = validation.data;
  const db = getAdminDb();

  try {
    const commentRef = db.collection("lessonComments").doc(commentId);
    const snap = await commentRef.get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "Kòmantè sa a pa egziste ankò.", code: "COMMENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    await commentRef.delete();

    return NextResponse.json({ ok: true, commentId });
  } catch (err) {
    console.error("[/api/learning/comments DELETE error]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Erè sèvè pandan sipresyon kòmantè a.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
