"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function ReturnContent() {
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("transaction_id") || "";
  const reference = searchParams.get("reference") || "";
  const isMissingParams = !transactionId && !reference;

  const [loading, setLoading] = useState(!isMissingParams);
  const [paymentStatus, setPaymentStatus] = useState<"completed" | "processing" | "failed">(
    isMissingParams ? "failed" : "processing"
  );
  const [courseSlug, setCourseSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    isMissingParams ? "Okenn idantifyan peman pa jwenn nan adrès la." : null
  );

  useEffect(() => {
    if (isMissingParams) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 10; // 10 tentatives x 3 secondes = 30s de vérification

    const intervalId = setInterval(async () => {
      try {
        const query = transactionId
          ? `transactionId=${encodeURIComponent(transactionId)}`
          : `reference=${encodeURIComponent(reference)}`;

        const res = await fetch(`/api/payments/verify?${query}`);
        const data = await res.json();

        if (data.isPaid || data.status === "completed") {
          setPaymentStatus("completed");
          if (data.courseSlug) setCourseSlug(data.courseSlug);
          setLoading(false);
          clearInterval(intervalId);
          return;
        }

        if (data.status === "failed") {
          setPaymentStatus("failed");
          setErrorMessage(data.error || "Peman an pa t kapab konfime.");
          setLoading(false);
          clearInterval(intervalId);
          return;
        }

        // Si encore en cours (ex: NatCash ou délai opérateur)
        attempts += 1;
        if (attempts >= maxAttempts) {
          setPaymentStatus("processing");
          setLoading(false);
          clearInterval(intervalId);
        }
      } catch {
        attempts += 1;
        if (attempts >= maxAttempts) {
          setPaymentStatus("processing");
          setLoading(false);
          clearInterval(intervalId);
        }
      }
    }, 3000);

    // Vérification initiale immédiate
    const initialQuery = transactionId
      ? `transactionId=${encodeURIComponent(transactionId)}`
      : `reference=${encodeURIComponent(reference)}`;

    fetch(`/api/payments/verify?${initialQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.isPaid || data.status === "completed") {
          setPaymentStatus("completed");
          if (data.courseSlug) setCourseSlug(data.courseSlug);
          setLoading(false);
          clearInterval(intervalId);
        } else if (data.status === "failed") {
          setPaymentStatus("failed");
          setErrorMessage(data.error || "Peman an pa t kapab konfime.");
          setLoading(false);
          clearInterval(intervalId);
        }
      })
      .catch(() => {});

    return () => {
      clearInterval(intervalId);
    };
  }, [transactionId, reference, isMissingParams]);

  return (
    <div className="max-w-xl w-full mx-auto p-6 sm:p-8 rounded-3xl bg-deep-navy border border-white/10 shadow-2xl text-center space-y-6">
      {/* État de chargement initial / En cours de vérification */}
      {loading && (
        <div className="space-y-5 py-8">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-aurora/20 border-t-aurora animate-spin" />
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Verifikasyon peman an ap fèt...
          </h1>
          <p className="font-sans text-sm sm:text-base text-ice-white/70">
            N ap konfime tranzaksyon an ak operatè a sou sèvè nou an. Tanpri pa fèmen paj la.
          </p>
        </div>
      )}

      {/* État Succès : Paiement confirmé par le serveur */}
      {!loading && paymentStatus === "completed" && (
        <div className="space-y-6 py-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-aurora/10 border-2 border-aurora/30 flex items-center justify-center text-aurora text-3xl shadow-lg shadow-aurora/20">
            ✓
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Peman ou reyisi !
            </h1>
            <p className="font-sans text-sm sm:text-base text-ice-white/80">
              Enskripsyon ou nan fòmasyon an aktif kounye a. Ou ka kòmanse gade leson yo imedyatman.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            {courseSlug ? (
              <Link
                href={`/mes-formations/${courseSlug}`}
                className="min-h-[48px] px-6 py-3 rounded-2xl bg-aurora hover:bg-aurora/90 text-obsidian font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-aurora/25"
              >
                <span>Aksede nan fòmasyon an</span>
                <span>→</span>
              </Link>
            ) : (
              <Link
                href="/mes-formations"
                className="min-h-[48px] px-6 py-3 rounded-2xl bg-aurora hover:bg-aurora/90 text-obsidian font-sans font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-aurora/25"
              >
                <span>Ale nan fòmasyon m yo</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* État En attente prolongée (ex: NatCash) */}
      {!loading && paymentStatus === "processing" && (
        <div className="space-y-6 py-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-ion-blue/20 border-2 border-ion-blue flex items-center justify-center text-ion-blue text-3xl">
            ⏱
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Peman an ap trete...
            </h1>
            <p className="font-sans text-sm sm:text-base text-ice-white/80 leading-relaxed">
              Tranzaksyon an te byen kòmanse men operatè a ap valide l. Dès ke li konfime, aksè a ap louvri otomatikman sou kont ou.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-sans text-sm font-medium transition-colors"
            >
              Re-tcheke kounye a
            </button>
            <Link
              href="/mes-formations"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-ion-blue hover:bg-ion-blue/90 text-white font-sans text-sm font-medium transition-colors flex items-center justify-center"
            >
              Ale nan fòmasyon m yo
            </Link>
          </div>
        </div>
      )}

      {/* État Échec */}
      {!loading && paymentStatus === "failed" && (
        <div className="space-y-6 py-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-400 text-3xl">
            ✕
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Peman an pa t kapab fèt
            </h1>
            <p className="font-sans text-sm sm:text-base text-ice-white/70">
              {errorMessage || "Tranzaksyon an te refize oswa li te ekspire. Tanpri eseye ankò."}
            </p>
          </div>

          <div className="pt-4 flex justify-center">
            <Link
              href="/formations"
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-sans font-medium text-sm sm:text-base transition-colors"
            >
              Retounen nan fòmasyon yo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian bg-noise text-ice-white selection:bg-ion-blue/30 selection:text-aurora">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <Suspense
          fallback={
            <div className="text-center py-12 text-ice-white/60">
              Chajman detay peman...
            </div>
          }
        >
          <ReturnContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
