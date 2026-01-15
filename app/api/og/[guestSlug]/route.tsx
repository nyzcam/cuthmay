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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ guestSlug: string }> }
) {
  const { guestSlug } = await context.params;
  const { searchParams } = new URL(req.url);
  const themeName = (searchParams.get("theme") as ThemeName) || DEFAULT_THEME;
  
  const theme = getTheme(themeName);
  if (!theme || !theme.textColors) {
    return new Response("Invalid theme", { status: 400 });
  }

  // Unicode Khmer
  const guestNameUnicode = normalizeGuestName(guestSlug);

  // Convert to Limon glyph string
  const guestName = toLimon(guestNameUnicode);
  const title = toLimon("សូមគោរមអញ្ជើញ");
  const subtitle = toLimon("ចូលរួមពិធីមង្គលការ");
  const couple = toLimon("កុម្ភម្នី & កញ្ញា គន្ធា");

  const fontData = await fetch(
    new URL("../../../../app/fonts/lmnr3.ttf", import.meta.url)
  ).then(res => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: theme.gradient,
          color: theme.textColors.primary,
          fontFamily: "Limon",
          textAlign: "center",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 70, color: theme.textColors.secondary }}>{title}</div>

        <div style={{ fontSize: 92, fontWeight: "bold", marginTop: 20, color: theme.textColors.primary }}>
          {guestName}
        </div>

        <div style={{ fontSize: 48, marginTop: 40, color: theme.textColors.secondary }}>
          {subtitle}
        </div>

        <div style={{ fontSize: 36, marginTop: 10, color: theme.textColors.accent }}>
          {couple}
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
