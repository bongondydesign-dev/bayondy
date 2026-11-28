"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { getSafeRedirectPath } from "./redirect";
import { extractAppLangFromPathname, localizePath } from "@/lib/i18n/routing";

export function useRequireAuth() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const lang = extractAppLangFromPathname(pathname);
      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const fallbackPath = localizePath("/mes-formations", lang);
      const rawTarget = `${pathname || fallbackPath}${search}`;
      const safeTarget = getSafeRedirectPath(rawTarget, fallbackPath);
      router.push(
        localizePath(`/connexion?redirect=${encodeURIComponent(safeTarget)}`, lang)
      );
    }
  }, [user, loading, router, pathname]);

  return { user, loading, isAdmin };
}

export default useRequireAuth;
