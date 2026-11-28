"use client";

import React, { useState } from "react";
import Image from "next/image";
import { isRenderableAvatarSrc } from "@/lib/auth/avatar";
import { getUserInitials } from "@/lib/auth/profile";

type AvatarSize = "sm" | "md" | "lg" | "xl";
type AvatarShape = "circle" | "rounded";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: AvatarSize;
  shape?: AvatarShape;
  highlight?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, { box: string; text: string; sizesAttr: string }> = {
  sm: { box: "w-9 h-9", text: "text-xs", sizesAttr: "36px" },
  md: { box: "w-10 h-10", text: "text-sm", sizesAttr: "40px" },
  lg: { box: "w-16 h-16 sm:w-[72px] sm:h-[72px]", text: "text-xl sm:text-2xl", sizesAttr: "72px" },
  xl: { box: "w-20 h-20", text: "text-2xl", sizesAttr: "80px" },
};

export function UserAvatar({
  src,
  name,
  email,
  size = "md",
  shape = "circle",
  highlight = false,
  className = "",
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const initials = getUserInitials(name, email);
  const resolvedAlt = (name || email || "Bayondy").trim();
  const { box, text, sizesAttr } = SIZE_CLASSES[size];
  const radiusClass = shape === "circle" ? "rounded-full" : "rounded-2xl";
  const canRenderImage =
    isRenderableAvatarSrc(src) && failedSrc !== src;

  if (canRenderImage) {
    return (
      <div
        className={`relative ${box} ${radiusClass} overflow-hidden shrink-0 bg-[var(--surface-well)] ring-1 ring-[var(--border-strong)] ${className}`}
      >
        <Image
          src={src}
          alt={resolvedAlt}
          fill
          sizes={sizesAttr}
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${box} ${radiusClass} flex items-center justify-center shrink-0 font-display font-bold ${text} tracking-tight select-none border ${
        highlight
          ? "bg-gradient-to-br from-[#FF6A36]/25 via-brand/15 to-transparent border-brand/45 text-brand-light"
          : "bg-gradient-to-br from-brand/20 via-brand/8 to-[var(--surface-well)] border-brand/35 text-brand-light"
      } ${className}`}
    >
      <span aria-hidden="true">{initials}</span>
    </div>
  );
}
