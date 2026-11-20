import Link from "next/link";
import React from "react";

export interface ButtonProps {
  variant?: "principal" | "secondaire";
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
    "inline-flex items-center justify-center font-medium text-sm sm:text-base px-6 py-2.5 rounded-lg min-h-[44px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian active:scale-[0.98] select-none";

  const variantStyles =
    variant === "principal"
      ? "bg-ion-blue text-ice-white hover:opacity-90 shadow-md shadow-ion-blue/25"
      : "border border-aurora text-aurora hover:bg-aurora/10 bg-transparent";

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
