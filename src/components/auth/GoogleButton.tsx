"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  extractAuthErrorCode,
  getAuthErrorMessageKey,
  shouldIgnoreAuthError,
} from "@/lib/auth/errors";
import { t } from "@/lib/i18n";

interface GoogleButtonProps {
  onError?: (errorMessageKey: string | null) => void;
  onSuccess?: () => void;
}

export function GoogleButton({ onError, onSuccess }: GoogleButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    if (onError) onError(null);

    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const errorCode = extractAuthErrorCode(err);
      if (process.env.NODE_ENV === "development") {
        console.warn("[GoogleButton] Auth error code:", errorCode || "unknown");
      }
      // Si l'utilisateur a fermé ou annulé la popup sans se connecter, ne pas afficher d'erreur agressive
      if (shouldIgnoreAuthError(errorCode)) {
        return;
      }
      const messageKey = getAuthErrorMessageKey(errorCode);
      if (onError) onError(messageKey);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className="w-full min-h-[44px] px-4 py-2.5 rounded-full bg-obsidian border border-white/[0.12] text-ice-white font-medium text-sm sm:text-base flex items-center justify-center gap-3 hover:border-brand/50 hover:bg-[#13151B] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-deep-navy"
    >
      {/* Logo Google (SVG inline) */}
      <svg
        className="w-5 h-5 shrink-0"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>
        {submitting ? t("auth.chargement") : t("auth.continuerAvecGoogle")}
      </span>
    </button>
  );
}

export default GoogleButton;
