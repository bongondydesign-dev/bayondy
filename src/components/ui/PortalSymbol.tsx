import React from "react";

interface PortalSymbolProps {
  className?: string;
  size?: number;
  accent?: "brand" | "orange" | "ion";
}

export function PortalSymbol({
  className = "",
  size = 120,
  accent = "brand",
}: PortalSymbolProps) {
  const isIon = accent === "ion";
  const primaryGradId = isIon ? "portal-grad-ion-primary" : "portal-grad-brand-primary";
  const innerGradId = isIon ? "portal-grad-ion-inner" : "portal-grad-brand-inner";
  const glowFilterId = isIon ? "soft-glow-ion" : "soft-glow-brand";
  const stopLight = isIon ? "var(--catalog-aurora, #37D6D0)" : "var(--brand, #E54813)";
  const stopMid = isIon ? "var(--catalog-blue, #2864FF)" : "var(--brand, #E54813)";
  const stopDark = isIon ? "#1947C6" : "var(--brand-dark, #BA3408)";

  return (
    <div
      className={`inline-flex items-center justify-center animate-portal-pulse select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient
            id={primaryGradId}
            x1="20"
            y1="10"
            x2="100"
            y2="110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={stopLight} />
            <stop offset="55%" stopColor={stopMid} />
            <stop offset="100%" stopColor={stopDark} />
          </linearGradient>

          <linearGradient
            id={innerGradId}
            x1="35"
            y1="25"
            x2="85"
            y2="95"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor={stopLight}
              stopOpacity="0.85"
            />
            <stop
              offset="100%"
              stopColor={stopDark}
              stopOpacity="0.25"
            />
          </linearGradient>

          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Lueur arrière-plan discrète en mode clair, plus marquée en mode sombre */}
        <ellipse
          cx="60"
          cy="60"
          rx="40"
          ry="44"
          fill={`url(#${primaryGradId})`}
          className="opacity-[0.07] dark:opacity-[0.16]"
          filter={`url(#${glowFilterId})`}
        />

        {/* Colonne portail gauche (pilier du B) */}
        <rect
          x="28"
          y="18"
          width="12"
          height="84"
          rx="6"
          fill={`url(#${primaryGradId})`}
        />

        {/* Arche supérieure du B (Portail haut) */}
        <path
          d="M34 18 H66 C79.25 18 90 28.75 90 42 C90 55.25 79.25 66 66 66 H34"
          stroke={`url(#${primaryGradId})`}
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arche inférieure du B (Portail bas, plus large) */}
        <path
          d="M34 54 H70 C84.36 54 96 65.64 96 80 C96 94.36 84.36 102 70 102 H34"
          stroke={`url(#${primaryGradId})`}
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Centre lumineux du portail */}
        <circle
          cx="62"
          cy="42"
          r="6"
          fill={`url(#${innerGradId})`}
          opacity="0.9"
        />
        <circle
          cx="65"
          cy="78"
          r="8"
          fill={`url(#${innerGradId})`}
          opacity="0.9"
        />

        {/* Rayon de passage du portail */}
        <path
          d="M62 42 L65 78"
          stroke={stopLight}
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

export default PortalSymbol;
