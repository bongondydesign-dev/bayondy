import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Database,
  Globe,
  Layers,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { t } from "@/lib/i18n";

const PORTFOLIO_URL = "https://bayondy.web.app/";
const LINKEDIN_URL = "https://www.linkedin.com/in/bayondy-edouard?originalSubdomain=ht";
const WHATSAPP_URL = "https://wa.me/50938133150";

export const metadata: Metadata = {
  title: `${t("apropos.titreNom")} — ${t("nav.apropos")} | BAYONDY`,
  description: t("apropos.bio"),
};

export default function AProposPage() {
  const stackPillars = [
    {
      num: t("apropos.pilier1Num"),
      title: t("apropos.pilier1Titre"),
      desc: t("apropos.pilier1Desc"),
      Icon: Code2,
      items: ["React", "TypeScript", "JavaScript", "Tailwind CSS", "HTML5 / CSS3"],
    },
    {
      num: t("apropos.pilier2Num"),
      title: t("apropos.pilier2Titre"),
      desc: t("apropos.pilier2Desc"),
      Icon: Database,
      items: ["Node.js", "Firebase", "SQL"],
    },
    {
      num: t("apropos.pilier3Num"),
      title: t("apropos.pilier3Titre"),
      desc: t("apropos.pilier3Desc"),
      Icon: Layers,
      items: ["Git / GitHub", "Framer", t("apropos.carteFocusValeur")],
    },
  ];

  const coreTechs = [
    "React",
    "TypeScript",
    "Node.js",
    "Tailwind CSS",
    "Firebase",
    "HTML5 / CSS3",
    "JavaScript",
    "SQL",
    "Git / GitHub",
  ];

  const cardProfiles = [
    { label: "Portfolio", href: PORTFOLIO_URL },
    { label: "LinkedIn", href: LINKEDIN_URL },
    { label: "Framer", href: PORTFOLIO_URL },
    { label: "WhatsApp", href: WHATSAPP_URL },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-ice-white selection:bg-brand/30 selection:text-brand-light overflow-x-clip">
      <Navbar />

      <main className="flex-1 home-orange selection:bg-[var(--home-orange)]/30 selection:text-[var(--home-orange-light)]">
        {/* 1. Split Hero Éditorial : Bayondy Edouard */}
        <section className="relative w-full pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden bg-transparent">
          <div
            className="absolute inset-x-0 top-0 h-[440px] pointer-events-none opacity-50 dark:opacity-90"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 0%, var(--brand-glow) 0%, var(--brand-glow-soft) 48%, transparent 78%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Colonne gauche */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-8">
                <div className="space-y-5">
                  <div className="animate-hero-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-xs uppercase tracking-[0.16em] text-[var(--home-orange-light)]">
                    <span>{t("apropos.badge")}</span>
                    <span className="hidden sm:inline text-slate-500 dark:text-ice-white/30" aria-hidden="true">
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-ice-white/65">
                      <MapPin className="w-3.5 h-3.5 text-[var(--home-orange)]" aria-hidden="true" />
                      {t("apropos.metaLieu")}
                    </span>
                  </div>

                  <h1 className="animate-hero-2 font-display font-bold text-4xl sm:text-5xl lg:text-[3.75rem] tracking-[-0.03em] text-ice-white leading-[1.05] text-balance">
                    <span className="block">{t("apropos.titreNom")}</span>
                    <span className="block">
                      {t("apropos.titreRolePrefix")}
                      <span className="font-serif italic font-normal bg-gradient-to-r from-[#EB4A15] to-[#B83207] dark:from-[#FF8C61] dark:to-[#FF5B22] bg-clip-text text-transparent pr-1.5">
                        {t("apropos.titreRoleAccent")}
                      </span>
                    </span>
                  </h1>

                  <div className="animate-hero-2 space-y-3 max-w-2xl font-sans text-base sm:text-lg text-slate-600 dark:text-ice-white/75 leading-relaxed">
                    <p>{t("apropos.bio")}</p>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-ice-white/65">
                      {t("apropos.bioSecondaire")}
                    </p>
                  </div>
                </div>

                {/* Action principale + liens externes */}
                <div className="animate-hero-3 flex flex-wrap items-center gap-3.5 pt-2">
                  <Link
                    href="/formations"
                    className="group inline-flex items-center justify-center gap-2.5 min-h-[44px] px-6 py-2.5 rounded-full bg-gradient-to-b from-[#FF652E] to-[var(--home-orange)] hover:brightness-105 text-[var(--home-orange-fg)] font-sans font-semibold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_22px_-6px_var(--home-orange-glow)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)]"
                  >
                    <span>{t("apropos.ctaFormations")}</span>
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                  </Link>

                  <a
                    href={PORTFOLIO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full border border-[var(--border-strong)] surface-glass hover:border-[var(--home-orange)]/55 text-ice-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)]"
                  >
                    <span>{t("apropos.ctaPortfolio")}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--home-orange-light)]" aria-hidden="true" />
                  </a>

                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 text-sm font-medium text-slate-600 dark:text-ice-white/75 hover:text-ice-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)] rounded-md"
                  >
                    <span>{t("apropos.ctaLinkedin")}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--home-orange-light)]" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Colonne droite : Fiche Studio Contraste Obsidienne */}
              <div className="lg:col-span-5 animate-hero-4">
                <div className="h-full rounded-2xl surface-contrast border border-white/10 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
                  <div
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none opacity-65"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255, 91, 34, 0.24) 0%, transparent 68%)",
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
                      backgroundSize: "18px 18px",
                    }}
                    aria-hidden="true"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/10">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#FF652E] to-[#FF5B22] text-white font-display font-bold text-base inline-flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(255,91,34,0.5)] shrink-0"
                          aria-hidden="true"
                        >
                          BE
                        </span>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-base sm:text-lg text-white truncate leading-tight">
                            {t("apropos.titreNom")}
                          </p>
                          <p className="font-sans text-xs text-zinc-400 truncate mt-0.5">
                            {t("apropos.carteLabel")} · {t("apropos.carteBaseValeur")}
                          </p>
                        </div>
                      </div>

                      <a
                        href={PORTFOLIO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#FF885C] hover:text-white transition-colors shrink-0 min-h-[36px] px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] rounded"
                        aria-label={t("apropos.ctaPortfolio")}
                        title={t("apropos.profilPortfolioUrl")}
                      >
                        <Globe className="w-4 h-4" aria-hidden="true" />
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-white/10">
                      <div className="min-w-0">
                        <p className="font-sans text-[11px] font-medium text-zinc-400">
                          {t("apropos.carteRoleLabel")}
                        </p>
                        <p className="font-sans text-[13px] font-medium text-white mt-1 leading-snug">
                          {t("apropos.carteRoleValeur")}
                        </p>
                      </div>
                      <div className="min-w-0 sm:border-l sm:border-white/10 sm:pl-4">
                        <p className="font-sans text-[11px] font-medium text-zinc-400">
                          {t("apropos.carteFocusLabel")}
                        </p>
                        <p className="font-sans text-[13px] font-medium text-white mt-1 leading-snug">
                          {t("apropos.carteFocusValeur")}
                        </p>
                      </div>
                    </div>

                    <div className="py-4 border-b border-white/10">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-sans text-[11px] font-medium text-zinc-400">
                          {t("apropos.stackTitre")}
                        </span>
                        <span className="font-mono text-[11px] text-[#FF885C] tabular-nums">
                          09
                        </span>
                      </div>

                      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2">
                        {coreTechs.map((tech, idx) => (
                          <li key={tech} className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-[10px] text-[#FF885C] tabular-nums shrink-0">
                              0{idx + 1}
                            </span>
                            <span className="font-sans text-[13px] font-medium text-zinc-100 truncate">
                              {tech}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-sans text-[11px] font-medium text-zinc-400">
                        {t("apropos.cartePresenceLabel")}
                      </span>
                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
                        {cardProfiles.map((profile) => (
                          <a
                            key={profile.label}
                            href={profile.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/link inline-flex items-center gap-1 text-xs font-medium text-zinc-200 hover:text-[#FF885C] transition-colors whitespace-nowrap shrink-0 min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF885C] rounded"
                          >
                            <span>{profile.label}</span>
                            <ArrowUpRight
                              className="w-3 h-3 text-[#FF885C] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                              aria-hidden="true"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="font-display text-xs font-semibold tracking-wider text-zinc-400">
                      BAYONDY
                    </span>
                    <span className="font-serif italic text-sm text-[#FF885C]">
                      {t("accueil.slogan")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Technologies Principales en 3 Piliers */}
        <section className="w-full py-20 sm:py-24 bg-[var(--surface-band)] relative transition-colors duration-200">
          <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 sm:mb-14">
                <div className="max-w-2xl">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-3">
                    {t("apropos.stackBadge")}
                  </p>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ice-white tracking-tight leading-[1.08] text-balance">
                    {t("apropos.stackTitre")}
                  </h2>
                </div>
                <p className="max-w-md text-sm sm:text-base text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed text-balance">
                  {t("apropos.stackSousTitre")}
                </p>
              </div>
            </Reveal>

            <RevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stackPillars.map((pillar) => {
                const PillarIcon = pillar.Icon;
                return (
                  <RevealItem key={pillar.num} className="flex">
                    <article className="group w-full rounded-2xl surface-glass border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border-subtle)]">
                          <span className="font-mono text-xs font-semibold text-[var(--home-orange-light)] tabular-nums">
                            {pillar.num}
                          </span>
                          <PillarIcon
                            className="w-4 h-4 text-slate-600 dark:text-ice-white/60 group-hover:text-[var(--home-orange-light)] transition-colors"
                            strokeWidth={1.9}
                            aria-hidden="true"
                          />
                        </div>

                        <h3 className="font-display font-semibold text-lg sm:text-xl text-ice-white mb-2">
                          {pillar.title}
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-ice-white/70 font-sans leading-relaxed mb-6">
                          {pillar.desc}
                        </p>
                      </div>

                      <ul className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
                        {pillar.items.map((tech, idx) => (
                          <li
                            key={tech}
                            className="py-2.5 flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="font-sans font-medium text-ice-white">
                              {tech}
                            </span>
                            <span className="font-mono text-[11px] text-slate-600 dark:text-ice-white/45 tabular-nums">
                              0{idx + 1}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </RevealItem>
                );
              })}
            </RevealStagger>
          </div>
        </section>

        {/* 3. Mission éditoriale */}
        <section className="w-full py-20 sm:py-24 bg-transparent relative">
          <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)]">
                {t("apropos.visionBadge")}
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-4xl text-ice-white tracking-tight leading-[1.15] text-balance mt-3">
                {t("apropos.visionTitre")}
              </h2>
              <p className="mt-5 font-sans text-base sm:text-lg text-slate-600 dark:text-ice-white/75 leading-relaxed max-w-2xl mx-auto text-balance">
                {t("apropos.visionTexte")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* 4. Profils en ligne */}
        <section className="w-full py-20 sm:py-24 bg-[var(--surface-band)] relative transition-colors duration-200">
          <div className="section-hairline absolute top-0 inset-x-0 h-px" aria-hidden="true" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Reveal>
              <div className="max-w-2xl mb-10 sm:mb-12">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--home-orange-light)] mb-3">
                  {t("apropos.profilsBadge")}
                </p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-ice-white tracking-tight text-balance">
                  {t("apropos.profilsTitre")}
                </h2>
              </div>
            </Reveal>

            <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Portfolio */}
              <RevealItem className="flex">
                <a
                  href={PORTFOLIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full rounded-2xl surface-glass border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between gap-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border-subtle)]">
                      <span className="inline-flex items-center gap-2 font-mono text-xs text-[var(--home-orange-light)]">
                        <Globe className="w-4 h-4" aria-hidden="true" />
                        <span>{t("apropos.profilPortfolioUrl")}</span>
                      </span>
                      <ArrowUpRight
                        className="w-4 h-4 text-slate-600 dark:text-ice-white/50 group-hover:text-[var(--home-orange-light)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                      {t("apropos.profilPortfolioTitre")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed">
                      {t("apropos.profilPortfolioDesc")}
                    </p>
                  </div>

                  <span className="font-mono text-xs font-medium text-[var(--home-orange-light)] inline-flex items-center gap-1.5">
                    <span>{t("apropos.profilPortfolioAction")}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </a>
              </RevealItem>

              {/* LinkedIn */}
              <RevealItem className="flex">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full rounded-2xl surface-glass border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between gap-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border-subtle)]">
                      <span className="font-mono text-xs text-[var(--home-orange-light)]">
                        {t("apropos.profilLinkedinHandle")}
                      </span>
                      <ArrowUpRight
                        className="w-4 h-4 text-slate-600 dark:text-ice-white/50 group-hover:text-[var(--home-orange-light)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                      {t("apropos.profilLinkedinTitre")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed">
                      {t("apropos.profilLinkedinDesc")}
                    </p>
                  </div>

                  <span className="font-mono text-xs font-medium text-[var(--home-orange-light)] inline-flex items-center gap-1.5">
                    <span>{t("apropos.profilLinkedinAction")}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </a>
              </RevealItem>

              {/* Framer */}
              <RevealItem className="flex">
                <a
                  href={PORTFOLIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full rounded-2xl surface-glass border border-[var(--border-subtle)] hover:border-[var(--home-orange)]/45 hover:-translate-y-0.5 transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between gap-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--home-orange-light)]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border-subtle)]">
                      <span className="font-mono text-xs text-[var(--home-orange-light)]">
                        {t("apropos.profilFramerHandle")}
                      </span>
                      <ArrowUpRight
                        className="w-4 h-4 text-slate-600 dark:text-ice-white/50 group-hover:text-[var(--home-orange-light)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                      {t("apropos.profilFramerTitre")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed">
                      {t("apropos.profilFramerDesc")}
                    </p>
                  </div>

                  <span className="font-mono text-xs font-medium text-[var(--home-orange-light)] inline-flex items-center gap-1.5">
                    <span>{t("apropos.profilPortfolioAction")}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </a>
              </RevealItem>

              {/* WhatsApp */}
              <RevealItem className="flex">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full rounded-2xl surface-glass border border-[var(--border-subtle)] hover:border-emerald-500/55 hover:-translate-y-0.5 transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between gap-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[var(--border-subtle)]">
                      <span className="inline-flex items-center gap-2 font-mono text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
                        <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{t("apropos.profilWhatsappNum")}</span>
                      </span>
                      <ArrowUpRight
                        className="w-4 h-4 text-slate-600 dark:text-ice-white/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-ice-white mb-1.5">
                      {t("apropos.profilWhatsappTitre")}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-ice-white/70 font-sans leading-relaxed">
                      {t("apropos.profilWhatsappDesc")}
                    </p>
                  </div>

                  <span className="font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5">
                    <span>{t("apropos.profilWhatsappAction")}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </a>
              </RevealItem>
            </RevealStagger>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
