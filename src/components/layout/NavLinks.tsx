"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { stripLocalePrefix } from "@/lib/i18n/routing";

export function NavLinks() {
  const { t, localize } = useI18n();
  const pathname = usePathname() || "/";
  const cleanPath = stripLocalePrefix(pathname);

  const items = [
    {
      href: localize("/formations"),
      label: t("nav.formations"),
      isActive: cleanPath === "/formations" || cleanPath.startsWith("/formations/"),
    },
    {
      href: localize("/#kijan"),
      label: t("nav.kijan"),
      isActive: false,
    },
    {
      href: localize("/a-propos"),
      label: t("nav.apropos"),
      isActive: cleanPath === "/a-propos",
    },
    {
      href: localize("/faq"),
      label: t("nav.faq"),
      isActive: cleanPath === "/faq",
    },
  ];

  return (
    <nav
      className="hidden lg:flex items-center gap-1 xl:gap-1.5 px-2 py-1 rounded-full bg-white dark:bg-[var(--surface-glass)] border border-[var(--border-strong)] dark:border-[var(--border-subtle)] shadow-[0_2px_10px_-2px_rgba(15,23,42,0.10)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:backdrop-blur-md"
      aria-label={t("nav.menu")}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.isActive ? "page" : undefined}
          className={`relative px-3.5 lg:px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] ${
            item.isActive
              ? "text-white dark:text-[#07080A] font-semibold"
              : "text-slate-700 dark:text-ice-white/75 hover:text-ice-white hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06]"
          }`}
        >
          {item.isActive && (
            <motion.span
              layoutId="nav-active-pill"
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="absolute inset-0 rounded-full bg-[#0F1219] dark:bg-[var(--home-orange)] shadow-xs"
              aria-hidden="true"
            />
          )}
          <span className="relative z-10">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default NavLinks;
