import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

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

    const decoded = decodeURIComponent(guestSlug).replace(/-/g, " ");
    const guestName = decoded || "ភ្ញៀវ";

    const title = `សូមគោរមអញ្ជើញ ${guestName}`;
    const subtitle = "សិរីសួស្ដីអាពាហ៍ពិពាហ៍";
    const details = "អាទិត្យ ១៧ មេសា ២០២៦";

    // Fetch Khmer font (Moul from Google Fonts)
    let fontData: ArrayBuffer | null = null;
    try {
      const fontRes = await fetch(
        "https://fonts.gstatic.com/s/moul/v26/P5sHzZjMdOrmPHDP.ttf",
        { next: { revalidate: 604800 } } // cache for 1 week
      );
      if (fontRes.ok) {
        fontData = await fontRes.arrayBuffer();
      }
    } catch (e) {
      console.warn("Failed to fetch Khmer font, using system fonts");
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
            fontFamily: fontData ? "Moul, sans-serif" : "sans-serif",
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
            }}
          >
            {subtitle}
          </div>
          
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              marginBottom: 40,
              lineHeight: 1.3,
              maxWidth: "90%",
            }}
          >
            {title}
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
            }}
          >
            {details}
          </div>
          
          <div
            style={{
              fontSize: 24,
              opacity: 0.7,
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
        ...(fontData
          ? {
              fonts: [
                {
                  name: "Moul",
                  data: fontData,
                  style: "normal" as const,
                  weight: 400,
                },
              ],
            }
          : {}),
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
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            background: "linear-gradient(135deg, #0a1220, #123456)",
            color: "white",
            textAlign: "center",
            padding: "40px",
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 600 }}>
            សិរីសួស្ដីអាពាហ៍ពិពាហ៍
          </div>
          <div style={{ fontSize: 40, marginTop: 20 }}>
            សូមគោរមអញ្ជើញ
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}