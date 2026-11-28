"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { formatDuration } from "@/lib/courses/format";
import {
  PLAYBACK_SPEEDS,
  buildYouTubeEmbedUrl,
  clampPlaybackProgress,
  computeSeekTarget,
  formatPlaybackTime,
  getLessonPlaybackInfo,
} from "@/lib/video/lessonVideo";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface YTPlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoLoadedFraction(): number;
  setPlaybackRate(rate: number): void;
  getPlayerState(): number;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      host?: string;
      width?: string | number;
      height?: string | number;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayerInstance }) => void;
        onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
        onError?: () => void;
      };
    }
  ) => YTPlayerInstance;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SSR"));
  }
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }
  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      ytApiPromise = null;
      reject(new Error("YouTube API load timeout"));
    }, 5500);

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeoutId);
      if (typeof prevReady === "function") {
        prevReady();
      }
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        ytApiPromise = null;
        reject(new Error("YouTube API unavailable"));
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeoutId);
        ytApiPromise = null;
        reject(new Error("YouTube API script error"));
      };
      document.head.appendChild(script);
    }
  });

  return ytApiPromise;
}

const TRUSTED_POSTER_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "i.ytimg.com",
  "img.youtube.com",
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "res.cloudinary.com",
  "images.unsplash.com",
  "images.pexels.com",
  "picsum.photos",
]);

function isSafePosterImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" && TRUSTED_POSTER_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

interface VideoPlayerProps {
  lessonTitle: string;
  youtubeVideoId: string;
  videoProvider?: string | null;
  videoId?: string | null;
  videoUrl?: string | null;
  durationMinutes?: number;
  posterImageUrl?: string | null;
  badgeLabel?: string;
  nextLessonTitle?: string;
  onNextLesson?: () => void;
  onEnded?: () => void;
}

type PlayerPhase = "poster" | "loading" | "playing" | "paused" | "ended" | "fallback";

export function VideoPlayer({
  lessonTitle,
  youtubeVideoId,
  videoProvider,
  videoId,
  videoUrl,
  durationMinutes,
  posterImageUrl,
  badgeLabel,
  nextLessonTitle,
  onNextLesson,
  onEnded,
}: VideoPlayerProps) {
  const { t } = useI18n();

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

  const resolvedPoster = isSafePosterImageUrl(posterImageUrl)
    ? posterImageUrl
    : isSafePosterImageUrl(playback.thumbnailUrl)
    ? playback.thumbnailUrl
    : null;

  const [phase, setPhase] = useState<PlayerPhase>("poster");
  const [posterFailed, setPosterFailed] = useState(false);
  const [tikTokPlaying, setTikTokPlaying] = useState(false);

  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [durationSec, setDurationSec] = useState(
    typeof durationMinutes === "number" && durationMinutes > 0
      ? durationMinutes * 60
      : 0
  );
  const [bufferedPct, setBufferedPct] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const ytMountRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<number | null>(null);
  const endedNotifiedRef = useRef(false);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimerRef.current !== null) {
      window.clearTimeout(hideControlsTimerRef.current);
    }
    setControlsVisible(true);
    hideControlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2800);
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      const fsEl = document.fullscreenElement;
      setIsFullscreen(Boolean(fsEl && containerRef.current && fsEl === containerRef.current));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      if (hideControlsTimerRef.current !== null) {
        window.clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  // Montage du lecteur YouTube IFrame API sans chrome YouTube dès que l'utilisateur lance la vidéo
  useEffect(() => {
    if (playback.provider !== "youtube" || !playback.videoId) return;
    if (phase === "poster" || phase === "fallback") return;
    if (ytPlayerRef.current) return;

    let cancelled = false;
    const targetEl = ytMountRef.current;
    if (!targetEl) return;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !ytMountRef.current) return;

        const player = new YT.Player(ytMountRef.current, {
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          videoId: playback.videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            cc_load_policy: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) {
                try {
                  event.target.destroy();
                } catch {
                  // ignore cleanup error
                }
                return;
              }
              ytPlayerRef.current = event.target;
              const d = event.target.getDuration();
              if (Number.isFinite(d) && d > 0) {
                setDurationSec(d);
              }
              event.target.setVolume(volume);
              if (isMuted) {
                event.target.mute();
              }
              event.target.playVideo();
            },
            onStateChange: (event) => {
              if (cancelled) return;
              const { PLAYING, PAUSED, ENDED, BUFFERING } = YT.PlayerState;
              const d = event.target.getDuration();
              if (Number.isFinite(d) && d > 0) {
                setDurationSec(d);
              }

              if (event.data === PLAYING) {
                endedNotifiedRef.current = false;
                setPhase("playing");
                scheduleHideControls();
              } else if (event.data === PAUSED) {
                setPhase("paused");
                setControlsVisible(true);
              } else if (event.data === BUFFERING) {
                setControlsVisible(true);
              } else if (event.data === ENDED) {
                setPhase("ended");
                setControlsVisible(true);
                if (!endedNotifiedRef.current) {
                  endedNotifiedRef.current = true;
                  onEndedRef.current?.();
                }
              }
            },
            onError: () => {
              if (!cancelled) {
                setPhase("fallback");
              }
            },
          },
        });

        ytPlayerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) {
          setPhase("fallback");
        }
      });

    return () => {
      cancelled = true;
    };
    // Intentionnel: volume/isMuted initiaux à la création uniquement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, playback.provider, playback.videoId]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
        ytPlayerRef.current = null;
      }
    };
  }, []);

  // Synchronisation du temps de lecture toutes les 250ms pendant la lecture active
  useEffect(() => {
    if (phase !== "playing" && phase !== "paused") return;
    const id = window.setInterval(() => {
      const player = ytPlayerRef.current;
      if (!player || isDraggingScrubber) return;
      try {
        const cur = player.getCurrentTime();
        const dur = player.getDuration();
        const loaded = player.getVideoLoadedFraction();
        if (Number.isFinite(dur) && dur > 0) {
          setDurationSec(dur);
        }
        if (Number.isFinite(cur) && cur >= 0) {
          setCurrentTimeSec(cur);
        }
        if (Number.isFinite(loaded) && loaded >= 0) {
          setBufferedPct(Math.max(0, Math.min(100, loaded * 100)));
        }
      } catch {
        // ignore transient iframe calls
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [phase, isDraggingScrubber]);

  const togglePlay = useCallback(() => {
    scheduleHideControls();
    if (phase === "poster") {
      setPhase("loading");
      return;
    }
    const player = ytPlayerRef.current;
    if (!player) return;

    if (phase === "ended") {
      endedNotifiedRef.current = false;
      player.seekTo(0, true);
      player.playVideo();
      setCurrentTimeSec(0);
      setPhase("playing");
      return;
    }

    if (phase === "playing") {
      player.pauseVideo();
      setPhase("paused");
    } else {
      player.playVideo();
      setPhase("playing");
    }
  }, [phase, scheduleHideControls]);

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      scheduleHideControls();
      const player = ytPlayerRef.current;
      if (!player) return;
      const cur = player.getCurrentTime() || currentTimeSec;
      const dur = player.getDuration() || durationSec;
      const target = computeSeekTarget(cur, deltaSeconds, dur);
      player.seekTo(target, true);
      setCurrentTimeSec(target);
      if (phase === "ended") {
        player.playVideo();
        setPhase("playing");
      }
    },
    [currentTimeSec, durationSec, phase, scheduleHideControls]
  );

  const seekToClientX = useCallback(
    (clientX: number) => {
      const bar = scrubberRef.current;
      const player = ytPlayerRef.current;
      if (!bar || !player || durationSec <= 0) return;
      const rect = bar.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const target = ratio * durationSec;
      player.seekTo(target, true);
      setCurrentTimeSec(target);
      if (phase === "ended") {
        player.playVideo();
        setPhase("playing");
      }
    },
    [durationSec, phase]
  );

  const toggleMute = useCallback(() => {
    scheduleHideControls();
    const player = ytPlayerRef.current;
    if (!player) return;
    if (isMuted) {
      player.unMute();
      const nextVol = volume > 0 ? volume : 80;
      player.setVolume(nextVol);
      setVolume(nextVol);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  }, [isMuted, volume, scheduleHideControls]);

  const handleVolumeChange = useCallback(
    (nextVolume: number) => {
      scheduleHideControls();
      const clamped = Math.max(0, Math.min(100, nextVolume));
      setVolume(clamped);
      const player = ytPlayerRef.current;
      if (!player) return;
      if (clamped === 0) {
        player.mute();
        setIsMuted(true);
      } else {
        player.unMute();
        player.setVolume(clamped);
        setIsMuted(false);
      }
    },
    [scheduleHideControls]
  );

  const cyclePlaybackSpeed = useCallback(() => {
    scheduleHideControls();
    const currentIdx = PLAYBACK_SPEEDS.indexOf(
      playbackSpeed as (typeof PLAYBACK_SPEEDS)[number]
    );
    const nextSpeed =
      PLAYBACK_SPEEDS[(currentIdx + 1) % PLAYBACK_SPEEDS.length] ?? 1;
    setPlaybackSpeed(nextSpeed);
    const player = ytPlayerRef.current;
    if (player) {
      try {
        player.setPlaybackRate(nextSpeed);
      } catch {
        // ignore if unsupported
      }
    }
  }, [playbackSpeed, scheduleHideControls]);

  const toggleFullscreen = useCallback(async () => {
    scheduleHideControls();
    const container = containerRef.current;
    if (!container) return;
    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else if (container.requestFullscreen) {
        await container.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen rejection
    }
  }, [scheduleHideControls]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (playback.provider !== "youtube" || phase === "poster" || phase === "fallback") {
        return;
      }
      const key = e.key.toLowerCase();
      if (key === " " || key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (key === "arrowleft" || key === "j") {
        e.preventDefault();
        seekBy(-10);
      } else if (key === "arrowright" || key === "l") {
        e.preventDefault();
        seekBy(10);
      } else if (key === "m") {
        e.preventDefault();
        toggleMute();
      } else if (key === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    },
    [playback.provider, phase, togglePlay, seekBy, toggleMute, toggleFullscreen]
  );

  const progressPct = clampPlaybackProgress(currentTimeSec, durationSec);
  const showControlsBar =
    phase === "playing" || phase === "paused" || phase === "ended"
      ? controlsVisible || phase !== "playing" || isDraggingScrubber
      : false;

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        tabIndex={playback.provider === "youtube" ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onMouseMove={phase === "playing" ? scheduleHideControls : undefined}
        onMouseLeave={() => {
          if (phase === "playing" && !isDraggingScrubber) {
            setControlsVisible(false);
          }
        }}
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#0B0E17] border border-[var(--border-subtle)] ring-1 ring-white/5 shadow-[var(--card-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light group/video"
      >
        {!playback.provider ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#121622] via-[#0B0E17] to-[#121622]">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF885C] mb-3">
              <PortalSymbol size={32} className="opacity-60" />
            </div>
            <p className="font-sans text-sm sm:text-base text-slate-200/80">
              {t("lecteur.videoIndisponible")}
            </p>
          </div>
        ) : playback.provider === "tiktok" ? (
          !playback.playableInIframe && playback.externalUrl ? (
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
          ) : tikTokPlaying && playback.embedUrl ? (
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
              <div className="relative z-10 max-w-xl mb-6 space-y-2">
                <div className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-[#FF885C]">
                  <span>{badgeLabel || "TikTok"}</span>
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
                onClick={() => setTikTokPlaying(true)}
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
          )
        ) : phase === "poster" ? (
          /* Poster d'accueil épuré Bayondy (zéro interface YouTube avant le clic) */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0B0E17]">
            {resolvedPoster && !posterFailed && (
              <Image
                src={resolvedPoster}
                alt={lessonTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                referrerPolicy="no-referrer"
                onError={() => setPosterFailed(true)}
                className="object-cover opacity-35 scale-[1.02] transition-transform duration-700 group-hover/video:scale-[1.04]"
              />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#0B0E17]/88 via-[#0B0E17]/72 to-[#FF5B22]/18 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-noise opacity-35 pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-xl mb-6 space-y-2">
              <div className="inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-[#FF885C]">
                <span>{badgeLabel || t("hero.apercu.badge")}</span>
                {formattedDuration && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-slate-200/85 normal-case tabular-nums">
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
              onClick={togglePlay}
              aria-label={`${t("lecteur.lancerVideo")}: ${lessonTitle}`}
              className="relative z-10 group flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 min-h-[44px] min-w-[44px] rounded-full bg-brand hover:bg-brand-dark dark:hover:bg-brand-light text-[var(--brand-fg)] shadow-2xl shadow-[var(--brand-glow)] transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/50 cursor-pointer"
            >
              <Play
                className="w-7 h-7 sm:w-8 sm:h-8 translate-x-0.5 fill-current transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
            </button>

            <p className="relative z-10 mt-4 font-sans text-xs sm:text-sm text-slate-200/85">
              {t("lecteur.lancerVideo")}
            </p>
          </div>
        ) : phase === "fallback" ? (
          /* Repli iframe propre si le script YouTube IFrame API est bloqué */
          <iframe
            src={buildYouTubeEmbedUrl(playback.videoId, {
              autoplay: true,
              controls: true,
              enableJsApi: false,
            })}
            title={lessonTitle || t("hero.apercu.badge")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          /* Lecteur YouTube sans chrome natif + contrôles Bayondy sur mesure */
          <div className="relative w-full h-full bg-[#0B0E17]">
            {/* Iframe YouTube non interactive (supprime les menus Partager / Regarder plus tard / titre au survol) */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <div ref={ytMountRef} className="w-full h-full" />
            </div>

            {/* Zone cliquable pour Play/Pause & double-clic plein écran */}
            <div
              onClick={togglePlay}
              onDoubleClick={toggleFullscreen}
              className="absolute inset-0 z-10 cursor-pointer"
              aria-hidden="true"
            />

            {/* Chargement initial avant première image */}
            {phase === "loading" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0B0E17]/95 text-slate-200 pointer-events-none">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF885C]" aria-hidden="true" />
                <span className="font-mono text-xs tracking-wider text-slate-300/80">
                  {t("lecteur.chargementVideo")}
                </span>
              </div>
            )}

            {/* Écran de pause Bayondy : masque totalement les suggestions YouTube en pause */}
            {phase === "paused" && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#0B0E17]/75 backdrop-blur-[3px] cursor-pointer"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  aria-label={t("lecteur.lecture")}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-brand hover:bg-brand-dark text-[var(--brand-fg)] shadow-2xl shadow-[var(--brand-glow)] transition-transform hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/50"
                >
                  <Play className="w-7 h-7 translate-x-0.5 fill-current" aria-hidden="true" />
                </button>
                <p className="mt-4 font-display font-semibold text-base sm:text-lg text-slate-100 max-w-md line-clamp-1">
                  {lessonTitle}
                </p>
                <span className="mt-1 font-mono text-xs text-slate-300/75 tabular-nums">
                  {formatPlaybackTime(currentTimeSec)} / {formatPlaybackTime(durationSec)}
                </span>
              </div>
            )}

            {/* Écran de fin Bayondy : masque totalement l'écran de recommandations YouTube */}
            {phase === "ended" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#0B0E17]/92 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-active)] border border-[#FF5B22]/45 flex items-center justify-center text-[#FF885C] mb-3">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#FF885C] mb-1">
                  {t("lecteur.leconTermineeOverlay")}
                </span>
                <h3 className="font-display font-semibold text-lg sm:text-xl text-slate-100 max-w-md line-clamp-2 mb-5">
                  {lessonTitle}
                </h3>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="min-h-[44px] px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/16 border border-white/15 text-slate-100 font-sans font-medium text-xs sm:text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{t("lecteur.revoirLecon")}</span>
                  </button>

                  {onNextLesson && (
                    <button
                      type="button"
                      onClick={onNextLesson}
                      className="min-h-[44px] px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark text-[var(--brand-fg)] font-sans font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-[var(--brand-glow)] transition-all whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                    >
                      <span>{nextLessonTitle || t("lecteur.suivant")}</span>
                      <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Barre de contrôle Bayondy sur mesure */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute inset-x-0 bottom-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/65 to-transparent transition-opacity duration-200 ${
                showControlsBar ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="rounded-xl bg-black/55 backdrop-blur-md border border-white/12 px-3 py-2 space-y-2">
                {/* Barre de progression interactive */}
                <div
                  ref={scrubberRef}
                  role="slider"
                  tabIndex={0}
                  aria-label={t("lecteur.barreProgressionVideo")}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(durationSec)}
                  aria-valuenow={Math.round(currentTimeSec)}
                  onPointerDown={(e) => {
                    setIsDraggingScrubber(true);
                    seekToClientX(e.clientX);
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (isDraggingScrubber) {
                      seekToClientX(e.clientX);
                    }
                  }}
                  onPointerUp={(e) => {
                    if (isDraggingScrubber) {
                      setIsDraggingScrubber(false);
                      try {
                        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                      } catch {
                        // ignore
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      seekBy(-5);
                    } else if (e.key === "ArrowRight") {
                      e.preventDefault();
                      seekBy(5);
                    }
                  }}
                  className="group/scrub relative py-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] rounded"
                >
                  <div className="relative h-1.5 bg-white/15 rounded-full overflow-visible">
                    <div
                      className="absolute inset-y-0 left-0 bg-white/25 rounded-full pointer-events-none"
                      style={{ width: `${bufferedPct}%` }}
                    />
                    <div
                      className="relative h-full bg-gradient-to-r from-[#E54813] via-[#FF5B22] to-[#FF9269] rounded-full transition-[width] duration-75"
                      style={{ width: `${progressPct}%` }}
                    >
                      <span
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white ring-2 ring-[#FF5B22] shadow-[0_0_8px_rgba(255,91,34,0.9)] opacity-90 group-hover/scrub:scale-125 transition-transform"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {/* Boutons de transport */}
                <div className="flex items-center justify-between gap-2 text-zinc-100">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={
                        phase === "playing" ? t("lecteur.pause") : t("lecteur.lecture")
                      }
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-white hover:bg-white/12 hover:text-[#FF885C] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                    >
                      {phase === "playing" ? (
                        <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                      ) : (
                        <Play className="w-4 h-4 translate-x-[0.5px] fill-current" aria-hidden="true" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => seekBy(-10)}
                      aria-label={t("lecteur.reculer10s")}
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-zinc-200 hover:bg-white/12 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => seekBy(10)}
                      aria-label={t("lecteur.avancer10s")}
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-zinc-200 hover:bg-white/12 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                    >
                      <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <div className="hidden sm:flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={toggleMute}
                        aria-label={t("lecteur.volume")}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-zinc-200 hover:bg-white/12 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-[#FF885C]" aria-hidden="true" />
                        ) : (
                          <Volume2 className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        aria-label={t("lecteur.volume")}
                        className="w-16 accent-[#FF5B22] cursor-pointer h-1"
                      />
                    </div>

                    <span className="font-mono text-[11px] sm:text-xs text-zinc-200 tabular-nums ml-1 truncate">
                      {formatPlaybackTime(currentTimeSec)}{" "}
                      <span className="text-zinc-400">
                        / {formatPlaybackTime(durationSec)}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={cyclePlaybackSpeed}
                      aria-label={`${t("lecteur.vitesseLecture")} ${playbackSpeed}x`}
                      className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/18 border border-white/15 font-mono text-[11px] font-medium text-zinc-100 transition-colors cursor-pointer tabular-nums whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                    >
                      {playbackSpeed}x
                    </button>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={
                        isFullscreen
                          ? t("lecteur.quitterPleinEcran")
                          : t("lecteur.pleinEcran")
                      }
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-zinc-200 hover:bg-white/12 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C]"
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Maximize className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
