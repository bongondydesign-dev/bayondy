"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { t } from "@/lib/i18n";

interface StudentShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

function StudentSidebarLinks({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "/mes-formations";

  const learnLinks = [
    {
      href: "/mes-formations",
      label: t("mesFormations.navTableau"),
      active: pathname === "/mes-formations" || pathname.startsWith("/mes-formations/"),
      Icon: LayoutDashboard,
    },
    {
      href: "/formations",
      label: t("mesFormations.navCatalogue"),
      active: pathname === "/formations" || pathname.startsWith("/formations/"),
      Icon: BookOpen,
    },
  ];

  const accountLinks = [
    {
      href: "/profil",
      label: t("mesFormations.navProfil"),
      active: pathname === "/profil",
      Icon: User,
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: t("mesFormations.navAdmin"),
            active: pathname.startsWith("/admin"),
            Icon: ShieldCheck,
          },
        ]
      : []),
    {
      href: "/",
      label: t("mesFormations.retourSite"),
      active: false,
      Icon: ArrowLeft,
    },
  ];

  return (
    <nav
      className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6"
      aria-label={t("nav.menu")}
    >
      <div className="space-y-1.5">
        <p className="px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ice-white/45">
          {t("mesFormations.navApprendre")}
        </p>
        <div className="space-y-1">
          {learnLinks.map(({ href, label, active, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 font-sans text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                active
                  ? "bg-[#0F172A] text-white dark:bg-brand dark:text-[var(--brand-fg)] shadow-sm"
                  : "text-slate-600 dark:text-ice-white/75 hover:text-ice-white hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? "text-[#FF5B22] dark:text-[#07080A]" : "text-ice-white/55"
                }`}
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ice-white/45">
          {t("mesFormations.navCompte")}
        </p>
        <div className="space-y-1">
          {accountLinks.map(({ href, label, active, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 font-sans text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                active
                  ? "bg-[#0F172A] text-white dark:bg-brand dark:text-[var(--brand-fg)] shadow-sm"
                  : "text-slate-600 dark:text-ice-white/75 hover:text-ice-white hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? "text-[#FF5B22] dark:text-[#07080A]" : "text-ice-white/55"
                }`}
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function StudentShell({
  children,
  pageTitle,
  pageSubtitle,
}: StudentShellProps) {
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      setSigningOut(false);
    }
  };

  const displayName = user?.displayName || user?.email || "BAYONDY";
  const initial = displayName.charAt(0).toUpperCase();

  const sidebarContent = (onNavigate?: () => void) => (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0">
        <Link
          href="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-ice-white hover:text-brand-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg py-1"
        >
          <span
            className="w-7 h-7 rounded-lg bg-brand text-[var(--brand-fg)] inline-flex items-center justify-center font-display font-bold text-sm shadow-sm shadow-[var(--brand-glow)] shrink-0"
            aria-hidden="true"
          >
            B
          </span>
          <span>{t("accueil.titre")}</span>
        </Link>
      </div>

      <Suspense fallback={<div className="flex-1 px-3.5 py-5" />}>
        <StudentSidebarLinks isAdmin={isAdmin} onNavigate={onNavigate} />
      </Suspense>

      <div className="p-3.5 border-t border-[var(--border-subtle)] shrink-0">
        {user ? (
          <div className="p-2.5 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center gap-2.5">
            <Link
              href="/profil"
              onClick={onNavigate}
              className="flex-1 min-w-0 flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
            >
              <div className="w-9 h-9 rounded-full bg-brand/15 border border-brand/35 text-brand-light font-display font-bold text-sm flex items-center justify-center shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-xs text-ice-white truncate">
                  {displayName}
                </p>
                {user.email && (
                  <p className="font-mono text-[11px] text-ice-white/55 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label={t("profil.boutonDeconnexion")}
              title={t("profil.boutonDeconnexion")}
              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl border border-[var(--border-subtle)] bg-deep-navy hover:border-red-400/50 text-ice-white/70 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div
            className="h-14 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-transparent text-ice-white overflow-x-clip">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[var(--surface-sidebar)] border-r border-[var(--border-subtle)] sticky top-0 h-screen">
        {sidebarContent()}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.menu")}
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[82vw] h-full bg-deep-navy border-r border-[var(--border-strong)] shadow-2xl flex flex-col">
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={t("nav.fermer")}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-ice-white flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {sidebarContent(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 bg-[var(--surface-nav)] backdrop-blur-md border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("nav.menu")}
              className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-subtle)] text-ice-white flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              {pageSubtitle && (
                <p className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.14em] text-ice-white/50 truncate">
                  {pageSubtitle}
                </p>
              )}
              <p className="font-display font-bold text-base sm:text-lg text-ice-white truncate">
                {pageTitle || t("mesFormations.titre")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />
            <Link
              href="/formations"
              className="min-h-[44px] px-4 py-2 rounded-full bg-deep-navy border border-[var(--border-strong)] hover:border-brand/50 text-ice-white font-sans font-medium text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{t("mesFormations.boutonDecouvrir")}</span>
              <span className="sm:hidden">{t("nav.formations")}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
