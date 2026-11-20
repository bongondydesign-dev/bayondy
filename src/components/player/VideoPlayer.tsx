"use client";

import React, { useState } from "react";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { t } from "@/lib/i18n";

interface VideoPlayerProps {
  lessonTitle: string;
  youtubeVideoId: string;
}

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function VideoPlayer({
  lessonTitle,
  youtubeVideoId,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const isValidId = Boolean(
    youtubeVideoId && YOUTUBE_ID_REGEX.test(youtubeVideoId)
  );

  return (
    <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-obsidian border border-white/10 shadow-2xl">
      {!isValidId ? (
        // État d'erreur si l'ID YouTube est absent ou invalide
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-deep-navy via-obsidian to-deep-navy">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-aurora/60 mb-3">
            <PortalSymbol size={32} className="opacity-50" />
          </div>
          <p className="font-sans text-sm sm:text-base text-ice-white/70">
            {t("lecteur.videoIndisponible")}
          </p>
        </div>
      ) : isPlaying ? (
        // Iframe YouTube chargé uniquement après clic explicite de l'élève
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(
            youtubeVideoId
          )}?rel=0&modestbranding=1`}
          title={lessonTitle || t("hero.apercu.badge")}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      ) : (
        // Cadre de repli 16:9 cinématique avec bouton de lecture >= 44px
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-ion-blue/20 via-deep-navy to-aurora/10">
          <div
            className="absolute inset-0 bg-noise opacity-40 pointer-events-none"
            aria-hidden="true"
          />

          {/* Titre de la leçon en incrustation */}
          <div className="relative z-10 max-w-lg mb-6">
            <span className="inline-block font-mono text-xs uppercase tracking-wider text-aurora mb-2 px-3 py-1 rounded-full bg-obsidian/70 border border-white/10">
              {t("hero.apercu.badge")}
            </span>
            <h2 className="font-display font-semibold text-lg sm:text-2xl text-ice-white drop-shadow-md line-clamp-2">
              {lessonTitle}
            </h2>
          </div>

          {/* Gros bouton de lecture (>= 44px) */}
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`${t("lecteur.lancerVideo")}: ${lessonTitle}`}
            className="relative z-10 group flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 min-h-[44px] min-w-[44px] rounded-full bg-ion-blue hover:bg-aurora text-white hover:text-obsidian shadow-2xl shadow-ion-blue/40 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aurora/50 cursor-pointer"
          >
            <svg
              className="w-7 h-7 sm:w-9 sm:h-9 translate-x-0.5 transition-transform group-hover:scale-110"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <p className="relative z-10 mt-4 font-sans text-xs sm:text-sm text-ice-white/60">
            {t("lecteur.lancerVideo")}
          </p>
        </div>
      )}
    </div>
  );
}
