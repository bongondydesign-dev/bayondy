"use client";

import React, { useState } from "react";
import { Clock, ExternalLink, Play, Video } from "lucide-react";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { formatDuration } from "@/lib/courses/format";
import { getLessonPlaybackInfo } from "@/lib/video/lessonVideo";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface VideoPlayerProps {
  lessonTitle: string;
  youtubeVideoId: string;
  videoProvider?: string | null;
  videoId?: string | null;
  videoUrl?: string | null;
  durationMinutes?: number;
}

export function VideoPlayer({
  lessonTitle,
  youtubeVideoId,
  videoProvider,
  videoId,
  videoUrl,
  durationMinutes,
}: VideoPlayerProps) {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);

  const playback = getLessonPlaybackInfo({
    videoProvider,
    videoId,
    videoUrl,
    youtubeVideoId,
  });

  const formattedDuration =
    typeof durationMinutes === "number" && durationMinutes > 0
      ? formatDuration(durationMinutes)
      : "";

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0B0E17] border border-[var(--border-subtle)] ring-1 ring-white/5 shadow-[var(--card-shadow)]">
        {!playback.provider ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121622] via-[#0B0E17] to-[#121622]">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF885C] mb-3">
              <PortalSymbol size={32} className="opacity-60" />
            </div>
            <p className="font-sans text-sm sm:text-base text-slate-200/80">
              {t("lecteur.videoIndisponible")}
            </p>
          </div>
        ) : playback.provider === "tiktok" &&
          !playback.playableInIframe &&
          playback.externalUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#FF5B22]/16 via-[#0B0E17] to-[#C93E0E]/12">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-[#FF885C] mb-4">
              <Video className="w-7 h-7" aria-hidden="true" />
            </div>
            <h2 className="font-display font-semibold text-lg sm:text-2xl text-slate-100 max-w-lg line-clamp-2 mb-2">
              {lessonTitle}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-300/80 max-w-md mb-6">
              {t("lecteur.tikTokInfo")}
            </p>
            <a
              href={playback.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-6 py-3 rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <span>{t("lecteur.regarderTikTok")}</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        ) : isPlaying && playback.embedUrl ? (
          <iframe
            src={playback.embedUrl}
            title={lessonTitle || t("hero.apercu.badge")}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#FF5B22]/18 via-[#0B0E17] to-[#C93E0E]/12">
            <div
              className="absolute inset-0 bg-noise opacity-40 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-xl mb-6 space-y-2">
              <div className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-[#FF885C]">
                <span>
                  {playback.provider === "tiktok" ? "TikTok" : t("hero.apercu.badge")}
                </span>
                {formattedDuration && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-slate-200/80 normal-case tabular-nums">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {formattedDuration}
                    </span>
                  </>
                )}
              </div>
              <h2 className="font-display font-semibold text-lg sm:text-2xl text-slate-100 drop-shadow-md line-clamp-2">
                {lessonTitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label={`${t("lecteur.lancerVideo")}: ${lessonTitle}`}
              className="relative z-10 group flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 min-h-[44px] min-w-[44px] rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] shadow-2xl shadow-[var(--brand-glow)] transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/50 cursor-pointer"
            >
              <Play
                className="w-7 h-7 sm:w-8 sm:h-8 translate-x-0.5 fill-current transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
            </button>

            <p className="relative z-10 mt-4 font-sans text-xs sm:text-sm text-slate-300/80">
              {t("lecteur.lancerVideo")}
            </p>
          </div>
        )}
      </div>

      {playback.provider === "tiktok" &&
        playback.playableInIframe &&
        playback.externalUrl && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-xl bg-[var(--surface-well)] border border-[var(--border-subtle)] text-xs text-slate-700 dark:text-ice-white/70">
            <span>{t("lecteur.tikTokInfo")}</span>
            <a
              href={playback.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-brand-light hover:underline shrink-0 min-h-[44px]"
            >
              <span>{t("lecteur.ouvrirTikTok")}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        )}
    </div>
  );
}
