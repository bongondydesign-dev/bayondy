import React from "react";

interface PortalSymbolProps {
  className?: string;
  size?: number;
  accent?: "brand" | "orange";
}

export function PortalSymbol({
  className = "",
  size = 120,
}: PortalSymbolProps) {
  const primaryGradId = "portal-grad-brand-primary";
  const innerGradId = "portal-grad-brand-inner";
  const glowFilterId = "soft-glow-brand";

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
            <stop offset="0%" stopColor="var(--brand-light, #FF885C)" />
            <stop offset="55%" stopColor="var(--brand, #FF5B22)" />
            <stop offset="100%" stopColor="var(--brand-dark, #C93E0E)" />
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
              stopColor="var(--brand-light, #FF885C)"
              stopOpacity="0.85"
            />
            <stop
              offset="100%"
              stopColor="var(--brand-dark, #C93E0E)"
              stopOpacity="0.25"
            />
          </linearGradient>

          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Lueur arrière-plan */}
        <ellipse
          cx="60"
          cy="60"
          rx="42"
          ry="46"
          fill={`url(#${primaryGradId})`}
          opacity="0.15"
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
          stroke="var(--brand-light, #FF885C)"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

export default PortalSymbol;
