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
import { getFirebaseAuth, getFirebaseDb, hasFirebaseConfig } from "@/lib/firebase/client";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (nom: string, email: string, motDePasse: string) => Promise<void>;
  signInWithEmail: (email: string, motDePasse: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Crée ou met à jour le document users/{uid} dans Firestore.
 * - Création (document inexistant) : setDoc avec UNIQUEMENT displayName, email, photoURL, createdAt, lastLoginAt.
 * - Mise à jour (document existant) : updateDoc avec UNIQUEMENT displayName, photoURL, lastLoginAt.
 * Jamais de champ "role", jamais de réécriture de createdAt ou email.
 */
async function upsertUserDoc(user: User): Promise<void> {
  try {
    const db = getFirebaseDb();
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: user.displayName ?? "",
        email: user.email ?? "",
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      const existingData = snap.data();
      await updateDoc(ref, {
        displayName: user.displayName ?? (typeof existingData?.displayName === "string" ? existingData.displayName : ""),
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => hasFirebaseConfig());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          // Force le rafraîchissement du token pour récupérer les custom claims récents (admin: true)
          const tokenResult = await currentUser.getIdTokenResult(true);
          setIsAdmin(tokenResult.claims.admin === true);

          await upsertUserDoc(currentUser);
        } else {
          setIsAdmin(false);
        }
        setUser(currentUser);
        setLoading(false);
      });
    } catch (err) {
      console.warn("[AuthProvider] Firebase Auth initialization skipped:", err);
      queueMicrotask(() => setLoading(false));
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signUpWithEmail = async (nom: string, email: string, motDePasse: string) => {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, motDePasse);
    if (nom.trim() && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: nom.trim(),
      });
      // Mettre à jour l'état local pour refléter immédiatement le displayName
      setUser({ ...userCredential.user, displayName: nom.trim() } as User);
    }
  };

  const signInWithEmail = async (email: string, motDePasse: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, motDePasse);
  };

  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        signOut,
      }}
    >
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
