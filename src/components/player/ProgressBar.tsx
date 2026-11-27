import React from "react";
import { t } from "@/lib/i18n";

interface ProgressBarProps {
  completedCount: number;
  totalCount: number;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md";
}

export function ProgressBar({
  completedCount,
  totalCount,
  className = "",
  showText = true,
  size = "md",
}: ProgressBarProps) {
  const safeTotal = Math.max(0, totalCount);
  const safeCompleted = Math.min(Math.max(0, completedCount), safeTotal);
  const percentage =
    safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  const barHeight = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showText && (
        <div className="flex items-center justify-between text-xs font-mono text-ice-white/70">
          <span>{t("mesFormations.progression")}</span>
          <span className="font-semibold text-brand-light tabular-nums">
            {safeCompleted}/{safeTotal} ({percentage}%)
          </span>
        </div>
      )}

      <div
        className={`w-full ${barHeight} rounded-full bg-[var(--surface-well)] border border-[var(--border-subtle)] overflow-hidden`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${t("mesFormations.progression")}: ${percentage}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-brand-dark to-brand transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
