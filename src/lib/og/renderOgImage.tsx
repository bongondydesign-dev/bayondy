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

const fontSansRegular = readFileSync(
  join(process.cwd(), "src/assets/fonts/NotoSansDisplay-Regular.ttf")
);
const fontSansBold = readFileSync(
  join(process.cwd(), "src/assets/fonts/NotoSansDisplay-Bold.ttf")
);
const fontSerifItalic = readFileSync(
  join(process.cwd(), "src/assets/fonts/NotoSerifDisplay-Italic.ttf")
);
const fontMonoMedium = readFileSync(
  join(process.cwd(), "src/assets/fonts/JetBrainsMono-Medium.ttf")
);

const OG_FONTS = [
  {
    name: "BAYONDY Sans",
    data: fontSansRegular,
    style: "normal" as const,
    weight: 400 as const,
  },
  {
    name: "BAYONDY Sans",
    data: fontSansBold,
    style: "normal" as const,
    weight: 700 as const,
  },
  {
    name: "BAYONDY Serif",
    data: fontSerifItalic,
    style: "italic" as const,
    weight: 400 as const,
  },
  {
    name: "BAYONDY Mono",
    data: fontMonoMedium,
    style: "normal" as const,
    weight: 500 as const,
  },
];

const B_PORTAL_PATH =
  "M38 22H65C76.6 22 85 29.8 85 40.5C85 48.2 80.5 54 73.5 56.6C83.2 59.4 90 67.2 90 77.5C90 89.8 80.2 98 67 98H38C33.6 98 30 94.4 30 90V30C30 25.6 33.6 22 38 22ZM46 34.5V50.5H62C67.8 50.5 71.5 47.2 71.5 42.5C71.5 37.8 67.8 34.5 62 34.5H46ZM46 64V85.5H64.5C71.8 85.5 76.5 81.4 76.5 74.75C76.5 68.1 71.8 64 64.5 64H46Z";

function splitSloganAccent(slogan: string): { lead: string; accent: string } {
  const parts = slogan.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { lead: "", accent: slogan.trim() };
  }
  const accent = parts.pop() ?? "";
  return { lead: parts.join(" "), accent };
}

async function tryLoadSafeCoverDataUri(
  coverUrl: string | null | undefined
): Promise<string | null> {
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
    const contentType =
      response.headers.get("content-type")?.toLowerCase() ?? "";
    if (
      !contentType.startsWith("image/png") &&
      !contentType.startsWith("image/jpeg") &&
      !contentType.startsWith("image/webp")
    ) {
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

function PortalMarkSvg({
  size = 84,
  idSuffix = "main",
}: {
  size?: number;
  idSuffix?: string;
}) {
  const gradId = `og-portal-grad-${idSuffix}`;
  const sheenId = `og-portal-sheen-${idSuffix}`;

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
          id={gradId}
          x1="28"
          y1="20"
          x2="92"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6BF4EE" />
          <stop offset="34%" stopColor="#37D6D0" />
          <stop offset="70%" stopColor="#2864FF" />
          <stop offset="100%" stopColor="#1947C6" />
        </linearGradient>
        <linearGradient
          id={sheenId}
          x1="30"
          y1="22"
          x2="72"
          y2="66"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.30" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={B_PORTAL_PATH}
        fillRule="evenodd"
        clipRule="evenodd"
        fill={`url(#${gradId})`}
      />
      <path
        d={B_PORTAL_PATH}
        fillRule="evenodd"
        clipRule="evenodd"
        fill={`url(#${sheenId})`}
      />
    </svg>
  );
}

function ArchitecturalBackdrop({ idSuffix }: { idSuffix: string }) {
  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "1200px",
        height: "630px",
      }}
    >
      <defs>
        <pattern
          id={`grid-${idSuffix}`}
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 48 0 L 0 0 0 48"
            fill="none"
            stroke="#E8EDF5"
            strokeOpacity="0.045"
            strokeWidth="1"
          />
          <circle cx="0" cy="0" r="1.2" fill="#37D6D0" fillOpacity="0.16" />
        </pattern>
        <radialGradient
          id={`mask-fade-${idSuffix}`}
          cx="0.65"
          cy="0.45"
          r="0.65"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <rect
        width="1200"
        height="630"
        fill={`url(#grid-${idSuffix})`}
        opacity="0.85"
      />
    </svg>
  );
}

function BrandTile({
  size = 54,
  idSuffix,
}: {
  size?: number;
  idSuffix: string;
}) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.25)}px`,
        backgroundColor: "#0B1222",
        backgroundImage:
          "radial-gradient(circle at 32% 24%, rgba(55, 214, 208, 0.22) 0%, rgba(40, 100, 255, 0.14) 48%, rgba(8, 11, 20, 1) 86%)",
        border: "1px solid rgba(232, 237, 245, 0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 26px rgba(0, 0, 0, 0.45)",
      }}
    >
      <PortalMarkSvg size={Math.round(size * 0.72)} idSuffix={idSuffix} />
    </div>
  );
}

export function renderDefaultOgImage(lang: AppLang = "kr"): ImageResponse {
  const slogan = t("accueil.slogan", lang);
  const { lead, accent } = splitSloganAccent(slogan);
  const badge = t("hero.badge", lang);
  const subtitle = t("hero.sousTitre", lang);
  const creoleBadge = t("bento.badgeCreole", lang);
  const mobileBadge = t("bento.badgeMobile", lang);
  const paymentBadge = t("bento.badgePaiement", lang);
  const playerLabel = t("hero.apercu.badge", lang);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#080B14",
          backgroundImage:
            "radial-gradient(circle at 80% 34%, rgba(55, 214, 208, 0.24) 0%, rgba(40, 100, 255, 0.20) 32%, transparent 64%), radial-gradient(circle at 12% 92%, rgba(40, 100, 255, 0.16) 0%, rgba(20, 36, 59, 0.45) 42%, transparent 70%)",
          fontFamily: "BAYONDY Sans",
          color: "#E8EDF5",
          position: "relative",
        }}
      >
        <ArchitecturalBackdrop idSuffix={`default-${lang}`} />

        {/* Left Editorial Column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "670px",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Top Brand Lockup */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <BrandTile size={54} idSuffix={`tile-${lang}`} />
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: "#E8EDF5",
                }}
              >
                {SITE_NAME}
              </span>
              <div
                style={{
                  width: "1px",
                  height: "18px",
                  backgroundColor: "rgba(232, 237, 245, 0.22)",
                }}
              />
              <span
                style={{
                  fontFamily: "BAYONDY Mono",
                  fontSize: "14px",
                  fontWeight: 500,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "#37D6D0",
                }}
              >
                {badge}
              </span>
            </div>
          </div>

          {/* Main Slogan & Subhead */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "66px",
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: "#E8EDF5",
              }}
            >
              {lead ? <span>{lead}</span> : null}
              <span
                style={{
                  fontFamily: "BAYONDY Serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#5CF0EA",
                  fontSize: "72px",
                  lineHeight: 1.06,
                }}
              >
                {accent}
              </span>
            </div>

            <div
              style={{
                fontSize: "23px",
                fontWeight: 400,
                lineHeight: 1.42,
                color: "rgba(232, 237, 245, 0.78)",
                maxWidth: "590px",
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* Bottom Capability Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              paddingTop: "22px",
              borderTop: "1px solid rgba(232, 237, 245, 0.14)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "4px",
                borderRadius: "999px",
                backgroundImage:
                  "linear-gradient(90deg, #2864FF 0%, #37D6D0 100%)",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontFamily: "BAYONDY Mono",
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(232, 237, 245, 0.78)",
              }}
            >
              <span>{creoleBadge}</span>
              <span style={{ color: "rgba(55, 214, 208, 0.65)" }}>•</span>
              <span>{mobileBadge}</span>
              <span style={{ color: "rgba(55, 214, 208, 0.65)" }}>•</span>
              <span>{paymentBadge}</span>
            </div>
          </div>
        </div>

        {/* Right Sculptural Glass Portal Showcase */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            width: "370px",
            height: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "350px",
              height: "470px",
              borderRadius: "28px",
              backgroundColor: "#0D1526",
              backgroundImage:
                "linear-gradient(155deg, rgba(20, 36, 59, 0.88) 0%, rgba(8, 11, 20, 0.96) 100%)",
              border: "1px solid rgba(55, 214, 208, 0.30)",
              boxShadow: "0 30px 70px rgba(0, 0, 0, 0.60)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "26px",
              position: "relative",
            }}
          >
            {/* Card top chrome */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(232, 237, 245, 0.28)",
                  }}
                />
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(232, 237, 245, 0.28)",
                  }}
                />
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(232, 237, 245, 0.28)",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "BAYONDY Mono",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#37D6D0",
                }}
              >
                {playerLabel}
              </span>
            </div>

            {/* Orbital rings + Hero B-Portail */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                height: "250px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "224px",
                  height: "224px",
                  borderRadius: "999px",
                  border: "1px solid rgba(40, 100, 255, 0.26)",
                  backgroundImage:
                    "radial-gradient(circle, rgba(55, 214, 208, 0.16) 0%, rgba(40, 100, 255, 0.06) 55%, transparent 74%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "168px",
                  height: "168px",
                  borderRadius: "999px",
                  border: "1px solid rgba(55, 214, 208, 0.24)",
                }}
              />
              <PortalMarkSvg size={126} idSuffix={`hero-${lang}`} />
            </div>

            {/* Minimalist video player bar */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "rgba(8, 11, 20, 0.72)",
                border: "1px solid rgba(232, 237, 245, 0.10)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "999px",
                      backgroundImage:
                        "linear-gradient(135deg, #37D6D0 0%, #2864FF 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="10"
                      height="12"
                      viewBox="0 0 10 12"
                      fill="none"
                    >
                      <path d="M1.5 1L9 6L1.5 11V1Z" fill="#080B14" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: "BAYONDY Mono",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#E8EDF5",
                    }}
                  >
                    {SITE_NAME}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "BAYONDY Mono",
                    fontSize: "12px",
                    color: "#37D6D0",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {t("catalogue.langues.ht", lang)}
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(232, 237, 245, 0.12)",
                  display: "flex",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "68%",
                    height: "100%",
                    borderRadius: "999px",
                    backgroundImage:
                      "linear-gradient(90deg, #2864FF 0%, #37D6D0 100%)",
                  }}
                />
              </div>
            </div>
          </div>
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
  const slogan = t("accueil.slogan", lang);
  const { lead, accent } = splitSloganAccent(slogan);
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
            "radial-gradient(circle at 86% 24%, rgba(55, 214, 208, 0.24) 0%, rgba(40, 100, 255, 0.20) 36%, transparent 66%), radial-gradient(circle at 12% 88%, rgba(20, 36, 59, 0.85) 0%, transparent 62%)",
          fontFamily: "BAYONDY Sans",
          color: "#E8EDF5",
          position: "relative",
        }}
      >
        <ArchitecturalBackdrop idSuffix={`course-${lang}`} />

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
              opacity: 0.34,
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
              backgroundImage:
                "linear-gradient(95deg, rgba(8, 11, 20, 0.96) 0%, rgba(8, 11, 20, 0.90) 56%, rgba(8, 11, 20, 0.62) 100%)",
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
            <BrandTile size={54} idSuffix={`course-tile-${lang}`} />
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.14em",
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
              backgroundColor: "rgba(13, 21, 38, 0.88)",
              border: "1px solid rgba(55, 214, 208, 0.36)",
              color: "#37D6D0",
              fontFamily: "BAYONDY Mono",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
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
            gap: "24px",
            maxWidth: "980px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "60px",
              fontWeight: 700,
              lineHeight: 1.14,
              letterSpacing: "-0.025em",
              maxHeight: "142px",
              overflow: "hidden",
              color: "#E8EDF5",
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              width: "110px",
              height: "5px",
              borderRadius: "999px",
              backgroundImage:
                "linear-gradient(90deg, #2864FF 0%, #37D6D0 100%)",
            }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "20px",
            borderTop: "1px solid rgba(232, 237, 245, 0.16)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
              fontSize: "24px",
              fontWeight: 700,
              color: "rgba(232, 237, 245, 0.88)",
            }}
          >
            {lead ? <span>{lead}</span> : null}
            <span
              style={{
                fontFamily: "BAYONDY Serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "#5CF0EA",
                fontSize: "27px",
              }}
            >
              {accent}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <PortalMarkSvg size={32} idSuffix={`course-foot-${lang}`} />
            <span
              style={{
                fontFamily: "BAYONDY Mono",
                fontSize: "14px",
                color: "rgba(232, 237, 245, 0.65)",
                letterSpacing: "0.10em",
              }}
            >
              {SITE_NAME}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: OG_FONTS,
    }
  );
}
