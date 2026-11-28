"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/50938133150";

export function WhatsAppButton() {
  const pathname = usePathname() || "/";

  // Masquer dans l'espace admin et dans le lecteur vidéo étudiant
  if (pathname.startsWith("/admin") || pathname.startsWith("/mes-formations/")) {
    return null;
  }

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ekri Bayondy Edouard sou WhatsApp (+509 3813 3150)"
      title="WhatsApp · +509 3813 3150"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 inline-flex items-center justify-center gap-2.5 w-12 h-12 sm:w-auto sm:h-12 sm:px-4 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white border border-emerald-400/35 shadow-[0_12px_28px_-6px_rgba(22,163,74,0.55)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian"
    >
      <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
      <span className="hidden sm:inline font-sans text-sm font-semibold">
        WhatsApp
      </span>
    </a>
  );
}

export default WhatsAppButton;
