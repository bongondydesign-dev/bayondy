import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getMissingFirebaseEnvVars(): string[] {
  const missing: string[] = [];
  if (!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "").trim()) {
    missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "").trim()) {
    missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  }
  if (!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim()) {
    missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }
  return missing;
}

export function hasFirebaseConfig(): boolean {
  return getMissingFirebaseEnvVars().length === 0;
}

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;

  const apiKey = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "").trim();
  const authDomain = (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "").trim();
  const projectId = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim();
  const appId = (process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "").trim();

  // Vérification des variables manquantes (uniquement côté client et en développement)
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    (!apiKey || !authDomain || !projectId)
  ) {
    const missing = getMissingFirebaseEnvVars().join(", ");
    console.warn(
      `[Firebase Config Warning] Variab anviwònman sa yo manke nan .env.local : ${missing}`
    );
  }

  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    ...(appId ? { appId } : {}),
  };

  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

/**
 * Fabrique paresseuse pour Firestore — jamais exécutée côté serveur.
 * À utiliser uniquement dans des composants "use client" ou des hooks client.
 */
export function getFirebaseDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

// Export de compatibilité — utilisé dans AuthProvider
export { getFirebaseApp as getApp };
