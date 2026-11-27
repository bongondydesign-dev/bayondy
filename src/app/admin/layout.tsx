import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";

// L'espace /admin est protégé côté client par AdminShell et côté API par requireAdmin :
// les routes ne nécessitent pas la validation de navigation instantanée SSR.
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
