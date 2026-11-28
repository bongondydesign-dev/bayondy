"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { getSafeRedirectPath } from "./redirect";

export function useRequireAuth() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const search =
        typeof window !== "undefined" ? window.location.search : "";
      const rawTarget = `${pathname || "/mes-formations"}${search}`;
      const safeTarget = getSafeRedirectPath(rawTarget);
      router.push(`/connexion?redirect=${encodeURIComponent(safeTarget)}`);
    }
  }, [user, loading, router, pathname]);

  return { user, loading, isAdmin };
}

export default useRequireAuth;
