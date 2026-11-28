import React from "react";

export function AmbientBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Couche d'éclairage studio multi-zones */}
      <div
        className="absolute inset-0 opacity-100 transition-opacity duration-300"
        style={{
          backgroundImage: "var(--canvas-ambient)",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 1b. Faisceaux diagonaux lumière du jour (mode clair uniquement — sculpture lumineuse nette) */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          background:
            "linear-gradient(120deg, rgba(255, 255, 255, 0) 12%, rgba(255, 108, 46, 0.055) 38%, rgba(255, 255, 255, 0) 54%, rgba(56, 139, 253, 0.042) 72%, rgba(255, 255, 255, 0) 92%)",
        }}
      />
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          background:
            "linear-gradient(238deg, rgba(255, 255, 255, 0) 18%, rgba(251, 146, 60, 0.05) 45%, rgba(255, 255, 255, 0) 68%)",
        }}
      />

      {/* 2. Trame architecturale de précision avec points aux intersections (mode clair) */}
      <div className="backdrop-grid absolute inset-0 opacity-100" />

      {/* 3. Géométrie orbitale & courbes d'horizon architecturales */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full opacity-85 dark:opacity-55"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bayondy-arc-warm" x1="100" y1="0" x2="1340" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--brand-vivid)" stopOpacity="0" />
            <stop offset="25%" stopColor="var(--brand-vivid)" stopOpacity="0.38" />
            <stop offset="50%" stopColor="var(--brand-vivid)" stopOpacity="0.58" />
            <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--brand-vivid)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bayondy-arc-cool" x1="160" y1="0" x2="1280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--ice-white)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--ice-white)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--ice-white)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bayondy-arc-lower" x1="120" y1="0" x2="1320" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--brand-vivid)" stopOpacity="0" />
            <stop offset="40%" stopColor="var(--brand-vivid)" stopOpacity="0.28" />
            <stop offset="72%" stopColor="#3B82F6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--brand-vivid)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="bayondy-ring-fade" cx="50%" cy="20%" r="48%">
            <stop offset="0%" stopColor="var(--brand-vivid)" stopOpacity="0.26" />
            <stop offset="65%" stopColor="var(--ice-white)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--ice-white)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Anneaux concentriques fins centrés autour du haut du portail */}
        <circle
          cx="720"
          cy="170"
          r="290"
          stroke="url(#bayondy-ring-fade)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle
          cx="720"
          cy="170"
          r="460"
          stroke="url(#bayondy-ring-fade)"
          strokeWidth="1"
        />

        {/* Courbe d'horizon principale + points d'ancrage lumineux */}
        <path
          d="M -120 350 Q 720 -55 1560 350"
          stroke="url(#bayondy-arc-warm)"
          strokeWidth="1.35"
        />
        <path
          d="M -40 470 Q 720 105 1480 470"
          stroke="url(#bayondy-arc-cool)"
          strokeWidth="1.05"
        />
        <path
          d="M -120 830 Q 720 640 1560 850"
          stroke="url(#bayondy-arc-lower)"
          strokeWidth="1.2"
          className="opacity-85 dark:opacity-45"
        />

        {/* Nœuds discrets sur les flancs orbitaux */}
        <circle cx="290" cy="206" r="3" fill="var(--brand-vivid)" fillOpacity="0.45" />
        <circle cx="1150" cy="206" r="3" fill="#F59E0B" fillOpacity="0.45" />
      </svg>

      {/* 4. Faisceau spéculaire supérieur sous la barre de navigation */}
      <div
        className="absolute top-16 inset-x-0 h-px opacity-85 dark:opacity-45"
        style={{
          background:
            "linear-gradient(90deg, transparent 6%, var(--brand-glow) 50%, transparent 94%)",
        }}
      />
    </div>
  );
}

export default AmbientBackdrop;
