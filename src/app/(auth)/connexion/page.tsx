"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function ConnexionContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return <AuthForm mode="connexion" redirectTo={redirectTo} />;
}

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto h-96 rounded-2xl bg-[#0D0E11] border border-white/[0.08] animate-pulse" />
          }
        >
          <ConnexionContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
