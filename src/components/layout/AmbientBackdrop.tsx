import React from "react";

export function AmbientBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Couche d'éclairage studio multi-points (équilibre chaud/froid) */}
      <div
        className="absolute inset-0 opacity-95 dark:opacity-100 transition-opacity duration-300"
        style={{
          backgroundImage: "var(--canvas-ambient)",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 2. Trame architecturale de précision avec fondu elliptique progressif */}
      <div className="backdrop-grid absolute inset-0" />

      {/* 3. Arcs d'horizon orbitaux ultra-fins pour la profondeur de scène */}
      <svg
        viewBox="0 0 1440 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-x-0 top-0 w-full h-[540px] sm:h-[680px] opacity-60 dark:opacity-75"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <linearGradient id="bayondy-arc-warm" x1="120" y1="0" x2="1320" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0" />
            <stop offset="28%" stopColor="var(--brand-light)" stopOpacity="0.22" />
            <stop offset="50%" stopColor="var(--brand)" stopOpacity="0.34" />
            <stop offset="72%" stopColor="#38BDF8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bayondy-arc-cool" x1="180" y1="0" x2="1260" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--ice-white)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--ice-white)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--ice-white)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M -120 380 Q 720 -40 1560 380"
          stroke="url(#bayondy-arc-warm)"
          strokeWidth="1.15"
        />
        <path
          d="M -40 490 Q 720 120 1480 490"
          stroke="url(#bayondy-arc-cool)"
          strokeWidth="1"
        />
      </svg>

      {/* 4. Faisceau spéculaire supérieur sous la barre de navigation */}
      <div
        className="absolute top-16 inset-x-0 h-px opacity-55 dark:opacity-70"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, var(--brand-glow) 38%, rgba(56, 189, 248, 0.25) 62%, transparent 95%)",
        }}
      />
    </div>
  );
}

export default AmbientBackdrop;
