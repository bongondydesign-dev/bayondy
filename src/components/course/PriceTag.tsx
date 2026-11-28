import React from "react";
import { formatPrice } from "@/lib/courses/format";
import { t } from "@/lib/i18n";

interface PriceTagProps {
  priceUSD: number | null | undefined;
  priceHTG: number | null | undefined;
  size?: "sm" | "lg";
  variant?: "brand" | "catalog";
  className?: string;
}

export function PriceTag({
  priceUSD,
  priceHTG,
  size = "sm",
  className = "",
}: PriceTagProps) {
  const { hasPrice, formattedUSD, formattedHTG } = formatPrice(priceUSD, priceHTG);

  if (!hasPrice) {
    return (
      <span
        className={`inline-flex items-center font-mono font-medium rounded-lg border text-brand-light bg-[var(--surface-active)] border-[var(--home-orange-vivid)]/40 ${
          size === "lg" ? "text-sm sm:text-base px-3.5 py-1.5" : "text-xs px-2.5 py-1"
        } ${className}`}
      >
        {t("catalogue.prixBientot")}
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2.5 gap-y-1 tabular-nums ${className}`}>
      {formattedHTG && (
        <span
          className={`font-display font-bold tracking-tight text-ice-white leading-none ${
            size === "lg" ? "text-3xl sm:text-[34px]" : "text-lg sm:text-xl"
          }`}
        >
          {formattedHTG}
        </span>
      )}
      {formattedUSD && (
        <span
          className={`font-mono text-slate-600 dark:text-zinc-400 ${
            size === "lg" ? "text-xs sm:text-sm" : "text-xs"
          }`}
        >
          {formattedHTG ? `≈ ${formattedUSD}` : formattedUSD}
        </span>
      )}
    </div>
  );
}

export default PriceTag;
