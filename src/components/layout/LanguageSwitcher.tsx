"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { AppLang } from "@/lib/i18n/config";
import {
  buildSwitchLanguageUrl,
  shouldBypassLocalePrefix,
} from "@/lib/i18n/routing";

interface LanguageSwitcherProps {
  variant?: "dropdown" | "segmented";
  className?: string;
  onAfterSelect?: () => void;
}

const LANGUAGE_OPTIONS: Array<{
  lang: AppLang;
  htmlLang: "fr" | "ht";
  label: string;
  shortCode: string;
}> = [
  { lang: "fr", htmlLang: "fr", label: "Français", shortCode: "FR" },
  { lang: "kr", htmlLang: "ht", label: "Kreyòl ayisyen", shortCode: "KR" },
];

export function LanguageSwitcher({
  variant = "dropdown",
  className = "",
  onAfterSelect,
}: LanguageSwitcherProps) {
  const { lang, setLangCookie, setActiveLang, t } = useI18n();
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const open = openPathname === pathname;
  const setOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setOpenPathname((prevPath) => {
      const currentOpen = prevPath === pathname;
      const nextOpen = typeof next === "function" ? next(currentOpen) : next;
      return nextOpen ? pathname : null;
    });
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenPathname(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenPathname(null);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelectLanguage = (targetLang: AppLang) => {
    setOpen(false);

    if (shouldBypassLocalePrefix(pathname)) {
      setActiveLang(targetLang);
      onAfterSelect?.();
      return;
    }

    setLangCookie(targetLang);

    if (targetLang === lang) {
      onAfterSelect?.();
      return;
    }

    const search =
      typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const targetUrl = buildSwitchLanguageUrl(
      `${pathname}${search}${hash}`,
      targetLang
    );

    onAfterSelect?.();
    router.push(targetUrl);
  };

  const handleMenuKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = (index + 1) % LANGUAGE_OPTIONS.length;
      optionRefs.current[next]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev =
        (index - 1 + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length;
      optionRefs.current[prev]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      optionRefs.current[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      optionRefs.current[LANGUAGE_OPTIONS.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label={t("langue.label")}
        className={`inline-grid grid-cols-2 items-center p-1 rounded-full bg-[var(--surface-well)] border border-[var(--border-subtle)] ${className}`.trim()}
      >
        {LANGUAGE_OPTIONS.map((option) => {
          const isCurrent = lang === option.lang;
          return (
            <button
              key={option.lang}
              type="button"
              lang={option.htmlLang}
              onClick={() => handleSelectLanguage(option.lang)}
              aria-current={isCurrent ? "true" : undefined}
              className={`min-h-[44px] px-3.5 py-2 rounded-full font-sans text-xs sm:text-sm font-medium inline-flex items-center justify-center transition-all duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                isCurrent
                  ? "bg-brand text-[var(--brand-fg)] shadow-xs font-semibold"
                  : "text-slate-700 dark:text-ice-white/75 hover:text-ice-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  const activeCode = lang === "kr" ? t("langue.codeKr") : t("langue.codeFr");

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => optionRefs.current[0]?.focus());
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("langue.choisir")}
        className="min-h-[44px] px-3 py-2 rounded-full border border-[var(--border-strong)] bg-white dark:bg-[var(--surface-glass)] dark:backdrop-blur-md hover:border-brand/55 text-ice-white font-mono text-xs font-semibold inline-flex items-center gap-1.5 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.12)] dark:shadow-none transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
      >
        <Globe className="w-3.5 h-3.5 text-brand-light shrink-0" strokeWidth={2} aria-hidden="true" />
        <span>{activeCode}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-ice-white/60 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t("langue.choisir")}
          className="absolute right-0 mt-2 w-48 rounded-2xl surface-glass border border-[var(--border-strong)] bg-deep-navy shadow-xl p-1.5 z-50"
        >
          {LANGUAGE_OPTIONS.map((option, idx) => {
            const isCurrent = lang === option.lang;
            return (
              <button
                key={option.lang}
                ref={(el) => {
                  optionRefs.current[idx] = el;
                }}
                type="button"
                role="menuitem"
                lang={option.htmlLang}
                aria-current={isCurrent ? "true" : undefined}
                onClick={() => handleSelectLanguage(option.lang)}
                onKeyDown={(event) => handleMenuKeyDown(event, idx)}
                className={`w-full min-h-[44px] px-3 py-2 rounded-xl font-sans text-sm flex items-center justify-between gap-2 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                  isCurrent
                    ? "bg-brand/12 text-brand-light font-semibold"
                    : "text-ice-white hover:bg-[var(--surface-subtle)]"
                }`}
              >
                <span>{option.label}</span>
                {isCurrent && (
                  <Check className="w-4 h-4 text-brand-light shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
