import React from "react";
import { LEGAL_DRAFT } from "@/lib/legal/config";
import { t } from "@/lib/i18n";

/**
 * Bannière d'avertissement affichée en haut des pages juridiques tant que LEGAL_DRAFT = true.
 */
export function LegalDraftNotice() {
  if (!LEGAL_DRAFT) return null;

  return (
    <div
      role="alert"
      className="w-full mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg"
    >
      <span className="text-lg leading-none select-none text-amber-400" aria-hidden="true">
        ⚠
      </span>
      <div className="space-y-1">
        <p className="font-semibold text-amber-300">
          {t("legal.banniereProvisoire")}
        </p>
        <p className="text-amber-200/80 text-xs leading-relaxed">
          {t("legal.banniereDetail")}
        </p>
      </div>
    </div>
  );
}
