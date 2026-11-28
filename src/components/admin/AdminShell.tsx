"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  LayoutGrid,
  Lock,
  LogOut,
  Menu,
  PlayCircle,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/I18nProvider";

function AccessDenied() {
  const { t, localize } = useI18n();

  return (
    <div className="min-h-screen bg-transparent text-ice-white flex flex-col px-4">
      <meta name="robots" content="noindex" />
      <header className="h-16 max-w-6xl w-full mx-auto flex items-center justify-between gap-3">
        <Link
          href={localize("/")}
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-ice-white hover:text-brand-light transition-colors rounded-lg py-1"
        >
          <span
            className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#FF652E] to-brand text-[var(--brand-fg)] inline-flex items-center justify-center font-display font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
            aria-hidden="true"
          >
            B
          </span>
          <span>{t("accueil.titre")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <LanguageSwitcher variant="dropdown" />
          </Suspense>
          <ThemeToggle variant="segmented" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <div className="animate-hero-1 max-w-md w-full rounded-3xl surface-glass border border-[var(--border-subtle)] p-8 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
            <Lock className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ice-white">
              {t("admin.akseRefize")}
            </h1>
            <p className="font-sans text-slate-600 dark:text-ice-white/65 text-sm sm:text-base leading-relaxed">
              {t("admin.akseRefizeDescription")}
            </p>
          </div>
          <Link
            href={localize("/")}
            className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-full bg-gradient-to-b from-[#FF652E] to-brand text-[var(--brand-fg)] hover:brightness-105 font-sans font-semibold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_22px_-6px_var(--brand-glow)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            {t("erreur404.retourAccueil")}
          </Link>
        </div>
      </main>
    </div>
  );
}

function AdminSidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t, localize } = useI18n();
  const pathname = usePathname() || "/admin";

  const managementLinks = [
    {
      href: "/admin",
      label: t("admin.nav.tableau"),
      active: pathname === "/admin",
      Icon: LayoutGrid,
    },
    {
      href: "/admin/formations",
      label: t("admin.nav.formations"),
      active: pathname.startsWith("/admin/formations"),
      Icon: BookOpen,
    },
    {
      href: "/admin/eleves",
      label: t("admin.nav.eleves"),
      active: pathname.startsWith("/admin/eleves"),
      Icon: Users,
    },
  ];

  const operationLinks = [
    {
      href: "/admin/paiements",
      label: t("admin.nav.paiements"),
      active: pathname.startsWith("/admin/paiements"),
      Icon: CreditCard,
    },
    {
      href: localize("/mes-formations"),
      label: t("nav.mesFormations"),
      active: false,
      Icon: PlayCircle,
    },
    {
      href: localize("/"),
      label: t("mesFormations.retourSite"),
      active: false,
      Icon: ArrowLeft,
    },
  ];

  return (
    <nav
      className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6"
      aria-label={t("admin.navigation")}
    >
      <div className="space-y-1.5">
        <p className="px-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/45">
          {t("admin.navSectionGestion")}
        </p>
        <div className="space-y-1">
          {managementLinks.map(({ href, label, active, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 font-sans text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                active
                  ? "bg-[#0F1219] text-white dark:bg-brand dark:text-[var(--brand-fg)] shadow-xs"
                  : "text-slate-700 dark:text-ice-white/75 hover:text-ice-white hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? "text-[#FF6A36] dark:text-[#07080A]" : "text-slate-600 dark:text-ice-white/55"
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{label}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="px-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/45">
          {t("admin.navSectionOperations")}
        </p>
        <div className="space-y-1">
          {operationLinks.map(({ href, label, active, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 font-sans text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light ${
                active
                  ? "bg-[#0F1219] text-white dark:bg-brand dark:text-[var(--brand-fg)] shadow-xs"
                  : "text-slate-700 dark:text-ice-white/75 hover:text-ice-white hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? "text-[#FF6A36] dark:text-[#07080A]" : "text-slate-600 dark:text-ice-white/55"
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{label}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t, localize } = useI18n();
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
      router.push(localize("/"));
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
            className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#FF652E] to-brand text-[var(--brand-fg)] inline-flex items-center justify-center font-display font-bold text-sm shadow-sm shadow-[var(--brand-glow)] shrink-0"
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

      <div className="p-3.5 border-t border-[var(--border-subtle)] shrink-0 space-y-2.5">
        <div className="sm:hidden">
          <Suspense fallback={null}>
            <LanguageSwitcher variant="segmented" className="w-full" onAfterSelect={onNavigate} />
          </Suspense>
        </div>
        <div className="p-2.5 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[var(--surface-active)] dark:bg-brand/15 border border-[var(--home-orange-vivid)]/40 dark:border-brand/35 text-brand-light font-display font-bold text-sm flex items-center justify-center shrink-0">
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
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-strong)] dark:border-[var(--border-subtle)] bg-white dark:bg-deep-navy shadow-2xs dark:shadow-none hover:border-red-400/60 text-slate-700 dark:text-ice-white/70 hover:text-red-600 dark:hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-transparent text-ice-white overflow-x-clip">
      <meta name="robots" content="noindex" />

      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[var(--surface-sidebar)] backdrop-blur-xl border-r border-[var(--border-subtle)] sticky top-0 h-dvh">
        {renderSidebar()}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label={t("admin.navigation")}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-72 max-w-[82vw] h-full bg-deep-navy border-r border-[var(--border-strong)] shadow-2xl flex flex-col"
            >
              <div className="absolute top-3 right-3 z-20">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label={t("nav.fermer")}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-strong)] dark:border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-ice-white flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              {renderSidebar(() => setMobileOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 bg-[var(--surface-nav)] backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("admin.navigation")}
              className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-glass)] text-ice-white flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/60 truncate">
              {t("accueil.titre")} · {t("admin.navigation")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Suspense fallback={null}>
              <LanguageSwitcher variant="dropdown" className="hidden sm:block" />
            </Suspense>
            <ThemeToggle variant="segmented" />
            <Link
              href={localize("/")}
              className="min-h-[44px] px-4 py-2 rounded-full surface-glass border border-[var(--border-strong)] hover:border-brand/50 text-ice-white font-sans text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t("erreur404.retourAccueil")}</span>
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
