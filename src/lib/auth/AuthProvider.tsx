"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseDb,
  getMissingFirebaseEnvVars,
  hasFirebaseConfig,
} from "@/lib/firebase/client";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (nom: string, email: string, motDePasse: string) => Promise<void>;
  signInWithEmail: (email: string, motDePasse: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (nom: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Crée ou met à jour le document users/{uid} dans Firestore.
 * - Création (document inexistant) : setDoc avec UNIQUEMENT displayName, email, photoURL, createdAt, lastLoginAt.
 * - Mise à jour (document existant) : updateDoc avec UNIQUEMENT displayName, photoURL, lastLoginAt.
 * Jamais de champ "role", jamais de réécriture de createdAt ou email.
 */
async function upsertUserDoc(user: User, explicitDisplayName?: string): Promise<void> {
  try {
    const db = getFirebaseDb();
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    const resolvedName =
      explicitDisplayName?.trim() ||
      user.displayName?.trim() ||
      "";

    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: resolvedName,
        email: user.email ?? "",
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      const existingData = snap.data();
      await updateDoc(ref, {
        displayName:
          resolvedName ||
          (typeof existingData?.displayName === "string" ? existingData.displayName : ""),
        photoURL: user.photoURL ?? (typeof existingData?.photoURL === "string" ? existingData.photoURL : null),
        lastLoginAt: serverTimestamp(),
      });
    }
  } catch (err) {
    // On ne bloque pas l'authentification si Firestore échoue
    if (process.env.NODE_ENV === "development") {
      console.warn("[AuthProvider] Echec de la mise à jour de users/{uid}:", err);
    }
  }
}

async function resolveIsAdmin(user: User, forceRefresh = false): Promise<boolean> {
  try {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return tokenResult.claims.admin === true;
  } catch {
    if (forceRefresh) {
      try {
        const cachedResult = await user.getIdTokenResult(false);
        return cachedResult.claims.admin === true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

function assertFirebaseConfigured(): void {
  const missingVars = getMissingFirebaseEnvVars();
  if (missingVars.length > 0) {
    const err = new Error("Firebase configuration is missing.") as Error & {
      code?: string;
      missingVars?: string[];
    };
    err.code = "auth/missing-config";
    err.missingVars = missingVars;
    throw err;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => hasFirebaseConfig());
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        try {
          if (currentUser) {
            const adminClaim = await resolveIsAdmin(currentUser, false);
            setIsAdmin(adminClaim);
            await upsertUserDoc(currentUser);
          } else {
            setIsAdmin(false);
          }
        } finally {
          setUser(currentUser);
          setLoading(false);
        }
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[AuthProvider] Firebase Auth initialization skipped:", err);
      }
      queueMicrotask(() => setLoading(false));
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    assertFirebaseConfigured();
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    if (credential.user) {
      const adminClaim = await resolveIsAdmin(credential.user, true);
      setIsAdmin(adminClaim);
      await upsertUserDoc(credential.user);
      setUser(credential.user);
      setLoading(false);
    }
  };

  const signUpWithEmail = async (nom: string, email: string, motDePasse: string) => {
    assertFirebaseConfigured();
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, motDePasse);
    const trimmedName = nom.trim();
    if (trimmedName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: trimmedName,
      });
      await userCredential.user.reload().catch(() => undefined);
      const updatedUser = auth.currentUser ?? userCredential.user;
      await upsertUserDoc(updatedUser, trimmedName);
      setUser(updatedUser);
      setProfileVersion((prev) => prev + 1);
    }
  };

  const signInWithEmail = async (email: string, motDePasse: string) => {
    assertFirebaseConfigured();
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, motDePasse);
  };

  const resetPassword = async (email: string) => {
    assertFirebaseConfigured();
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  };

  const updateDisplayName = async (nom: string) => {
    assertFirebaseConfigured();
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    const trimmed = nom.trim();
    if (!currentUser || !trimmed) return;

    await updateProfile(currentUser, { displayName: trimmed });
    await currentUser.reload().catch(() => undefined);
    try {
      const db = getFirebaseDb();
      const ref = doc(db, "users", currentUser.uid);
      await updateDoc(ref, { displayName: trimmed });
    } catch {
      // Ne pas bloquer la mise à jour du profil Auth si Firestore échoue
    }
    setUser(auth.currentUser ?? currentUser);
    setProfileVersion((prev) => prev + 1);
  };

  const signOut = async () => {
    assertFirebaseConfigured();
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  };

  const contextValue = React.useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      resetPassword,
      updateDisplayName,
      signOut,
    }),
    // profileVersion forces consumers to re-render when displayName mutates on the Firebase User instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, isAdmin, profileVersion]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth dwe itilize anndan yon AuthProvider");
  }
  return context;
}
