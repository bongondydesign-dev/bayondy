"use client";

import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Wrapper autour de fetch() pour les routes /api/admin/*.
 * Ajoute automatiquement le Bearer token Firebase du compte connecté.
 * Gère les erreurs 401/403 proprement.
 *
 * Ne contient aucun import de firebase-admin.
 */
export async function adminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;

  if (!user) {
    // L'utilisateur n'est pas connecté — simuler un 401
    return new Response(JSON.stringify({ error: "Non connecté." }), { status: 401 });
  }

  const sendWithToken = async (forceRefresh: boolean) => {
    const token = await user.getIdToken(forceRefresh);
    const headers = new Headers(options.headers ?? {});
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return fetch(path, { ...options, headers });
  };

  let response = await sendWithToken(false);
  if (response.status === 401) {
    response = await sendWithToken(true);
  }

  if (response.status === 401) {
    console.warn("[adminFetch] 401 — token invalide ou expiré.");
  } else if (response.status === 403) {
    console.warn("[adminFetch] 403 — accès refusé (non admin).");
  }

  return response;
}
