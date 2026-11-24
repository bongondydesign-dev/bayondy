// server-only — vérification du jeton d'authentification Firebase pour les élèves
import "server-only";
import { getAdminAuth } from "@/lib/firebase-admin";
import type { NextRequest } from "next/server";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  displayName?: string;
}

/**
 * Vérifie que la requête contient un Bearer token Firebase valide.
 * Utilisé pour sécuriser les routes API réservées aux élèves connectés.
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ ok: true; user: AuthenticatedUser } | { ok: false; response: Response }> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: "Ou dwe konekte pou w ka fè aksyon sa a." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token, true);

    return {
      ok: true,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name,
      },
    };
  } catch {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: "Sesyon an ekspire oswa li envalid. Tanpri rekonekte w." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }
}
