import React from "react";

interface PortalSymbolProps {
  className?: string;
  size?: number;
}

export function PortalSymbol({ className = "", size = 120 }: PortalSymbolProps) {
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
          {/* Dégradé principal Ion Blue vers Aurora */}
          <linearGradient
            id="portal-grad-primary"
            x1="20"
            y1="10"
            x2="100"
            y2="110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2864FF" />
            <stop offset="60%" stopColor="#2D8DFF" />
            <stop offset="100%" stopColor="#37D6D0" />
          </linearGradient>

          {/* Dégradé secondaire pour lueur intérieure */}
          <linearGradient
            id="portal-grad-inner"
            x1="35"
            y1="25"
            x2="85"
            y2="95"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#37D6D0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2864FF" stopOpacity="0.2" />
          </linearGradient>

          {/* Filtre de lueur diffuse */}
          <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
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
          fill="url(#portal-grad-primary)"
          opacity="0.15"
          filter="url(#soft-glow)"
        />

        {/* Colonne portail gauche (pilier du B) */}
        <rect
          x="28"
          y="18"
          width="12"
          height="84"
          rx="6"
          fill="url(#portal-grad-primary)"
        />

        {/* Arche supérieure du B (Portail haut) */}
        <path
          d="M34 18 H66 C79.25 18 90 28.75 90 42 C90 55.25 79.25 66 66 66 H34"
          stroke="url(#portal-grad-primary)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arche inférieure du B (Portail bas, plus large) */}
        <path
          d="M34 54 H70 C84.36 54 96 65.64 96 80 C96 94.36 84.36 102 70 102 H34"
          stroke="url(#portal-grad-primary)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Centre lumineux du portail / cœur d'énergie Aurora */}
        <circle
          cx="62"
          cy="42"
          r="6"
          fill="url(#portal-grad-inner)"
          opacity="0.9"
        />
        <circle
          cx="65"
          cy="78"
          r="8"
          fill="url(#portal-grad-inner)"
          opacity="0.9"
        />

        {/* Rayon de passage du portail */}
        <path
          d="M62 42 L65 78"
          stroke="#37D6D0"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

export default PortalSymbol;
