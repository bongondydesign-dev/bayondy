import Link from "next/link";
import React from "react";

export interface ButtonProps {
  variant?: "principal" | "secondaire";
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
    "group inline-flex items-center justify-center gap-2.5 font-medium text-sm px-5 py-2.5 rounded-full min-h-[44px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian active:scale-[0.98] select-none whitespace-nowrap";

  const variantStyles =
    variant === "principal"
      ? "bg-brand text-[#07080A] font-semibold hover:bg-brand-light hover:-translate-y-0.5 shadow-lg shadow-[var(--brand-glow)]"
      : "border border-white/[0.12] bg-[#13151B] text-ice-white hover:border-brand/50 hover:bg-[#191C24] hover:-translate-y-0.5";

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
