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
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getFirebaseDb } from "@/lib/firebase/client";

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
 * Seuls les champs autorisés par les règles de sécurité sont écrits :
 * displayName, email, photoURL, createdAt, lastLoginAt — jamais de champ "role".
 */
async function upsertUserDoc(user: User, isNewUser: boolean): Promise<void> {
  try {
    const db = getFirebaseDb();
    const ref = doc(db, "users", user.uid);

    if (isNewUser) {
      // Création : tous les champs obligatoires
      await setDoc(ref, {
        displayName: user.displayName ?? "",
        email: user.email ?? "",
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Mise à jour : seulement lastLoginAt (et photoURL/displayName si présents)
      await setDoc(
        ref,
        {
          lastLoginAt: serverTimestamp(),
          ...(user.displayName !== null && { displayName: user.displayName }),
          ...(user.photoURL !== null && { photoURL: user.photoURL }),
        },
        { merge: true }
      );
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
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // Suivi des UIDs dont le document a déjà été créé lors de cette session
  const [seenUids] = useState(() => new Set<string>());

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Force le rafraîchissement du token pour récupérer les custom claims récents (admin: true)
        const tokenResult = await currentUser.getIdTokenResult(true);
        setIsAdmin(tokenResult.claims.admin === true);

        // Première connexion de cet uid dans cette session
        const isNewUser = !seenUids.has(currentUser.uid);
        seenUids.add(currentUser.uid);
        await upsertUserDoc(currentUser, isNewUser);
      } else {
        setIsAdmin(false);
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
    // seenUids est stable (useState avec Set), pas besoin dans les deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
