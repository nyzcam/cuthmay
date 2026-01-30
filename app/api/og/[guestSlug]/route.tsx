// app/api/og/[guestSlug]/route.ts

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { findGuestBySlug, getGuestDisplayName } from "@/data/guestList";
import { toLimon } from "@/lips/khmerLimon";
import { getTheme, DEFAULT_THEME, type ThemeName } from "@/config/themeConfig";

export const runtime = "edge";

const DEFAULT_GUEST_NAME = "ភ្ញៀវកិត្តិយស";

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
  const titleMain = toLimon("សូមគោរបអញ្ជើញ");
  const date = toLimon("ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មេសា ឆ្នាំ ២០២៧");

  const fontData = await fetch(
    new URL("../../../../app/fonts/lmnr3.ttf", import.meta.url)
  ).then(res => res.arrayBuffer());

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

        {/* Main panel */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 980,
            padding: "56px 48px",
            borderRadius: 28,
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            border: `1px solid ${theme.accent}55`,
            boxShadow: `0 30px 60px -20px ${theme.accent}25`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontFamily: "Limon",
            color: theme.accent,
          }}
        >
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
              marginBottom: 12,
              textShadow: `0 2px 6px ${theme.accent}30`,
            }}
          >
            {titleTop}
          </div>

          <div
            style={{
              fontSize: 54,
              marginBottom: 20,
              opacity: 0.95,
            }}
          >
            {titleMain}
          </div>

          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              lineHeight: 1.05,
              marginBottom: 28,
              textShadow: `0 4px 10px ${theme.accent}40`,
            }}
          >
            {guestName}
          </div>

          <div
            style={{
              width: 160,
              height: 1,
              background: borderGradient,
              marginBottom: 16,
            }}
          />

          <div
            style={{
              fontSize: 34,
              letterSpacing: 0.5,
              opacity: 0.9,
            }}
          >
            {date}
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
    }
  );
}
