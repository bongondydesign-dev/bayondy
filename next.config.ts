import type { NextConfig } from "next";

function getConfiguredSiteHostname(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
  ];
  for (const raw of candidates) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "https:") {
        return parsed.hostname;
      }
    } catch {
      // Ignore invalid URL
    }
  }
  return null;
}

const configuredHostname = getConfiguredSiteHostname();
const trustedImageHosts = Array.from(
  new Set([
    "lh3.googleusercontent.com",
    "i.ytimg.com",
    "img.youtube.com",
    "firebasestorage.googleapis.com",
    "storage.googleapis.com",
    "res.cloudinary.com",
    "images.unsplash.com",
    "images.pexels.com",
    "picsum.photos",
    ...(configuredHostname ? [configuredHostname] : []),
  ])
);

const isVercelProduction = process.env.VERCEL_ENV === "production";

function buildReportOnlyCsp(): string {
  const imgSources = ["'self'", "data:", "blob:", ...trustedImageHosts.map((h) => `https://${h}`)].join(" ");
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSources}`,
    "font-src 'self' data:",
    "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://accounts.google.com",
    "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://www.tiktok.com https://*.firebaseapp.com https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://moncashconnect.com https://*.moncashconnect.com",
  ];
  if (isVercelProduction) {
    directives.push("frame-ancestors 'none'");
  }
  return directives.join("; ");
}

const nextConfig: NextConfig = {
  /* config options here */
  output: process.env.VERCEL ? undefined : "standalone",
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: trustedImageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const securityHeaders = [
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Content-Security-Policy-Report-Only",
        value: buildReportOnlyCsp(),
      },
      ...(isVercelProduction
        ? [
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
          ]
        : []),
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
