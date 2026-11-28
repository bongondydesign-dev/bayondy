import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, hasAdminCredentials } from "@/lib/firebase-admin";
import { validateProgressPayload } from "@/lib/learning/progress";
import { readJsonBodyWithLimit } from "@/lib/server/requestGuards";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!idToken) {
    return NextResponse.json(
      { error: "Otantifikasyon obligatwa.", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  if (!hasAdminCredentials()) {
    return NextResponse.json(
      { error: "Konfigirasyon sèvè a enkonplè.", code: "SERVER_CONFIG_MISSING" },
      { status: 503 }
    );
  }

  let uid: string;
  let isAdmin = false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken, true);
    uid = decoded.uid;
    isAdmin = decoded.admin === true;
  } catch {
    return NextResponse.json(
      { error: "Sesyon ou a ekspire oswa li pa valid.", code: "INVALID_AUTH_TOKEN" },
      { status: 401 }
    );
  }

  const bodyResult = await readJsonBodyWithLimit(req, 64 * 1024);
  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error, code: bodyResult.code },
      { status: bodyResult.status }
    );
  }

  const validation = validateProgressPayload(bodyResult.data);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error, code: validation.code },
      { status: validation.status }
    );
  }

  const { courseId, progress } = validation.data;
  const db = getAdminDb();

  try {
    const courseSnap = await db.collection("courses").doc(courseId).get();
    if (!courseSnap.exists) {
      return NextResponse.json(
        { error: "Fòmasyon sa a pa egziste.", code: "COURSE_NOT_FOUND" },
        { status: 404 }
      );
    }

    const canonicalId = `${uid}_${courseId}`;
    const canonicalRef = db.collection("enrollments").doc(canonicalId);
    const canonicalSnap = await canonicalRef.get();

    if (canonicalSnap.exists) {
      const data = canonicalSnap.data() as { status?: string; source?: string } | undefined;
      if (data?.status === "active") {
        await canonicalRef.update({ progress });
        return NextResponse.json({
          ok: true,
          enrollmentId: canonicalId,
          progress,
        });
      }

      if (isAdmin) {
        await canonicalRef.update({
          status: "active",
          source: data?.source || "manual",
          progress,
        });
        return NextResponse.json({
          ok: true,
          enrollmentId: canonicalId,
          progress,
        });
      }

      return NextResponse.json(
        { error: "Enskripsyon ou a pa aktif pou fòmasyon sa a.", code: "ENROLLMENT_INACTIVE" },
        { status: 403 }
      );
    }

    // Check if an active enrollment exists under a non-canonical document ID
    const userEnrollments = await db
      .collection("enrollments")
      .where("uid", "==", uid)
      .limit(100)
      .get();

    const matchingDoc = userEnrollments.docs.find((d) => {
      const data = d.data() as { courseId?: string; status?: string };
      return data.courseId === courseId && data.status === "active";
    });

    if (matchingDoc) {
      await matchingDoc.ref.update({ progress });
      return NextResponse.json({
        ok: true,
        enrollmentId: matchingDoc.id,
        progress,
      });
    }

    // Admins have free access to all courses: provision their enrollment doc on first progress save
    if (isAdmin) {
      await canonicalRef.set({
        uid,
        courseId,
        status: "active",
        source: "manual",
        paymentId: null,
        grantedAt: FieldValue.serverTimestamp(),
        progress,
      });

      return NextResponse.json({
        ok: true,
        enrollmentId: canonicalId,
        progress,
      });
    }

    return NextResponse.json(
      { error: "Ou pa enskri nan fòmasyon sa a.", code: "ENROLLMENT_REQUIRED" },
      { status: 403 }
    );
  } catch (err) {
    console.error("[/api/learning/progress POST error]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Erè sèvè pandan anrejistreman pwogrè a.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
