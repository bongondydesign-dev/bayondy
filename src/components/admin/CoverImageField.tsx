"use client";

import React, { useId, useRef, useState } from "react";
import Image from "next/image";
import {
  ImagePlus,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { adminFetch } from "@/lib/admin/apiClient";
import { isValidCoverUrl } from "@/lib/admin/cover";
import { prepareCoverDataUrl } from "@/lib/admin/coverClient";
import { t } from "@/lib/i18n";

interface CoverImageFieldProps {
  courseId?: string;
  value: string;
  courseTitle?: string;
  onChange: (nextUrl: string) => void;
  onPersisted?: (nextUrl: string | null) => Promise<void> | void;
}

export function CoverImageField({
  courseId,
  value,
  courseTitle,
  onChange,
  onPersisted,
}: CoverImageFieldProps) {
  const inputId = useId();
  const urlInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);

  const trimmed = value.trim();
  const hasValidPreview = isValidCoverUrl(trimmed) && failedPreviewUrl !== trimmed;

  const persistCourseCover = async (nextUrl: string | null) => {
    if (!courseId) return;
    const res = await adminFetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify({ coverUrl: nextUrl }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? t("admin.formations.coverUploadError"));
    }
    if (onPersisted) {
      await onPersisted(nextUrl);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setStatusMessage(null);
    setUploading(true);

    try {
      const prepared = await prepareCoverDataUrl(file);
      if (!prepared.ok) {
        if (prepared.code === "invalid_type") {
          setError(t("admin.formations.coverInvalidType"));
        } else if (prepared.code === "too_large") {
          setError(t("admin.formations.coverTooLarge"));
        } else {
          setError(t("admin.formations.coverUploadError"));
        }
        return;
      }

      const uploadRes = await adminFetch("/api/admin/covers", {
        method: "POST",
        body: JSON.stringify({ dataUrl: prepared.dataUrl }),
      });

      if (!uploadRes.ok) {
        const data = (await uploadRes.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? t("admin.formations.coverUploadError"));
        return;
      }

      const data = (await uploadRes.json()) as { url: string };
      setFailedPreviewUrl(null);
      onChange(data.url);

      if (courseId) {
        await persistCourseCover(data.url);
        setStatusMessage(t("admin.formations.coverSaved"));
      } else {
        setStatusMessage(t("admin.formations.coverReadyNew"));
      }
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : t("admin.formations.coverUploadError")
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleRemove = async () => {
    setError(null);
    setStatusMessage(null);
    setFailedPreviewUrl(null);
    onChange("");

    if (courseId) {
      setUploading(true);
      try {
        await persistCourseCover(null);
        setStatusMessage(t("admin.formations.coverRemoved"));
      } catch (err) {
        setError(
          err instanceof Error && err.message
            ? err.message
            : t("admin.formations.coverUploadError")
        );
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="font-mono text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/65 block"
        >
          {t("admin.formations.champCover")}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-slate-600 dark:text-ice-white/65 hover:text-brand-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-md px-1.5 py-0.5 cursor-pointer"
        >
          <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t("admin.formations.coverUrlToggle")}</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
      />

      {trimmed ? (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_1fr] gap-4 items-start p-4 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-strong)]">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-deep-navy border border-[var(--border-subtle)]">
            {hasValidPreview ? (
              <Image
                src={trimmed}
                alt={courseTitle ? `${t("admin.formations.champCover")} — ${courseTitle}` : t("admin.formations.champCover")}
                fill
                referrerPolicy="no-referrer"
                sizes="320px"
                className="object-cover"
                onError={() => setFailedPreviewUrl(trimmed)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-600 dark:text-ice-white/55">
                <span>{t("admin.formations.coverPreviewError")}</span>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white text-xs font-sans">
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>{t("admin.formations.coverUploadLoading")}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 min-w-0">
            <p className="font-sans text-xs text-slate-600 dark:text-ice-white/65 leading-relaxed">
              {t("admin.formations.coverUploadHint")}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-white dark:bg-[var(--surface-elevated)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] hover:border-brand/50 text-ice-white text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>{t("admin.formations.coverChange")}</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>{t("admin.formations.coverRemove")}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed transition-colors ${
            dragging
              ? "border-brand bg-brand/10"
              : "border-[var(--border-strong)] bg-[var(--surface-well)] hover:border-brand/45"
          }`}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full min-h-[148px] px-5 py-6 flex flex-col items-center justify-center gap-2.5 text-center cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-2xl"
          >
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface-active)] dark:bg-brand/15 border border-[var(--home-orange-vivid)]/40 dark:border-brand/30 text-brand-light flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <span className="font-sans font-semibold text-sm text-ice-white">
              {uploading
                ? t("admin.formations.coverUploadLoading")
                : t("admin.formations.coverUploadCta")}
            </span>
            <span className="font-sans text-xs text-slate-600 dark:text-ice-white/55">
              {t("admin.formations.coverUploadHint")}
            </span>
          </button>
        </div>
      )}

      {(showUrlInput || (trimmed && trimmed.startsWith("http"))) && (
        <div className="space-y-1.5">
          <label
            htmlFor={urlInputId}
            className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate-700 dark:text-ice-white/55 block"
          >
            {t("admin.formations.champCoverUrl")}
          </label>
          <input
            id={urlInputId}
            type="url"
            value={value}
            onChange={(e) => {
              setError(null);
              setStatusMessage(null);
              setFailedPreviewUrl(null);
              onChange(e.target.value);
            }}
            placeholder={t("admin.formations.champCoverUrlPlaceholder")}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[var(--surface-well)] shadow-2xs dark:shadow-none border border-[var(--border-strong)] text-ice-white placeholder:text-slate-500 dark:placeholder:text-ice-white/40 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-colors min-h-[46px]"
          />
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-xs"
        >
          {error}
        </div>
      )}

      {statusMessage && !error && (
        <div className="p-3 rounded-xl bg-[var(--surface-active)] dark:bg-brand/15 border border-[var(--home-orange-vivid)]/40 dark:border-brand/30 text-brand-light text-xs">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
