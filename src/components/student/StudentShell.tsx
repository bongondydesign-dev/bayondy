"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
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
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { stripLocalePrefix } from "@/lib/i18n/routing";
import { SITE_NAME } from "@/lib/site";

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
  const { t, localize } = useI18n();
  const rawPathname = usePathname() || "/mes-formations";
  const pathname = stripLocalePrefix(rawPathname);

  const learnLinks = [
    {
      href: localize("/mes-formations"),
      label: t("mesFormations.navTableau"),
      active: pathname === "/mes-formations" || pathname.startsWith("/mes-formations/"),
      Icon: LayoutDashboard,
    },
    {
      href: localize("/catalogue"),
      label: t("mesFormations.navCatalogue"),
      active: pathname === "/catalogue" || pathname.startsWith("/catalogue/"),
      Icon: BookOpen,
    },
  ];

  const accountLinks = [
    {
      href: localize("/profil"),
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
      href: localize("/"),
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
        <p className="px-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/45">
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
                  ? "bg-[#0F1219] text-white dark:bg-brand dark:text-[var(--brand-fg)] shadow-xs"
                  : "text-slate-700 dark:text-ice-white/75 hover:text-ice-white hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? "text-[#FF6A36] dark:text-[#07080A]" : "text-slate-600 dark:text-ice-white/55"
                }`}
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="px-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600 dark:text-ice-white/45">
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
                  ? "bg-[#0F1219] text-white dark:bg-brand dark:text-[var(--brand-fg)] shadow-xs"
                  : "text-slate-700 dark:text-ice-white/75 hover:text-ice-white hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? "text-[#FF6A36] dark:text-[#07080A]" : "text-slate-600 dark:text-ice-white/55"
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
  const rawPathname = usePathname() || "/mes-formations";
  const cleanPathname = stripLocalePrefix(rawPathname);
  const inStudentCatalog =
    cleanPathname === "/catalogue" || cleanPathname.startsWith("/catalogue/");
  const { t, localize } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.push(localize("/"));
    } catch {
      setSigningOut(false);
    }
  };

  const displayName = user?.displayName || user?.email || SITE_NAME;
  const initial = displayName.charAt(0).toUpperCase();

  const sidebarContent = (onNavigate?: () => void) => (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0">
        <Link
          href={localize("/")}
          onClick={onNavigate}
          className="inline-flex items-center gap-2.5 font-display font-bold text-lg tracking-tight text-ice-white hover:text-brand-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light rounded-lg py-1"
        >
          <span
            className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#FF652E] to-brand text-[var(--brand-fg)] inline-flex items-center justify-center font-display font-bold text-sm shadow-sm shadow-[var(--brand-glow)] shrink-0"
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

      <div className="px-3.5 pb-3 sm:hidden shrink-0">
        <LanguageSwitcher
          variant="segmented"
          className="w-full"
          onAfterSelect={onNavigate}
        />
      </div>

      <div className="p-3.5 border-t border-[var(--border-subtle)] shrink-0">
        {user ? (
          <div className="p-2.5 rounded-2xl bg-[var(--surface-well)] border border-[var(--border-subtle)] flex items-center gap-2.5">
            <Link
              href={localize("/profil")}
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
                  <p className="font-mono text-[11px] text-slate-600 dark:text-ice-white/55 truncate">
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
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-strong)] dark:border-[var(--border-subtle)] bg-white dark:bg-deep-navy shadow-2xs dark:shadow-none hover:border-red-400/60 text-slate-700 dark:text-ice-white/70 hover:text-red-600 dark:hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
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
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[var(--surface-sidebar)] backdrop-blur-xl border-r border-[var(--border-subtle)] sticky top-0 h-dvh">
        {sidebarContent()}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.menu")}
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
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-ice-white flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              {sidebarContent(() => setMobileOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 px-3 sm:px-6 lg:px-8 bg-[var(--surface-nav)] backdrop-blur-xl border-b border-[var(--border-subtle)] flex items-center justify-between gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("nav.menu")}
              className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface-glass)] text-ice-white flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light shrink-0"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              {pageSubtitle && (
                <p className="hidden sm:block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 dark:text-ice-white/50 truncate">
                  {pageSubtitle}
                </p>
              )}
              <p className="font-display font-bold text-sm sm:text-lg text-ice-white truncate">
                {pageTitle || t("mesFormations.titre")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LanguageSwitcher variant="dropdown" className="hidden sm:block" />
            <ThemeToggle variant="bordered" className="sm:hidden" />
            <ThemeToggle variant="segmented" className="hidden sm:inline-flex" />
            <Link
              href={localize(inStudentCatalog ? "/mes-formations" : "/catalogue")}
              className="min-h-[44px] px-3 sm:px-4 py-2 rounded-full surface-glass border border-[var(--border-strong)] hover:border-brand/50 text-ice-white font-sans font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 sm:gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light whitespace-nowrap shrink-0"
            >
              {inStudentCatalog ? (
                <>
                  <LayoutDashboard className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("mesFormations.navTableau")}</span>
                  <span className="sm:hidden">{t("catalogueClient.navMesCoursShort")}</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("mesFormations.boutonDecouvrir")}</span>
                  <span className="sm:hidden">{t("nav.formations")}</span>
                </>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
