// server-only — ce fichier ne doit jamais être importé côté client.
import "server-only";

import { getAdminAuth, hasAdminCredentials } from "@/lib/firebase-admin";
import type { NextRequest } from "next/server";

export interface AdminUser {
  uid: string;
}

/**
 * Vérifie que la requête contient un Bearer token valide avec le claim admin.
 * Doit être appelé EN PREMIER dans chaque route API admin.
 *
 * - Config Firebase Admin absente/invalide → 503
 * - Pas de token                           → 401
 * - Token invalide/révoqué                 → 401
 * - Token valide sans admin                → 403
 * - Token valide + admin                   → { uid } (succès)
 */
export async function requireAdmin(
  req: NextRequest
): Promise<{ ok: true; user: AdminUser } | { ok: false; response: Response }> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Authentifikasyon obligatwa.", code: "MISSING_TOKEN" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  if (!hasAdminCredentials()) {
    console.error("[requireAdmin] Missing FIREBASE_ADMIN_* environment variables.");
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          error: "Konfigirasyon Firebase Admin sèvè a enkonplè (FIREBASE_ADMIN_*).",
          code: "SERVER_CONFIG_MISSING",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }

  let adminAuth;
  try {
    adminAuth = getAdminAuth();
  } catch (err) {
    console.error(
      "[requireAdmin] Firebase Admin init error:",
      err instanceof Error ? err.message : err
    );
    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          error: "Kle prive Firebase Admin la pa valid sou sèvè a.",
          code: "SERVER_CONFIG_INVALID",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }

  try {
    // checkRevoked = true : vérifie la révocation côté Firebase
    const decoded = await adminAuth.verifyIdToken(token, true);

    if (decoded.admin !== true) {
      return {
        ok: false,
        response: new Response(JSON.stringify({ error: "Aksè refize.", code: "ADMIN_REQUIRED" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }

    return { ok: true, user: { uid: decoded.uid } };
  } catch (err) {
    const code = (err as { code?: string })?.code ?? "unknown";
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[requireAdmin] verifyIdToken failed:", code, msg);

    if (
      code === "app/invalid-credential" ||
      msg.includes("invalid-credential") ||
      msg.includes("OAuth2 access token") ||
      msg.includes("private key")
    ) {
      return {
        ok: false,
        response: new Response(
          JSON.stringify({
            error: "Kle sèvè Firebase Admin la pa valid oswa pa gen pèmisyon.",
            code: "SERVER_CREDENTIAL_ERROR",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        ),
      };
    }

    return {
      ok: false,
      response: new Response(
        JSON.stringify({
          error: "Sesyon admin lan ekspire oswa li pa valid. Dekonekte epi rekonekte.",
          code: "INVALID_TOKEN",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }
}
