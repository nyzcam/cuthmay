import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { themeConfig } from "@/config/themeConfig"; 

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ guestSlug?: string }> }
) {
  const { searchParams } = new URL(req.url);
  const guestParam = searchParams.get("guest");
  
  const guestName =
    guestParam?.replace(/-/g, " ") ||
    "លោក សែត កុម្ភម្នី";

  const themeName =
    (searchParams.get("theme") as keyof typeof themeConfig) ?? "red";

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
          textAlign: "center",
          fontFamily: "font-khmer",
          backgroundImage: theme.gradient,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "40px",
        }}
      >
        <div style={{ marginBottom: "20px", opacity: 0.9 }}>
          <svg width="150" height="150" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={theme.accent}
              strokeWidth="4"
              fill="none"
            />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            marginBottom: "16px",
            backgroundImage: `linear-gradient(
              90deg,
              ${theme.cssVars.goldDark},
              ${theme.cssVars.goldLight},
              ${theme.cssVars.goldLightest},
              ${theme.cssVars.goldMedium},
              ${theme.cssVars.goldDark}
            )`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow: "0 2px 4px rgba(0,0,0,0.25)",
          }}
        >
          សិរីសួស្ដីអាពាហ៍ពិពាហ៍
        </h1>

        <h2
          style={{
            fontSize: "42px",
            color: theme.cssVars.goldLight,
            marginBottom: "8px",
          }}
        >
          សូមគោរមអញ្ជើញ
        </h2>

        <h3
          style={{
            fontSize: "32px",
            color: theme.cssVars.goldLight,
            marginBottom: "30px",
          }}
        >
          ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា
        </h3>

        <div
          style={{
            width: "500px",
            height: "140px",
            border: `6px solid ${theme.accent}`,
            borderRadius: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            marginBottom: "35px",
          }}
        >
          <span
            style={{
              fontSize: "40px",
              fontWeight: 600,
              backgroundImage: `linear-gradient(
                90deg,
                ${theme.cssVars.goldDark},
                ${theme.cssVars.goldLight},
                ${theme.cssVars.goldLightest},
                ${theme.cssVars.goldMedium},
                ${theme.cssVars.goldDark}
              )`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
          >
            {guestName}
          </span>
        </div>

        <div
          style={{
            fontSize: "30px",
            color: theme.cssVars.goldLight,
            lineHeight: "1.5",
          }}
        >
          <div>ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មេសា ឆ្នាំ ២០២៦ វេលាម៉ោង៖ ៦ៈ០០ ល្ងាច</div>
          <div>នៅគេហដ្ឋានខាងស្រី</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}