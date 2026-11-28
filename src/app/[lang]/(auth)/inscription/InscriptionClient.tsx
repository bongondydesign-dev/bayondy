"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { AuthForm } from "@/components/auth/AuthForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function InscriptionContent() {
  const { user, loading } = useAuth();
  const { localize } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(
    searchParams.get("redirect"),
    localize("/mes-formations")
  );

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return <AuthForm mode="inscription" redirectTo={redirectTo} />;
}

export function InscriptionClient() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto h-96 rounded-2xl bg-deep-navy border border-[var(--border-subtle)] animate-pulse" />
          }
        >
          <InscriptionContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
