import "server-only";
import React from "react";
import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { t } from "@/lib/i18n";
import type { AppLang } from "@/lib/i18n/config";
import { SITE_NAME } from "@/lib/site";
import { isAllowedOgCoverUrl, truncateOgTitle } from "@/lib/og/helpers";

export { isAllowedOgCoverUrl, truncateOgTitle };

export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_CONTENT_TYPE = "image/png";

const fontRegularData = readFileSync(
  join(process.cwd(), "src/assets/fonts/LiberationSans-Regular.ttf")
);
const fontBoldData = readFileSync(
  join(process.cwd(), "src/assets/fonts/LiberationSans-Bold.ttf")
);

const OG_FONTS = [
  {
    name: "BAYONDY Sans",
    data: fontRegularData,
    style: "normal" as const,
    weight: 400 as const,
  },
  {
    name: "BAYONDY Sans",
    data: fontBoldData,
    style: "normal" as const,
    weight: 700 as const,
  },
];

async function tryLoadSafeCoverDataUri(coverUrl: string | null | undefined): Promise<string | null> {
  if (!isAllowedOgCoverUrl(coverUrl)) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(coverUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.startsWith("image/png") && !contentType.startsWith("image/jpeg") && !contentType.startsWith("image/webp")) {
      return null;
    }
    const buf = Buffer.from(await response.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > 2 * 1024 * 1024) {
      return null;
    }
    const mime = contentType.split(";")[0].trim();
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function PortalMarkSvg({ size = 84 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="og-portal-grad"
          x1="18"
          y1="12"
          x2="98"
          y2="108"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#37D6D0" />
          <stop offset="52%" stopColor="#2864FF" />
          <stop offset="100%" stopColor="#1947C6" />
        </linearGradient>
        <linearGradient
          id="og-portal-inner"
          x1="36"
          y1="26"
          x2="80"
          y2="94"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#37D6D0" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#2864FF" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <g transform="translate(-3 0)">
        <rect x="28" y="18" width="12" height="84" rx="6" fill="url(#og-portal-grad)" />
        <path
          d="M34 18 H65 C78.5 18 89 28.5 89 42 C89 55.5 78.5 66 65 66 H34"
          stroke="url(#og-portal-grad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 54 H69 C83.5 54 95 65.5 95 80 C95 94.5 83.5 102 69 102 H34"
          stroke="url(#og-portal-grad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="62" cy="42" r="6" fill="url(#og-portal-inner)" />
        <circle cx="65" cy="78" r="8" fill="url(#og-portal-inner)" />
      </g>
    </svg>
  );
}

export function renderDefaultOgImage(lang: AppLang = "kr"): ImageResponse {
  const slogan = t("accueil.slogan", lang);
  const badge = t("hero.badge", lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#080B14",
          backgroundImage:
            "radial-gradient(circle at 84% 18%, rgba(55, 214, 208, 0.22) 0%, rgba(40, 100, 255, 0.16) 36%, transparent 66%), radial-gradient(circle at 14% 86%, rgba(40, 100, 255, 0.20) 0%, rgba(20, 36, 59, 0.55) 45%, transparent 74%)",
          fontFamily: "BAYONDY Sans",
          color: "#E8EDF5",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "18px",
                backgroundColor: "#14243B",
                border: "1px solid rgba(55, 214, 208, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PortalMarkSvg size={48} />
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#E8EDF5",
              }}
            >
              {SITE_NAME}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: "999px",
              backgroundColor: "rgba(20, 36, 59, 0.85)",
              border: "1px solid rgba(55, 214, 208, 0.38)",
              color: "#37D6D0",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            {badge}
          </div>
        </div>

        {/* Center brand hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "980px",
          }}
        >
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#E8EDF5",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: "38px",
              fontWeight: 400,
              lineHeight: 1.25,
              color: "#37D6D0",
            }}
          >
            {slogan}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "20px",
            borderTop: "1px solid rgba(232, 237, 245, 0.16)",
          }}
        >
          <div
            style={{
              width: "180px",
              height: "6px",
              borderRadius: "999px",
              background: "linear-gradient(90deg, #2864FF 0%, #37D6D0 100%)",
            }}
          />
          <span
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: "rgba(232, 237, 245, 0.78)",
            }}
          >
            {t("seo.titreAccueil", lang)}
          </span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: OG_FONTS,
    }
  );
}

export async function renderCourseOgImage(options: {
  title: string;
  lang?: AppLang;
  coverUrl?: string | null;
}): Promise<ImageResponse> {
  const lang = options.lang ?? "kr";
  const displayTitle = truncateOgTitle(options.title, 70);
  const badge = t("seo.ogFormationBadge", lang);
  const safeCoverUri = await tryLoadSafeCoverDataUri(options.coverUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#080B14",
          backgroundImage:
            "radial-gradient(circle at 85% 20%, rgba(55, 214, 208, 0.24) 0%, rgba(40, 100, 255, 0.18) 38%, transparent 68%), radial-gradient(circle at 12% 88%, rgba(20, 36, 59, 0.85) 0%, transparent 62%)",
          fontFamily: "BAYONDY Sans",
          color: "#E8EDF5",
          position: "relative",
        }}
      >
        {safeCoverUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeCoverUri}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "630px",
              objectFit: "cover",
              opacity: 0.24,
            }}
          />
        ) : null}

        {safeCoverUri ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(180deg, rgba(8, 11, 20, 0.82) 0%, rgba(8, 11, 20, 0.92) 100%)",
            }}
          />
        ) : null}

        {/* Top header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                backgroundColor: "#14243B",
                border: "1px solid rgba(55, 214, 208, 0.38)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PortalMarkSvg size={42} />
            </div>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#E8EDF5",
              }}
            >
              {SITE_NAME}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: "999px",
              backgroundColor: "rgba(20, 36, 59, 0.88)",
              border: "1px solid rgba(55, 214, 208, 0.38)",
              color: "#37D6D0",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            {badge}
          </div>
        </div>

        {/* Course title (max 2 lines) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "1040px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "62px",
              fontWeight: 700,
              lineHeight: 1.15,
              maxHeight: "145px",
              overflow: "hidden",
              color: "#E8EDF5",
            }}
          >
            {displayTitle}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "20px",
            borderTop: "1px solid rgba(232, 237, 245, 0.18)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "180px",
              height: "6px",
              borderRadius: "999px",
              background: "linear-gradient(90deg, #2864FF 0%, #37D6D0 100%)",
            }}
          />
          <span
            style={{
              fontSize: "22px",
              fontWeight: 400,
              color: "rgba(232, 237, 245, 0.84)",
            }}
          >
            {t("accueil.slogan", lang)}
          </span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: OG_FONTS,
    }
  );
}
