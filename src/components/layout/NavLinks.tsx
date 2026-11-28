"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "@/lib/i18n";

export function NavLinks() {
  const pathname = usePathname();

  const items = [
    {
      href: "/formations",
      label: t("nav.formations"),
      isActive: pathname === "/formations" || pathname.startsWith("/formations/"),
    },
    {
      href: "/#kijan",
      label: t("nav.kijan"),
      isActive: false,
    },
    {
      href: "/a-propos",
      label: t("nav.apropos"),
      isActive: pathname === "/a-propos",
    },
    {
      href: "/#faq",
      label: t("nav.faq"),
      isActive: pathname === "/faq",
    },
  ];

  return (
    <nav
      className="hidden md:flex items-center gap-7 lg:gap-9"
      aria-label={t("nav.menu")}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.isActive ? "page" : undefined}
          className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:transition-transform after:duration-200 after:origin-center ${
            item.isActive
              ? "text-ice-white after:bg-[var(--home-orange)] after:scale-x-100"
              : "text-slate-600 dark:text-ice-white/70 hover:text-ice-white after:bg-[var(--home-orange-light)]/75 after:scale-x-0 hover:after:scale-x-100"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default NavLinks;
