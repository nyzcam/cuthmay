import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { findGuestBySlug, getGuestDisplayName } from "@/data/guestList";

export const runtime = "edge";

type ThemeName =
  | "red"
  | "green"
  | "blue"
  | "roseGold"
  | "peach"
  | "aurora"
  | "ocean"
  | "sunset"
  | "jade";

interface Theme {
  gradient: string;
  accent: string;
}

const themeConfig: Record<ThemeName, Theme> = {
  red: {
    gradient: "radial-gradient(ellipse at center, #6f0000 0%, #200122 100%)",
    accent: "#efbf04",
  },
  green: {
    gradient:
      "radial-gradient(ellipse at center, #15803d 0%, #166534 50%, #052e16 100%)",
    accent: "#efbf04",
  },
  blue: {
    gradient: "radial-gradient(ellipse at center, #004e92 0%, #000428 100%)",
    accent: "#efbf04",
  },
  roseGold: {
    gradient: "radial-gradient(ellipse at center, #dbe6f6 0%, #c5796d 100%)",
    accent: "#5d2f40",
  },
  peach: {
    gradient: "radial-gradient(ellipse at center, #ffedbc 0%, #ed4264 100%)",
    accent: "#5d2f40",
  },
  aurora: {
    gradient:
      "radial-gradient(ellipse at center, #667eea 0%, #764ba2 50%, #2b1055 100%)",
    accent: "#fbbf24",
  },
  ocean: {
    gradient:
      "radial-gradient(ellipse at center, #006d77 0%, #003049 50%, #001219 100%)",
    accent: "#ffd60a",
  },
  sunset: {
    gradient:
      "radial-gradient(ellipse at center, #ff6b35 0%, #f7931e 30%, #c1121f 70%, #370617 100%)",
    accent: "#ffe5d9",
  },
  jade: {
    gradient:
      "radial-gradient(ellipse at center, #064e3b 0%, #022c22 50%, #0a0e0d 100%)",
    accent: "#10b981",
  },
};

const DEFAULT_THEME: ThemeName = "red";

const getTheme = (themeName: string = DEFAULT_THEME): Theme => {
  return themeConfig[themeName as ThemeName] || themeConfig[DEFAULT_THEME];
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guestSlug: string }> }
) {
  try {
    const { guestSlug } = await params;
    const { searchParams } = new URL(req.url);
    const themeName = searchParams.get("theme") || DEFAULT_THEME;
    const theme = getTheme(themeName);

    const guest = findGuestBySlug(guestSlug);
    let displayName = "ភ្ញៀវកិត្តិយស";

    if (guest) {
      displayName = getGuestDisplayName(guest);
    } else {
      const decoded = decodeURIComponent(guestSlug).replace(/-/g, "\u17D2");
      if (decoded) displayName = decoded;
    }

    const title = `សូមគោរពអញ្ជើញ`;
    const subtitle = "សិរីសួស្ដីអាពាហ៍ពិពាហ៍";
    const details = "អាទិត្យ ១៧ មេសា ២០២៦";

    let fontData: ArrayBuffer | null = null;
    
    try {
      const fontUrl = new URL("../../../fonts/khmer.ttf", import.meta.url);
      fontData = await fetch(fontUrl).then((res) => {
        if (!res.ok) throw new Error("Failed to load font");
        return res.arrayBuffer();
      });
    } catch (fontError) {
      console.warn("Khmer font not available, using system fonts");
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            background: theme.gradient,
            color: "white",
            textAlign: "center",
            padding: "60px 40px",
            fontFamily: fontData ? '"Khmer Boran"' : 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 40,
              right: 40,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${theme.accent}66, transparent)`,
            }}
          />

          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              marginBottom: 30,
              background: `linear-gradient(45deg, ${theme.accent}, #ffffff)`,
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              fontFamily: fontData ? '"Khmer Boran"' : 'system-ui, sans-serif',
            }}
          >
            {subtitle}
          </div>

          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              marginBottom: 40,
              lineHeight: 1.4,
              maxWidth: "90%",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              fontFamily: fontData ? '"Khmer Boran"' : 'system-ui, sans-serif',
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              marginBottom: 40,
              lineHeight: 1.4,
              maxWidth: "90%",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              fontFamily: fontData ? '"Khmer Boran"' : 'system-ui, sans-serif',
            }}
          >
            {displayName}
          </div>

          <div
            style={{
              fontSize: 32,
              opacity: 0.9,
              marginBottom: 20,
              borderTop: `1px solid ${theme.accent}4d`,
              paddingTop: 30,
              paddingLeft: 40,
              paddingRight: 40,
              fontWeight: 700,
              fontFamily: fontData ? '"Khmer Boran"' : 'system-ui, sans-serif',
            }}
          >
            {details}
          </div>

          <div
            style={{
              fontSize: 24,
              opacity: 0.7,
              fontWeight: 700,
              fontFamily: fontData ? '"Khmer Boran"' : 'system-ui, sans-serif',
            }}
          >
            នៅគេហដ្ឋានខាងស្រី
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 40,
              right: 40,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${theme.accent}66, transparent)`,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData ? [
          {
            name: "Khmer Boran",
            data: fontData,
            style: "normal",
            weight: 700,
          },
        ] : [],
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: "#1a1a1a",
            color: "white",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 32,
            flexDirection: "column",
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div>សិរីសួស្ដីអាពាហ៍ពិពាហ៍</div>
          <div style={{ fontSize: 24, marginTop: 20, opacity: 0.8 }}>
            Wedding Invitation
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}

export async function POST() {
  return new Response('Method not allowed', { status: 405 });
}

export async function PUT() {
  return new Response('Method not allowed', { status: 405 });
}