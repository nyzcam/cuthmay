import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { findGuestBySlug, getGuestDisplayName } from "@/data/guestList";
import { toLimon } from "@/lips/khmerLimon";
import { getTheme, DEFAULT_THEME, type ThemeName } from "@/config/themeConfig";

export const runtime = "edge";

const DEFAULT_GUEST_NAME = "ភ្ញៀវកិត្តិយស";

let _fontData: ArrayBuffer | null = null;

async function getFontData(): Promise<ArrayBuffer> {
  if (!_fontData) {
    _fontData = await fetch(
      new URL("../../../../app/fonts/lmnr3.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());
  }
  if (!_fontData) {
    throw new Error("Failed to load OG font data");
  }
  return _fontData;
}

function normalizeGuestName(slug: string) {
  const guest = findGuestBySlug(slug);
  if (guest) return getGuestDisplayName(guest);

  try {
    return decodeURIComponent(slug).replace(/-/g, " ");
  } catch {
    return DEFAULT_GUEST_NAME;
  }
}

function generateOrbGradient(
  color: string,
  startOpacity: number,
  endOpacity: number
) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `radial-gradient(circle at 30% 30%, rgba(${r}, ${g}, ${b}, ${startOpacity}) 0%, rgba(${r}, ${g}, ${b}, ${endOpacity}) 70%)`;
}

function hexToRgb(hexColor: string) {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgba(hexColor: string, alpha: number) {
  const { r, g, b } = hexToRgb(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type OgVisualPreset = "default" | "green" | "roseGold" | "synthwave";

function getOgVisualPreset(themeName: ThemeName): OgVisualPreset {
  if (themeName === "green") return "green";
  if (themeName === "roseGold") return "roseGold";
  if (themeName === "synthwave") return "synthwave";
  return "default";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ guestSlug: string }> }
) {
  const { guestSlug } = await context.params;
  const { searchParams } = new URL(req.url);
  const themeName = (searchParams.get("theme") as ThemeName) || DEFAULT_THEME;

  const theme = getTheme(themeName);
  if (!theme?.accent) {
    return new Response("Invalid theme", { status: 400 });
  }

  const guestNameUnicode = normalizeGuestName(guestSlug);

  const guestName = toLimon(guestNameUnicode);
  const titleTop = toLimon("សិរីសួស្ដីអាពាហ៍ពិពាហ៍");
  const titleMain = toLimon("សូមគោរពអញ្ជើញ");
  const date = toLimon("ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មករា ឆ្នាំ ២០២៧");

  const fontData = await getFontData();
  const visualPreset = getOgVisualPreset(themeName);

  const primaryText = theme.textColors?.primary ?? (theme.isDark ? "#ffffff" : "#1f2937");
  const secondaryText =
    theme.textColors?.secondary ?? (theme.isDark ? "rgba(255,255,255,0.9)" : "#374151");
  const accentSoft = rgba(theme.accent, 0.2);
  const accentMid = rgba(theme.accent, 0.45);
  const accentStrong = rgba(theme.accent, 0.8);
  const panelBackground = theme.isDark ? "rgba(5, 12, 10, 0.42)" : "rgba(255, 255, 255, 0.52)";
  const panelBackdrop = theme.isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.4)";
  const overlayWash =
    visualPreset === "green"
      ? `linear-gradient(115deg, transparent 0%, ${rgba("#86efac", 0.2)} 42%, transparent 100%)`
      : visualPreset === "roseGold"
        ? `linear-gradient(115deg, transparent 0%, ${rgba("#b76e79", 0.2)} 42%, transparent 100%)`
        : visualPreset === "synthwave"
          ? "linear-gradient(100deg, rgba(255,0,128,0.18) 0%, rgba(112,0,255,0.16) 45%, rgba(0,243,255,0.18) 100%)"
          : `linear-gradient(115deg, transparent 0%, ${accentSoft} 45%, transparent 100%)`;

  const borderGradient = `linear-gradient(to bottom, transparent, ${theme.accent}, transparent)`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.gradient,
          overflow: "hidden",
          padding: 48,
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            top: -140,
            left: -120,
            background: generateOrbGradient(theme.accent, 0.35, 0),
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 460,
            height: 460,
            right: -90,
            bottom: -130,
            background: generateOrbGradient(theme.accent, 0.28, 0),
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: overlayWash,
          }}
        />

        {visualPreset === "green" && (
          <>
            <div
              style={{
                position: "absolute",
                left: 110,
                top: 82,
                width: 190,
                height: 190,
                borderRadius: 999,
                border: `1px solid ${rgba("#86efac", 0.3)}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 90,
                bottom: 64,
                width: 230,
                height: 230,
                borderRadius: 999,
                border: `1px solid ${rgba("#4ade80", 0.28)}`,
              }}
            />
          </>
        )}

        {visualPreset === "roseGold" && (
          <>
            <div
              style={{
                position: "absolute",
                left: 72,
                top: 58,
                width: 280,
                height: 1,
                background: `linear-gradient(to right, transparent, ${rgba("#b76e79", 0.6)}, transparent)`,
                transform: "rotate(-16deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 86,
                bottom: 82,
                width: 260,
                height: 1,
                background: `linear-gradient(to right, transparent, ${rgba("#8b4f5c", 0.5)}, transparent)`,
                transform: "rotate(-16deg)",
              }}
            />
          </>
        )}

        {visualPreset === "synthwave" && (
          <>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 190,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 100%), repeating-linear-gradient(to right, rgba(0,243,255,0.25) 0px, rgba(0,243,255,0.25) 2px, transparent 2px, transparent 60px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background:
                  "linear-gradient(to right, rgba(255,0,128,0), rgba(255,0,128,0.9), rgba(0,243,255,0.9), rgba(255,0,128,0))",
              }}
            />
          </>
        )}

        {/* Main panel */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 980,
            padding: "62px 56px 54px",
            borderRadius: 32,
            background: panelBackground,
            border: `1px solid ${accentMid}`,
            boxShadow: `0 34px 72px -24px ${rgba(theme.accent, 0.35)}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontFamily: "Limon",
            color: primaryText,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 32,
              border: `1px solid ${rgba(theme.accent, 0.22)}`,
              background: `linear-gradient(180deg, ${panelBackdrop} 0%, transparent 35%, transparent 100%)`,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 20,
              left: 30,
              right: 30,
              height: 1,
              background: `linear-gradient(to right, transparent, ${accentStrong}, transparent)`,
            }}
          />

          {/* Side lines */}
          <div
            style={{
              position: "absolute",
              top: 96,
              bottom: 96,
              left: 24,
              width: 1,
              background: borderGradient,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 96,
              bottom: 96,
              right: 24,
              width: 1,
              background: borderGradient,
            }}
          />

          <div
            style={{
              fontSize: 72,
              lineHeight: 1.1,
              marginBottom: 10,
              color: secondaryText,
              textShadow: `0 4px 14px ${rgba(theme.accent, 0.2)}`,
            }}
          >
            {titleTop}
          </div>

          <div
            style={{
              fontSize: 54,
              marginBottom: 24,
              opacity: 0.95,
              color: secondaryText,
            }}
          >
            {titleMain}
          </div>

          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: 30,
              color: primaryText,
              textShadow: `0 8px 24px ${rgba(theme.accent, 0.25)}`,
            }}
          >
            {guestName}
          </div>

          <div
            style={{
              width: 220,
              height: 1,
              background: `linear-gradient(to right, transparent, ${accentStrong}, transparent)`,
              marginBottom: 18,
            }}
          />

          <div
            style={{
              fontSize: 34,
              letterSpacing: 0.5,
              opacity: 0.9,
              color: secondaryText,
            }}
          >
            {date}
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 24,
              color: rgba(theme.accent, theme.isDark ? 0.95 : 0.85),
            }}
          >
            cuthmay.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Limon",
          data: fontData,
          style: "normal",
        },
      ],
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
      },
    }
  );
}
