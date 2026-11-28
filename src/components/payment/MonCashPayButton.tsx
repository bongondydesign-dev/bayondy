"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import {
  MONCASH_BUTTON_GRADIENT,
  MONCASH_BUTTON_IMAGE_SRC,
  MONCASH_IMAGE_CROP_STYLE,
  MONCASH_MARK_SIZES,
  MONCASH_SEAMLESS_MASK_STYLE,
  type MonCashMarkSize,
  formatMonCashAmountHTG,
} from "@/lib/moncash/buttonDisplay";

interface MonCashMarkProps {
  size?: MonCashMarkSize;
  seamless?: boolean;
  className?: string;
}

export function MonCashMark({
  size = "sm",
  seamless = false,
  className = "",
}: MonCashMarkProps) {
  return (
    <span
      className={`relative inline-block overflow-hidden rounded-full shrink-0 select-none ${MONCASH_MARK_SIZES[size].className} ${className}`.trim()}
      style={seamless ? MONCASH_SEAMLESS_MASK_STYLE : undefined}
    >
      <Image
        src={MONCASH_BUTTON_IMAGE_SRC}
        alt="Pay MonCash"
        width={1280}
        height={720}
        referrerPolicy="no-referrer"
        className="max-w-none pointer-events-none select-none"
        style={MONCASH_IMAGE_CROP_STYLE}
      />
    </span>
  );
}

interface MonCashPayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  amountHTG?: number | null;
  className?: string;
}

export function MonCashPayButton({
  onClick,
  disabled = false,
  loading = false,
  amountHTG,
  className = "",
}: MonCashPayButtonProps) {
  const { t } = useI18n();
  const formattedAmount = formatMonCashAmountHTG(amountHTG);

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        aria-label={
          loading ? t("paiement.redirection") : t("paiement.payerMonCash")
        }
        style={{ backgroundImage: MONCASH_BUTTON_GRADIENT }}
        className="group relative w-full h-[56px] min-h-[56px] rounded-full overflow-hidden border border-white/25 text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.40),inset_0_-1px_0_rgba(0,0,0,0.28),0_14px_30px_-10px_rgba(214,0,42,0.52)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.48),inset_0_-1px_0_rgba(0,0,0,0.32),0_18px_36px_-8px_rgba(230,0,45,0.68)] active:scale-[0.985] disabled:opacity-65 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d6d] focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
      >
        {/* Reflet subtil au survol */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(105deg, transparent 22%, rgba(255,255,255,0.14) 50%, transparent 78%)",
          }}
          aria-hidden="true"
        />

        {loading ? (
          <span className="relative z-10 inline-flex items-center justify-center gap-2.5 px-5 font-sans font-semibold text-sm sm:text-base text-white">
            <span
              className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin shrink-0"
              aria-hidden="true"
            />
            <span>{t("paiement.redirection")}</span>
          </span>
        ) : (
          <MonCashMark
            size="lg"
            seamless
            className="relative z-10 transition-transform duration-200 group-hover:scale-[1.02]"
          />
        )}
      </button>

      <div className="flex items-center justify-between gap-2 px-0.5 text-xs text-slate-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5 min-w-0 font-sans">
          <ShieldCheck
            className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">
            {t("paiement.payerMonCash")} · {t("bento.badgeAcces")}
          </span>
        </span>
        {formattedAmount && (
          <span className="font-mono text-[11px] font-semibold text-ice-white tabular-nums whitespace-nowrap shrink-0">
            {formattedAmount}
          </span>
        )}
      </div>
    </div>
  );
}

export default MonCashPayButton;
