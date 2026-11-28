import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MerciStatus } from "@/components/payment/MerciStatus";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: `${t("merci.titre")} | BAYONDY`,
  description: t("merci.sousTitre"),
};

function MerciSkeleton() {
  return (
    <div
      className="w-full max-w-xl h-80 rounded-3xl bg-deep-navy border border-[var(--border-subtle)] p-7 sm:p-10 shadow-[var(--card-shadow)] animate-pulse"
      aria-hidden="true"
    />
  );
}

export default function MerciPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-24">
        <Suspense fallback={<MerciSkeleton />}>
          <MerciStatus />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
