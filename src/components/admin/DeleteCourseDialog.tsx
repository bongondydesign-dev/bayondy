"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { t } from "@/lib/i18n";

interface DeleteCourseDialogProps {
  open: boolean;
  courseTitle: string;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteCourseDialog({
  open,
  courseTitle,
  deleting,
  error,
  onCancel,
  onConfirm,
}: DeleteCourseDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, deleting, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-course-dialog-title"
    >
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        onClick={() => {
          if (!deleting) onCancel();
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-deep-navy border border-[var(--border-strong)] shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/12 border border-red-200 dark:border-red-500/25 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            aria-label={t("nav.fermer")}
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-well)] text-ice-white/70 hover:text-ice-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-2">
          <h2
            id="delete-course-dialog-title"
            className="font-display font-bold text-lg text-ice-white"
          >
            {t("admin.formations.confirmSupprimerTitre")}
          </h2>
          {courseTitle && (
            <p className="font-sans font-semibold text-sm text-brand-light break-words">
              {courseTitle}
            </p>
          )}
          <p className="font-sans text-sm text-ice-white/70 leading-relaxed">
            {t("admin.formations.confirmSupprimerDesc")}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300 text-xs sm:text-sm"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2 border-t border-[var(--border-faint)]">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="min-h-[44px] px-5 py-2 rounded-full bg-[var(--surface-well)] border border-[var(--border-strong)] hover:border-brand/40 text-ice-white font-sans font-medium text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("admin.annuler")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="min-h-[44px] px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-sans font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              {deleting
                ? t("admin.formations.suppression")
                : t("admin.formations.supprimer")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
