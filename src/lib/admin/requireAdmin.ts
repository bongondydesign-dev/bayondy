// server-only — ce fichier ne doit jamais être importé côté client.
import "server-only";

import { getAdminAuth } from "@/lib/firebase-admin";
import type { NextRequest } from "next/server";

export interface AdminUser {
  uid: string;
}

/**
 * Vérifie que la requête contient un Bearer token valide avec le claim admin.
 * Doit être appelé EN PREMIER dans chaque route API admin.
 *
 * - Pas de token          → 401
 * - Token invalide/révoqué → 401
 * - Token valide sans admin → 403
 * - Token valide + admin   → { uid } (succès)
 *
 * Aucun détail interne ne fuite dans les messages d'erreur.
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
      response: new Response(JSON.stringify({ error: "Authentifikasyon obligatwa." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  try {
    const adminAuth = getAdminAuth();
    // checkRevoked = true : vérifie la révocation côté Firebase
    const decoded = await adminAuth.verifyIdToken(token, true);

    if (decoded.admin !== true) {
      return {
        ok: false,
        response: new Response(JSON.stringify({ error: "Aksè refize." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }

    return { ok: true, user: { uid: decoded.uid } };
  } catch {
    // Jeton invalide, expiré ou révoqué — pas de détail interne
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Authentifikasyon obligatwa." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
}
