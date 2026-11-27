// server-only — ce fichier ne doit jamais être importé côté client.
// Next.js App Router empêche cela via le marqueur ci-dessous.
import "server-only";

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let _adminApp: App | null = null;
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

function cleanEnvValue(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
}

export function hasAdminCredentials(): boolean {
  return Boolean(
    cleanEnvValue(process.env.FIREBASE_ADMIN_PROJECT_ID) &&
    cleanEnvValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL) &&
    cleanEnvValue(process.env.FIREBASE_ADMIN_PRIVATE_KEY)
  );
}

function getAdminApp(): App {
  if (_adminApp) return _adminApp;
  if (getApps().length > 0) {
    _adminApp = getApp();
    return _adminApp;
  }

  const projectId = cleanEnvValue(process.env.FIREBASE_ADMIN_PROJECT_ID);
  const clientEmail = cleanEnvValue(process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  const rawPrivateKey = cleanEnvValue(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  if (!projectId || !clientEmail || !rawPrivateKey) {
    const missing = [
      !projectId && "FIREBASE_ADMIN_PROJECT_ID",
      !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
      !rawPrivateKey && "FIREBASE_ADMIN_PRIVATE_KEY",
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `[firebase-admin] Variab anviwònman sèvè sa yo manke nan .env.local : ${missing}. ` +
      `Tanpri ajoute yo pou pèmèt operasyon sèvè yo.`
    );
  }

  // La clé privée peut contenir des \n échappés — on les remplace par de vrais sauts de ligne
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  _adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
  return _adminApp;
}

export function getAdminAuth(): Auth {
  if (_adminAuth) return _adminAuth;
  _adminAuth = getAuth(getAdminApp());
  return _adminAuth;
}

export function getAdminDb(): Firestore {
  if (_adminDb) return _adminDb;
  _adminDb = getFirestore(getAdminApp());
  return _adminDb;
}

// Getters paresseux pour compatibilité avec les imports directs (ex: adminDb.collection(...))
export const adminApp = {
  get name() {
    return getAdminApp().name;
  },
};

export const adminAuth = {
  getUser: (uid: string) => getAdminAuth().getUser(uid),
  setCustomUserClaims: (uid: string, claims: object | null) =>
    getAdminAuth().setCustomUserClaims(uid, claims),
};

export const adminDb = {
  collection: (collectionPath: string) => getAdminDb().collection(collectionPath),
  doc: (documentPath: string) => getAdminDb().doc(documentPath),
};
