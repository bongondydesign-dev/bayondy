"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import type { PublicPreviewLesson } from "@/types/firestore";
import { CoverImage } from "@/components/ui/CoverImage";
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
      <CoverImage
        src={coverUrl}
        alt={`${t("catalogue.couvertureAlt")} ${courseTitle}`}
        priority
        sizes="(max-width: 1024px) 100vw, 800px"
        className="rounded-2xl border border-[var(--border-subtle)] shadow-[var(--card-shadow)]"
        accent="ion"
        symbolSize={72}
        showBrandCaption
      />

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
