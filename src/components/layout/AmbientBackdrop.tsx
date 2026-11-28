import React from "react";

export function AmbientBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Couche d'éclairage studio (blanc lumineux multi-zones en mode jour, obsidienne en mode sombre) */}
      <div
        className="absolute inset-0 opacity-100 transition-opacity duration-300"
        style={{
          backgroundImage: "var(--canvas-ambient)",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 1b. Voile oblique lumière du jour (mode clair uniquement, net et aérien) */}
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          background:
            "linear-gradient(122deg, rgba(255, 255, 255, 0) 16%, rgba(255, 110, 48, 0.035) 44%, rgba(56, 139, 253, 0.028) 64%, rgba(255, 255, 255, 0) 86%)",
        }}
      />

      {/* 2. Trame architecturale de précision avec points aux intersections (mode clair) */}
      <div className="backdrop-grid absolute inset-0 opacity-95 dark:opacity-100" />

      {/* 3. Arcs d'horizon orbitaux ultra-fins couvrant le viewport pour une vraie profondeur */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full opacity-70 dark:opacity-55"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bayondy-arc-warm" x1="120" y1="0" x2="1320" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--brand-vivid)" stopOpacity="0" />
            <stop offset="28%" stopColor="var(--brand-vivid)" stopOpacity="0.34" />
            <stop offset="50%" stopColor="var(--brand-vivid)" stopOpacity="0.52" />
            <stop offset="72%" stopColor="#F59E0B" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand-vivid)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bayondy-arc-cool" x1="160" y1="0" x2="1280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--ice-white)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--ice-white)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--ice-white)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bayondy-arc-lower" x1="140" y1="0" x2="1300" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--brand-vivid)" stopOpacity="0" />
            <stop offset="45%" stopColor="var(--brand-vivid)" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand-vivid)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M -120 350 Q 720 -55 1560 350"
          stroke="url(#bayondy-arc-warm)"
          strokeWidth="1.25"
        />
        <path
          d="M -40 470 Q 720 105 1480 470"
          stroke="url(#bayondy-arc-cool)"
          strokeWidth="1"
        />
        <path
          d="M -120 830 Q 720 650 1560 850"
          stroke="url(#bayondy-arc-lower)"
          strokeWidth="1.1"
          className="opacity-80 dark:opacity-45"
        />
      </svg>

      {/* 4. Faisceau spéculaire supérieur sous la barre de navigation */}
      <div
        className="absolute top-16 inset-x-0 h-px opacity-75 dark:opacity-45"
        style={{
          background:
            "linear-gradient(90deg, transparent 8%, var(--brand-glow) 50%, transparent 92%)",
        }}
      />
    </div>
  );
}

export default AmbientBackdrop;
