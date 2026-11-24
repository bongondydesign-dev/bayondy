import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function hasFirebaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  // Vérification des variables manquantes (uniquement côté client et en développement)
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    (!apiKey || !authDomain || !projectId || !appId)
  ) {
    const missing = [
      !apiKey && "NEXT_PUBLIC_FIREBASE_API_KEY",
      !authDomain && "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      !projectId && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      !appId && "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]
      .filter(Boolean)
      .join(", ");
    console.warn(
      `[Firebase Config Warning] Variab anviwònman sa yo manke nan .env.local : ${missing}`
    );
  }

  const firebaseConfig = {
    apiKey: apiKey ?? "",
    authDomain: authDomain ?? "",
    projectId: projectId ?? "",
    appId: appId ?? "",
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
