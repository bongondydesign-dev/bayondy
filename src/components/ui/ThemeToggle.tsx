"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { t } from "@/lib/i18n";

interface ThemeToggleProps {
  className?: string;
  variant?: "bordered" | "ghost";
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "", variant = "bordered" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isLight = mounted && theme === "light";
  const label = isLight ? t("theme.passerSombre") : t("theme.passerClair");

  const variantClasses =
    variant === "ghost"
      ? "w-11 h-11 md:w-9 md:h-9 min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] rounded-xl border border-transparent hover:border-[var(--border-subtle)] bg-transparent hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] text-slate-600 dark:text-ice-white/75 hover:text-ice-white"
      : "w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[var(--border-strong)] bg-deep-navy dark:bg-[var(--surface-subtle)] hover:border-[var(--home-orange)]/60 hover:bg-[var(--surface-subtle)] dark:hover:bg-[var(--surface-elevated)] text-ice-white hover:text-[var(--home-orange-light)] shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isLight}
      className={`inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] active:scale-95 shrink-0 cursor-pointer ${variantClasses} ${className}`.trim()}
    >
      {isLight ? (
        <Moon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
      ) : (
        <Sun className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}

export default ThemeToggle;
