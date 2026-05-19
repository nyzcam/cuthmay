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

async function getFontData(): Promise<ArrayBuffer> {
  return fetch(
    new URL("../../../../app/fonts/lmnr3.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
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
  const guest = findGuestBySlug(slug);
  if (guest) return getGuestDisplayName(guest);

  const dbGuestName = await getGuestNameFromDatabase(slug);
  if (dbGuestName) return dbGuestName;

  try {
    return decodeURIComponent(slug).replace(/-/g, " ");
  } catch {
    console.error(`Failed to decode guest slug: ${slug}`);
    return DEFAULT_GUEST_NAME;
  }
}

function toLimonGuestNameIfKhmer(text: string): string {
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

function hexToRgb(color: string) {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return { r, g, b };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ guestSlug: string }> }
) {
  const { guestSlug } = await context.params;
  const { searchParams } = new URL(req.url);

  if (!guestSlug || guestSlug.length > MAX_SLUG_LENGTH) {
    return new Response("Invalid guest slug", { status: 400 });
  }

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
  const accentRgb = hexToRgb(theme.accent);

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

        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: 1080,
            height: 510,
            borderRadius: 32,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), inset 0 0 28px rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.08)`,
            opacity: 0.95,
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 32,
              background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 22%, rgba(255,255,255,0) 45%)",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              right: -40,
              top: 54,
              width: 180,
              height: 360,
              borderRadius: 999,
              background: `linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.1) 35%, rgba(255,255,255,0) 100%)`,
              opacity: 0.9,
              transform: "rotate(10deg)",
            }}
          />

          <div
            style={{
              fontSize: 75,
              lineHeight: 1.1,
              marginBottom: 8,
              opacity: 0.9,
              letterSpacing: 2,
              textShadow: `0 2px 4px rgba(0,0,0,0.3)`,
            }}
          >
            {titleTop}
          </div>

          <div
            style={{
              fontSize: 57,
              marginBottom: 32,
              opacity: 0.85,
            }}
          >
            {titleMain}
          </div>

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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <div 
              style={{ 
                width: 250, 
                height: 2, 
                background: `linear-gradient(to right, transparent, ${theme.accent}, transparent)` 
              }} 
            />
          </div>

          <div
            style={{
              fontSize: 52,
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
