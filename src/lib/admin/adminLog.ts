// server-only — journalisation des actions admin, côté serveur uniquement.
import "server-only";

import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export type AdminAction =
  | "course.create"
  | "course.update"
  | "course.publish"
  | "course.unpublish"
  | "course.delete"
  | "lesson.create"
  | "lesson.update"
  | "lesson.archive"
  | "access.grant"
  | "access.revoke";

interface LogTarget {
  type: "course" | "lesson" | "enrollment";
  id: string;
}

/**
 * Écrit une ligne dans adminLogs (collection Firestore server-side uniquement).
 * Ne contient jamais de youtubeVideoId ni de données personnelles inutiles.
 * Échec silencieux : on ne bloque pas l'action principale si le log rate.
 */
export async function writeAdminLog(
  adminUid: string,
  action: AdminAction,
  target: LogTarget,
  summary: string
): Promise<void> {
  try {
    const db = getAdminDb();
    await db.collection("adminLogs").add({
      adminUid,
      action,
      target,
      summary,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // Log d'audit en échec : on continue sans bloquer l'opération principale
    if (process.env.NODE_ENV === "development") {
      console.warn("[adminLog] Echec écriture log admin:", err);
    }
  }
}
