"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ConnexionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/profil");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <AuthForm mode="connexion" />
      </main>
      <Footer />
    </div>
  );
}
