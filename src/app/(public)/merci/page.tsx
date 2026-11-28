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
      className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-pulse"
      aria-hidden="true"
    >
      <div className="lg:col-span-7 h-96 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
      <div className="lg:col-span-5 h-96 rounded-2xl bg-deep-navy border border-[var(--border-subtle)]" />
    </div>
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
