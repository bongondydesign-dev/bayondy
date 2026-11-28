"use client";

import React from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import type { PublicPreviewLesson } from "@/types/firestore";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { SITE_NAME } from "@/lib/site";
import { useI18n } from "@/lib/i18n/I18nProvider";

interface CoursePreviewPlayerProps {
  courseTitle: string;
  coverUrl: string | null;
  previewLessons?: PublicPreviewLesson[];
}

export function CoursePreviewPlayer({
  courseTitle,
  coverUrl,
}: CoursePreviewPlayerProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[var(--surface-well)] border border-[var(--border-subtle)] shadow-[var(--card-shadow)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={courseTitle}
            fill
            priority
            referrerPolicy="no-referrer"
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0E17] p-6 text-center">
            <div
              className="absolute inset-0 pointer-events-none opacity-80"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(255, 91, 34, 0.22) 0%, rgba(255, 91, 34, 0.05) 42%, transparent 72%)",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-noise opacity-35"
              aria-hidden="true"
            />
            <PortalSymbol size={72} className="relative z-10 opacity-90" />
            <span className="relative z-10 mt-4 font-mono text-xs tracking-wider text-slate-300/70">
              {SITE_NAME}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl surface-glass border border-[var(--border-subtle)]">
        <span className="font-sans text-xs sm:text-sm text-slate-700 dark:text-ice-white/75 truncate">
          {courseTitle}
        </span>
        <a
          href="#programme"
          className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-[var(--surface-well)] hover:bg-[var(--surface-well)] dark:hover:bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs font-sans font-medium text-brand-light inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
        >
          <span>{t("catalogue.programme")}</span>
          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
