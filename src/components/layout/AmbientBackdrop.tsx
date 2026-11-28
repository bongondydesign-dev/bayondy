import React from "react";

export function AmbientBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Couche d'éclairage studio (claire et nette en mode jour, obsidienne en mode sombre) */}
      <div
        className="absolute inset-0 opacity-100 transition-opacity duration-300"
        style={{
          backgroundImage: "var(--canvas-ambient)",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 2. Trame architecturale de précision avec fondu elliptique progressif */}
      <div className="backdrop-grid absolute inset-0 opacity-90 dark:opacity-100" />

      {/* 3. Arcs d'horizon orbitaux ultra-fins pour la profondeur de scène */}
      <svg
        viewBox="0 0 1440 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-x-0 top-0 w-full h-[540px] sm:h-[680px] opacity-60 dark:opacity-55"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <linearGradient id="bayondy-arc-warm" x1="120" y1="0" x2="1320" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--brand-vivid)" stopOpacity="0" />
            <stop offset="30%" stopColor="var(--brand-vivid)" stopOpacity="0.32" />
            <stop offset="50%" stopColor="var(--brand-vivid)" stopOpacity="0.48" />
            <stop offset="72%" stopColor="#F59E0B" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--brand-vivid)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bayondy-arc-cool" x1="180" y1="0" x2="1260" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--ice-white)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--ice-white)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--ice-white)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M -120 380 Q 720 -40 1560 380"
          stroke="url(#bayondy-arc-warm)"
          strokeWidth="1.2"
        />
        <path
          d="M -40 490 Q 720 120 1480 490"
          stroke="url(#bayondy-arc-cool)"
          strokeWidth="1"
        />
      </svg>

      {/* 4. Faisceau spéculaire supérieur sous la barre de navigation */}
      <div
        className="absolute top-16 inset-x-0 h-px opacity-55 dark:opacity-45"
        style={{
          background:
            "linear-gradient(90deg, transparent 8%, var(--brand-glow) 50%, transparent 92%)",
        }}
      />
    </div>
  );
}

export default AmbientBackdrop;
