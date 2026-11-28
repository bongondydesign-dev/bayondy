import Link from "next/link";
import React from "react";

export interface ButtonProps {
  variant?: "principal" | "secondaire" | "carbon";
  accent?: "brand" | "orange";
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  ariaLabel?: string;
}

export function Button({
  variant = "principal",
  href,
  children,
  className = "",
  type = "button",
  onClick,
  ariaLabel,
}: ButtonProps) {
  const baseStyles =
    "group inline-flex items-center justify-center gap-2.5 font-medium text-sm px-5 py-2.5 rounded-full min-h-[44px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian active:scale-[0.98] select-none whitespace-nowrap cursor-pointer";

  const variantStyles =
    variant === "principal"
      ? "bg-gradient-to-b from-[#FF5E24] to-brand dark:from-[#FF703D] dark:to-brand text-[var(--brand-fg)] font-semibold hover:brightness-105 hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_22px_-6px_var(--brand-glow)]"
      : variant === "carbon"
        ? "bg-[#0F1219] hover:bg-[#191E2A] text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-[#0B0D12] font-semibold hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_24px_-8px_rgba(15,23,42,0.35)]"
        : "border border-[var(--border-strong)] bg-white dark:bg-[var(--surface-glass)] dark:backdrop-blur-md text-ice-white hover:border-[var(--home-orange-vivid)]/75 hover:bg-slate-50 dark:hover:bg-[var(--surface-glass)] hover:-translate-y-0.5 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";

  const combinedClasses = `${baseStyles} ${variantStyles} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClasses} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export default Button;
