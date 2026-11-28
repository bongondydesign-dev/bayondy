import { NextRequest, NextResponse } from "next/server";
import { LANG_COOKIE_NAME } from "@/lib/i18n/config";
import { getRedirectLocaleForIncomingRequest } from "@/lib/i18n/routing";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/llms.txt" ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const decision = getRedirectLocaleForIncomingRequest({
    pathname,
    cookieLang: request.cookies.get(LANG_COOKIE_NAME)?.value ?? null,
    userAgent: request.headers.get("user-agent"),
    method: request.method,
  });

  if (decision.action === "next" || !decision.destinationPathname) {
    return NextResponse.next();
  }

  const targetUrl = request.nextUrl.clone();
  targetUrl.pathname = decision.destinationPathname;
  targetUrl.search = search;

  if (decision.action === "redirect") {
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.rewrite(targetUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|llms.txt|.*\\..*).*)",
  ],
};
