import React from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("admin.nav.tableau"),
  robots: {
    index: false,
    follow: false,
  },
};

// L'espace /admin est protégé côté client par AdminShell et côté API par requireAdmin :
// les routes ne nécessitent pas la validation de navigation instantanée SSR.
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
