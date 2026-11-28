import { NextRequest, NextResponse } from "next/server";
import { LANG_COOKIE_NAME } from "@/lib/i18n/config";
import { getRedirectLocaleForIncomingRequest } from "@/lib/i18n/routing";

const OG_OR_ICON_ROUTE_RE =
  /^\/(?:(?:fr|ht)(?:\/.*)?)?(?:opengraph-image|twitter-image)(?:-[a-z0-9]+)?(?:\/.*)?$/;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/llms.txt" ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (OG_OR_ICON_ROUTE_RE.test(pathname)) {
    if (
      pathname === "/opengraph-image" ||
      pathname === "/twitter-image" ||
      pathname.startsWith("/fr/") ||
      pathname.startsWith("/ht/")
    ) {
      return NextResponse.next();
    }

    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = `/fr${pathname}`;
    targetUrl.search = search;
    return NextResponse.rewrite(targetUrl);
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
    "/((?!api|_next/static|_next/image|assets|icons|images|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|llms.txt|.*\\..*).*)",
  ],
};
