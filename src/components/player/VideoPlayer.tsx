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
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0B0E17] border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
      {!isValidId ? (
        // État d'erreur si l'ID YouTube est absent ou invalide
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121622] via-[#0B0E17] to-[#121622]">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF885C] mb-3">
            <PortalSymbol size={32} className="opacity-60" />
          </div>
          <p className="font-sans text-sm sm:text-base text-slate-200/80">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#FF5B22]/18 via-[#0B0E17] to-[#C93E0E]/12">
          <div
            className="absolute inset-0 bg-noise opacity-40 pointer-events-none"
            aria-hidden="true"
          />

          {/* Titre de la leçon en incrustation */}
          <div className="relative z-10 max-w-lg mb-6">
            <span className="inline-block font-mono text-xs uppercase tracking-wider text-[#FF885C] mb-2 px-3 py-1 rounded-full bg-[#080B14]/85 border border-white/15">
              {t("hero.apercu.badge")}
            </span>
            <h2 className="font-display font-semibold text-lg sm:text-2xl text-slate-100 drop-shadow-md line-clamp-2">
              {lessonTitle}
            </h2>
          </div>

          {/* Gros bouton de lecture (>= 44px) */}
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`${t("lecteur.lancerVideo")}: ${lessonTitle}`}
            className="relative z-10 group flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 min-h-[44px] min-w-[44px] rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] shadow-2xl shadow-[var(--brand-glow)] transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/50 cursor-pointer"
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

          <p className="relative z-10 mt-4 font-sans text-xs sm:text-sm text-slate-300/75">
            {t("lecteur.lancerVideo")}
          </p>
        </div>
      )}
    </div>
  );
}
