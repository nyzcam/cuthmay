import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { findGuestBySlug, getGuestDisplayName } from "@/data/guestList";
import { toLimon } from "@/lips/khmerLimon";
import { getTheme, DEFAULT_THEME, type ThemeName } from "@/config/themeConfig";
import { patternUrl } from "@/data/patternData";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

const DEFAULT_GUEST_NAME = "ភ្ញៀវកិត្តិយស";
const MAX_SLUG_LENGTH = 100;
const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";
const VALID_THEMES = new Set<ThemeName>([
  "red",
  "green",
  "blue",
  "roseGold",
  "peach",
  "aurora",
  "ocean",
  "sunset",
  "jade",
  "silver",
  "midnight",
  "lavender",
  "opal",
  "champagne",
  "arctic",
  "nebula",
  "matcha",
  "carbon",
  "neon",
  "synthwave",
]);

let _fontData: ArrayBuffer | null = null;

async function getFontData(): Promise<ArrayBuffer> {
  if (!_fontData) {
    _fontData = await fetch(
      new URL("../../../../app/fonts/lmnr3.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());
  }
  return _fontData as ArrayBuffer;
}

async function getGuestNameFromDatabase(guestSlug: string): Promise<string | null> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(GUESTS_TABLE)
      .select("khmer_name, title")
      .eq("slug", guestSlug)
      .maybeSingle();

    if (error || !data?.khmer_name) {
      return null;
    }

    if (data.title) {
      return `${data.title} ${data.khmer_name}`;
    }

    return data.khmer_name;
  } catch {
    return null;
  }
}

async function normalizeGuestName(slug: string): Promise<string> {
  const dbGuestName = await getGuestNameFromDatabase(slug);
  if (dbGuestName) return dbGuestName;

  const guest = findGuestBySlug(slug);
  if (guest) return getGuestDisplayName(guest);

  try {
    return decodeURIComponent(slug).replace(/-/g, " ");
  } catch {
    console.error(`Failed to decode guest slug: ${slug}`);
    return DEFAULT_GUEST_NAME;
  }
}

function toLimonGuestNameIfKhmer(text: string): string {
  // Convert only Khmer-script names to avoid corrupting ASCII fallback slugs.
  return /[\u1780-\u17FF]/.test(text) ? toLimon(text) : text;
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

  // Validate input
  if (!guestSlug || guestSlug.length > MAX_SLUG_LENGTH) {
    return new Response("Invalid guest slug", { status: 400 });
  }

  // Validate and get theme
  const themeParam = searchParams.get("theme");
  const themeName: ThemeName = themeParam && VALID_THEMES.has(themeParam as ThemeName)
    ? (themeParam as ThemeName)
    : DEFAULT_THEME;

  const theme = getTheme(themeName);
  if (!theme?.accent) {
    console.error(`Theme not found: ${themeName}`);
    return new Response("Invalid theme", { status: 500 });
  }

  const guestNameUnicode = await normalizeGuestName(guestSlug);

  const guestName = toLimonGuestNameIfKhmer(guestNameUnicode);
  const titleTop = toLimon("សិរីសួស្ដីអាពាហ៍ពិពាហ៍");
  const titleMain = toLimon("សូមគោរពអញ្ជើញ");
  const date = toLimon("ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មករា ឆ្នាំ ២០២៧");

  let fontData: ArrayBuffer;
  try {
    fontData = await getFontData();
  } catch (error) {
    console.error("Font loading failed:", error);
    return new Response("Failed to generate image", { status: 500 });
  }

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
        }}
      >
        {/* Pattern Background */}
        <div
          style={{
            position: "absolute",
            top: -370,
            left: -300,
            width: 2400,
            height: 2400,
            backgroundImage: `url('${patternUrl}')`,
            backgroundSize: "80px 80px",
            backgroundRepeat: "repeat",
            opacity: 0.08,
            transform: "rotate(45deg)",
          }}
        />

        {/* Decorative Orbs */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            top: -200,
            left: -150,
            background: generateOrbGradient(theme.accent, 0.4, 0),
          }}
        />
      

        {/* Main Card */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: 1080,
            height: 510,
            borderRadius: 32,
            backgroundColor: "rgba(10, 10, 10, 0.25)",
            border: `1px solid ${theme.accent}40`,
            boxShadow: `0 32px 64px -16px rgba(0,0,0,0.4)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: "Limon",
            color: theme.accent,
            padding: 48,
          }}
        >
          {/* Inner Decorative Border */}
          <div
            style={{
              position: "absolute",
              top: 24,
              bottom: 24,
              left: 24,
              right: 24,
              borderRadius: 16,
              opacity: 0.8,
            }}
          />

          {/* Top Title */}
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.1,
              marginBottom: 8,
              opacity: 0.9,
              letterSpacing: 2,
              textShadow: `0 2px 4px rgba(0,0,0,0.3)`,
            }}
          >
            {titleTop}
          </div>

          {/* Sub Title */}
          <div
            style={{
              fontSize: 52,
              marginBottom: 32,
              opacity: 0.85,
            }}
          >
            {titleMain}
          </div>

          {/* Guest Name */}
          <div
            style={{
              fontSize: 118,
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 36,
              textShadow: `0 4px 12px ${theme.accent}60`,
              padding: "0 40px",
              textAlign: "center",
            }}
          >
            {guestName}
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <div style={{ width: 80, height: 2, background: borderGradient }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: theme.accent, margin: "0 16px" }} />
            <div style={{ width: 80, height: 2, background: borderGradient }} />
          </div>

          {/* Date */}
          <div
            style={{
              fontSize: 42,
              letterSpacing: 1,
              opacity: 0.9,
              textShadow: `0 2px 4px rgba(0,0,0,0.3)`,
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
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
      },
    }
  );
}
