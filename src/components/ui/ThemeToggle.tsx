"use client";

import React, { useSyncExternalStore } from "react";
import { MonitorSmartphone, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { t } from "@/lib/i18n";

interface ThemeToggleProps {
  className?: string;
  variant?: "bordered" | "ghost" | "segmented";
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "", variant = "bordered" }: ThemeToggleProps) {
  const { theme, preference, toggleTheme, setPreference } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isLight = mounted && theme === "light";
  const activePreference = mounted ? preference : "system";
  const label = isLight ? t("theme.passerSombre") : t("theme.passerClair");

  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label={t("theme.label")}
        className={`inline-flex items-center p-1 rounded-full bg-[var(--surface-well)] border border-[var(--border-subtle)] shrink-0 ${className}`.trim()}
      >
        <button
          type="button"
          onClick={() => setPreference("system")}
          aria-label={t("theme.passerSysteme")}
          title={t("theme.passerSysteme")}
          aria-pressed={activePreference === "system"}
          className={`w-8 h-8 min-w-[32px] min-h-[32px] rounded-full inline-flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
            activePreference === "system"
              ? "bg-deep-navy text-ice-white shadow-xs border border-[var(--border-subtle)]"
              : "text-slate-600 dark:text-ice-white/55 hover:text-ice-white"
          }`}
        >
          <MonitorSmartphone className="w-3.5 h-3.5" strokeWidth={2.1} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setPreference("light")}
          aria-label={t("theme.passerClair")}
          title={t("theme.passerClair")}
          aria-pressed={activePreference === "light"}
          className={`w-8 h-8 min-w-[32px] min-h-[32px] rounded-full inline-flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
            activePreference === "light"
              ? "bg-deep-navy text-ice-white shadow-xs border border-[var(--border-subtle)]"
              : "text-slate-600 dark:text-ice-white/55 hover:text-ice-white"
          }`}
        >
          <Sun className="w-3.5 h-3.5" strokeWidth={2.1} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setPreference("dark")}
          aria-label={t("theme.passerSombre")}
          title={t("theme.passerSombre")}
          aria-pressed={activePreference === "dark"}
          className={`w-8 h-8 min-w-[32px] min-h-[32px] rounded-full inline-flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
            activePreference === "dark"
              ? "bg-[var(--surface-elevated)] text-ice-white shadow-xs border border-[var(--border-subtle)]"
              : "text-slate-600 dark:text-ice-white/55 hover:text-ice-white"
          }`}
        >
          <Moon className="w-3.5 h-3.5" strokeWidth={2.1} aria-hidden="true" />
        </button>
      </div>
    );
  }

  const variantClasses =
    variant === "ghost"
      ? "w-11 h-11 md:w-9 md:h-9 min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] rounded-xl border border-[var(--border-subtle)] bg-white dark:border-transparent dark:bg-transparent shadow-2xs dark:shadow-none hover:border-[var(--border-strong)] hover:bg-slate-50 dark:hover:bg-[var(--surface-glass)] text-slate-800 dark:text-ice-white/75 hover:text-ice-white"
      : "w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[var(--border-strong)] bg-white dark:bg-[var(--surface-glass)] dark:backdrop-blur-md hover:border-[var(--home-orange-vivid)]/70 hover:bg-slate-50 dark:hover:bg-white/10 text-ice-white hover:text-[var(--home-orange-light)] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.12)] dark:shadow-none";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isLight}
      className={`inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] active:scale-95 shrink-0 cursor-pointer ${variantClasses} ${className}`.trim()}
    >
      <motion.span
        key={isLight ? "moon" : "sun"}
        initial={{ rotate: -25, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center justify-center"
      >
        {isLight ? (
          <Moon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Sun className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        )}
      </motion.span>
    </button>
  );
}

export default ThemeToggle;
