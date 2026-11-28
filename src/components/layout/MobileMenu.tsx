"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { AuthNav } from "@/components/auth/AuthNav";
import { t } from "@/lib/i18n";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const links = [
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
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label={open ? t("nav.fermer") : t("nav.menu")}
        className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl border border-[var(--border-subtle)] bg-deep-navy dark:bg-[var(--surface-subtle)] text-ice-white hover:border-[var(--home-orange)]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] active:scale-95 cursor-pointer"
      >
        {open ? (
          <X
            className="w-5 h-5 text-[var(--home-orange-light)]"
            strokeWidth={2}
            aria-hidden="true"
          />
        ) : (
          <Menu className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            id="mobile-nav-drawer"
            aria-label={t("nav.menu")}
            className="fixed inset-x-0 top-16 z-50 border-b border-[var(--border-subtle)] bg-[var(--deep-navy)] px-4 pb-5 pt-3 shadow-[var(--card-shadow-hover)]"
          >
            <div className="divide-y divide-[var(--border-faint)]">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={item.isActive ? "page" : undefined}
                  className={`min-h-[48px] flex items-center justify-between px-2 font-medium text-sm transition-colors ${
                    item.isActive
                      ? "text-[var(--home-orange-light)] font-semibold"
                      : "text-ice-white hover:text-[var(--home-orange-light)]"
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowRight
                    className={`w-4 h-4 ${
                      item.isActive
                        ? "text-[var(--home-orange-light)]"
                        : "text-slate-400 dark:text-ice-white/40"
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <AuthNav mobile onNavigate={() => setOpen(false)} />
            </div>
          </nav>
        </>
      )}
    </div>
  );
}

export default MobileMenu;
