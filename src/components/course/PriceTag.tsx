import React from "react";
import { formatPrice } from "@/lib/courses/format";
import { t } from "@/lib/i18n";

interface PriceTagProps {
  priceUSD: number | null | undefined;
  priceHTG: number | null | undefined;
  size?: "sm" | "lg";
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
        className={`inline-flex items-center font-mono font-medium rounded-lg text-aurora bg-aurora/10 border border-aurora/25 ${
          size === "lg" ? "text-sm sm:text-base px-3.5 py-1.5" : "text-xs px-2.5 py-1"
        } ${className}`}
      >
        {t("catalogue.prixBientot")}
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      {formattedHTG && (
        <span
          className={`font-display font-bold text-ice-white tracking-tight ${
            size === "lg" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
          }`}
        >
          {formattedHTG}
        </span>
      )}
      {formattedUSD && (
        <span
          className={`font-mono text-ice-white/60 ${
            size === "lg" ? "text-sm sm:text-base" : "text-xs"
          }`}
        >
          ({formattedUSD})
        </span>
      )}
    </div>
  );
}

export default PriceTag;
