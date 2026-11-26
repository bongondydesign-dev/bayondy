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
  variant = "brand",
  className = "",
}: PriceTagProps) {
  const { hasPrice, formattedUSD, formattedHTG } = formatPrice(priceUSD, priceHTG);
  const isCatalog = variant === "catalog";

  if (!hasPrice) {
    return (
      <span
        className={`inline-flex items-center font-mono font-medium rounded-lg border ${
          isCatalog
            ? "text-[#37D6D0] bg-[#2864FF]/15 border-[#2864FF]/35"
            : "text-brand-light bg-brand/10 border-brand/25"
        } ${
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
          className={`font-display font-bold tracking-tight ${
            isCatalog ? "text-[#E8EDF5]" : "text-ice-white"
          } ${
            size === "lg" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
          }`}
        >
          {formattedHTG}
        </span>
      )}
      {formattedUSD && (
        <span
          className={`font-mono ${
            isCatalog ? "text-[#E8EDF5]/70" : "text-ice-white/60"
          } ${
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
