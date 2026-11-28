"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PortalSymbol } from "@/components/ui/PortalSymbol";
import { SITE_NAME } from "@/lib/site";

export interface CoverImageProps {
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  accent?: "brand" | "orange" | "ion";
  symbolSize?: number;
  showBrandCaption?: boolean;
}

export function CoverImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className = "",
  imageClassName = "object-cover",
  accent = "brand",
  symbolSize = 60,
  showBrandCaption = false,
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);
  const trimmedSrc = typeof src === "string" ? src.trim() : "";
  const shouldRenderImage = Boolean(trimmedSrc) && !failed;

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-[var(--surface-well)] ${className}`}
    >
      {shouldRenderImage ? (
        <Image
          src={trimmedSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          referrerPolicy="no-referrer"
          className={imageClassName}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#080B14] p-6 text-center"
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt === "" ? true : undefined}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-80"
            style={{
              background:
                "radial-gradient(circle at 80% 22%, rgba(55, 214, 208, 0.20) 0%, rgba(40, 100, 255, 0.14) 38%, transparent 70%)",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-noise opacity-35"
            aria-hidden="true"
          />
          <PortalSymbol
            accent={accent}
            size={symbolSize}
            className="relative z-10 opacity-95"
          />
          {showBrandCaption && (
            <span className="relative z-10 mt-4 font-mono text-xs tracking-wider text-[#E8EDF5]/75">
              {SITE_NAME}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default CoverImage;
