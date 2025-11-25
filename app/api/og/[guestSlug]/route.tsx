import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { themeConfig } from "@/config/themeConfig";
import { findGuestBySlug, getGuestDisplayName } from "@/data/guestList";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ guestSlug: string }> }
) {
  const params = await props.params;
  const { guestSlug } = params;
  
  let guestName = "ភ្ញៀវកិត្តិយស";

  const guest = findGuestBySlug(guestSlug);
  
  if (guest) {
    guestName = getGuestDisplayName(guest);
  } else {
    const decoded = decodeURIComponent(guestSlug).replace(/-/g, " ");
    if (decoded) guestName = decoded;
  }

  const { searchParams } = new URL(req.url);
  const themeName = (searchParams.get("theme") as keyof typeof themeConfig) ?? "red";

  const theme = themeConfig?.[themeName] ?? themeConfig?.["red"] ?? {
    gradient: "linear-gradient(to right, #b91d47, #ef233c)",
    accent: "#fca311",
    cssVars: {
      goldDark: "#B8860B",
      goldLight: "#F0E68C",
      goldLightest: "#FFFACD",
      goldMedium: "#FFD700",
    }
  };
  const fontMoulData = await fetch(
    new URL("https://fonts.gstatic.com/s/moul/v26/P5sHzZjMdOrmPHDP.ttf")
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          fontFamily: '"Moul"',
          backgroundImage: theme.gradient,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "40px",
        }}
      >
        {/* Decorative Circle */}
        <div style={{ marginBottom: "20px", opacity: 0.9, display: 'flex' }}>
          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke={theme.accent} strokeWidth="4" fill="none" />
            <circle cx="50" cy="50" r="5" fill={theme.accent} />
          </svg>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: "56px",
            display: "flex",
            marginBottom: "16px",
            backgroundImage: `linear-gradient(90deg, ${theme.cssVars.goldDark}, ${theme.cssVars.goldLight}, ${theme.cssVars.goldLightest}, ${theme.cssVars.goldMedium}, ${theme.cssVars.goldDark})`,
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 2px 4px rgba(0,0,0,0.25)",
          }}
        >
          សិរីសួស្ដីអាពាហ៍ពិពាហ៍
        </div>

        <div style={{ fontSize: "42px", color: theme.cssVars.goldLight, marginBottom: "8px" }}>
          សូមគោរមអញ្ជើញ
        </div>

        <div style={{ fontSize: "32px", color: theme.cssVars.goldLight, marginBottom: "30px" }}>
          ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា
        </div>

        {/* Guest Name Box */}
        <div
          style={{
            display: "flex",
            border: `6px solid ${theme.accent}`,
            borderRadius: "16px",
            padding: "20px 40px",
            marginBottom: "35px",
            backgroundColor: "rgba(0,0,0,0.1)",
          }}
        >
          <span
            style={{
              fontSize: "40px",
              backgroundImage: `linear-gradient(90deg, ${theme.cssVars.goldDark}, ${theme.cssVars.goldLight}, ${theme.cssVars.goldLightest}, ${theme.cssVars.goldMedium}, ${theme.cssVars.goldDark})`,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {guestName}
          </span>
        </div>

        {/* Footer Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: "30px",
            color: theme.cssVars.goldLight,
            lineHeight: "1.4",
          }}
        >
          <span>ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មេសា ឆ្នាំ ២០២៦</span>
          <span>វេលាម៉ោង៖ ៦ៈ០០ ល្ងាច នៅគេហដ្ឋានខាងស្រី</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Moul",
          data: fontMoulData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}