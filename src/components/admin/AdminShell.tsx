"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { t } from "@/lib/i18n";

function AccessDenied() {
  return (
    <div className="min-h-screen bg-transparent text-ice-white flex flex-col px-4">
      <meta name="robots" content="noindex" />
      <header className="h-16 max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-ice-white hover:text-brand-light transition-colors rounded-lg py-1"
        >
          <span
            className="w-7 h-7 rounded-lg bg-brand text-[var(--brand-fg)] inline-flex items-center justify-center font-display font-bold text-sm"
            aria-hidden="true"
          >
            B
          </span>
          <span>{t("accueil.titre")}</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="max-w-md w-full rounded-3xl bg-deep-navy border border-[var(--border-subtle)] shadow-[var(--card-shadow)] p-8 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white">
              {t("admin.akseRefize")}
            </h1>
            <p className="font-sans text-ice-white/65 text-sm sm:text-base leading-relaxed">
              {t("admin.akseRefizeDescription")}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-full bg-brand text-[var(--brand-fg)] hover:bg-brand-dark dark:hover:bg-brand-light font-sans font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("erreur404.retourAccueil")}
          </Link>
        </div>
      </main>
    </div>
  );
}

function AdminSidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "/admin";

  const managementLinks = [
    {
      href: "/admin",
      label: t("admin.nav.tableau"),
      active: pathname === "/admin",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      href: "/admin/formations",
      label: t("admin.nav.formations"),
      active: pathname.startsWith("/admin/formations"),
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      href: "/admin/eleves",
      label: t("admin.nav.eleves"),
      active: pathname.startsWith("/admin/eleves"),
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const operationLinks = [
    {
      href: "/admin/paiements",
      label: t("admin.nav.paiements"),
      active: pathname.startsWith("/admin/paiements"),
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      href: "/mes-formations",
      label: t("nav.mesFormations"),
      active: false,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: "/",
      label: t("mesFormations.retourSite"),
      active: false,
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6"
      aria-label={t("admin.navigation")}
    >
      <div className="space-y-1.5">
        <p className="px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ice-white/45">
          {t("admin.navSectionGestion")}
        </p>
        <div className="space-y-1">
          {managementLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={item.active ? "page" : undefined}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 font-sans text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                item.active
                  ? "bg-[#0F172A] text-white dark:bg-brand dark:text-[var(--brand-fg)] shadow-sm"
                  : "text-ice-white/75 hover:text-ice-white hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0 truncate">
                <span className={item.active ? "text-[#FF5B22] dark:text-[#07080A]" : "text-ice-white/55"}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </span>
              {item.active && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#FF5B22] dark:bg-[#07080A] shrink-0"
                  aria-hidden="true"
                />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ice-white/45">
          {t("admin.navSectionOperations")}
        </p>
        <div className="space-y-1">
          {operationLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={item.active ? "page" : undefined}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 font-sans text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                item.active
                  ? "bg-[#0F172A] text-white dark:bg-brand dark:text-[var(--brand-fg)] shadow-sm"
                  : "text-ice-white/75 hover:text-ice-white hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0 truncate">
                <span className={item.active ? "text-[#FF5B22] dark:text-[#07080A]" : "text-ice-white/55"}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </span>
              {item.active && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#FF5B22] dark:bg-[#07080A] shrink-0"
                  aria-hidden="true"
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    // ⚠️ Aucun appel /api/admin n'est lancé à ce stade
    return <AccessDenied />;
  }

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      setSigningOut(false);
    }
  };

  const displayName = user.displayName || user.email || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const renderSidebar = (onNavigate?: () => void) => (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-ice-white hover:text-brand-light transition-colors rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
        >
          <span
            className="w-7 h-7 rounded-lg bg-brand text-[var(--brand-fg)] inline-flex items-center justify-center font-display font-bold text-sm shadow-sm shadow-[var(--brand-glow)] shrink-0"
            aria-hidden="true"
          >
            B
          </span>
          <span>{t("accueil.titre")}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-light ml-0.5">
            Admin
          </span>
        </Link>
      </div>

      <Suspense fallback={<div className="flex-1 px-3.5 py-5" />}>
        <AdminSidebarLinks onNavigate={onNavigate} />
      </Suspense>

      <div className="p-3.5 border-t border-[var(--border-subtle)] shrink-0">
        <div className="p-2.5 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-brand/15 border border-brand/35 text-brand-light font-display font-bold text-sm flex items-center justify-center shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-xs text-ice-white truncate">
              {displayName}
            </p>
            <p className="font-mono text-[11px] text-brand-light truncate">
              Admin
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label={t("profil.boutonDeconnexion")}
            title={t("profil.boutonDeconnexion")}
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl border border-[var(--border-subtle)] bg-deep-navy hover:border-red-400/50 text-ice-white/70 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-transparent text-ice-white overflow-x-clip">
      <meta name="robots" content="noindex" />

      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-deep-navy border-r border-[var(--border-subtle)] sticky top-0 h-screen">
        {renderSidebar()}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label={t("admin.navigation")}
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {renderSidebar(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 bg-[var(--surface-nav)] backdrop-blur-md border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("admin.navigation")}
              className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-subtle)] text-ice-white flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-ice-white/60 truncate">
              {t("accueil.titre")} · {t("admin.navigation")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />
            <Link
              href="/"
              className="min-h-[44px] px-4 py-2 rounded-full bg-deep-navy border border-[var(--border-strong)] hover:border-brand/50 text-ice-white font-sans text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap"
            >
              <span>← {t("erreur404.retourAccueil")}</span>
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
