import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { themeConfig } from "@/config/themeConfig";
import { findGuestBySlug, getGuestDisplayName } from "@/data/guestList";
import React from "react";

export const runtime = "edge" as const;

export async function GET(
  req: NextRequest,
  { params }: { params: { guestSlug: string } }
) {
  const guestSlug = params?.guestSlug;

  let guestName = "ភ្ញៀវកិត្តិយស";

  if (guestSlug) {
    const matched = findGuestBySlug(guestSlug);
    if (matched) {
      guestName = getGuestDisplayName(matched);
    } else {
      try {
        const decoded = decodeURIComponent(guestSlug).replace(/-/g, " ");
        if (decoded) guestName = decoded;
      } catch (e) {
        // keep default
      }
    }
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
    },
  };

  const fontMoulData = await fetch(
    new URL("https://fonts.gstatic.com/s/moul/v26/P5sHzZjMdOrmPHDP.ttf")
  ).then((res) => res.arrayBuffer());

  const container = React.createElement(
    "div",
    {
      style: {
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
      },
    },
    React.createElement(
      "div",
      { style: { marginBottom: "20px", opacity: 0.9, display: "flex" } },
      React.createElement(
        "svg",
        { width: 120, height: 120, viewBox: "0 0 100 100" },
        React.createElement("circle", {
          cx: 50,
          cy: 50,
          r: 45,
          stroke: theme.accent,
          strokeWidth: 4,
          fill: "none",
        }),
        React.createElement("circle", { cx: 50, cy: 50, r: 5, fill: theme.accent })
      )
    ),
    React.createElement(
      "div",
      {
        style: {
          fontSize: "56px",
          display: "flex",
          marginBottom: "16px",
          backgroundImage: `linear-gradient(90deg, ${theme.cssVars.goldDark}, ${theme.cssVars.goldLight}, ${theme.cssVars.goldLightest}, ${theme.cssVars.goldMedium}, ${theme.cssVars.goldDark})`,
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 2px 4px rgba(0,0,0,0.25)",
        },
      },
      "សិរីសួស្ដីអាពាហ៍ពិពាហ៍"
    ),
    React.createElement(
      "div",
      { style: { fontSize: "42px", color: theme.cssVars.goldLight, marginBottom: "8px" } },
      "សូមគោរមអញ្ជើញ"
    ),
    React.createElement(
      "div",
      { style: { fontSize: "32px", color: theme.cssVars.goldLight, marginBottom: "30px" } },
      "ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា"
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          border: `6px solid ${theme.accent}`,
          borderRadius: "16px",
          padding: "20px 40px",
          marginBottom: "35px",
          backgroundColor: "rgba(0,0,0,0.1)",
        },
      },
      React.createElement(
        "span",
        {
          style: {
            fontSize: "40px",
            backgroundImage: `linear-gradient(90deg, ${theme.cssVars.goldDark}, ${theme.cssVars.goldLight}, ${theme.cssVars.goldLightest}, ${theme.cssVars.goldMedium}, ${theme.cssVars.goldDark})`,
            backgroundClip: "text",
            color: "transparent",
          },
        },
        guestName
      )
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: "30px",
          color: theme.cssVars.goldLight,
          lineHeight: "1.4",
        },
      },
      React.createElement("span", null, "ថ្ងៃ អាទិត្យ ទី ១៧ ខែ មេសា ឆ្នាំ ២០២៦"),
      React.createElement("span", null, "វេលាម៉ោង៖ ៦ៈ០០ ល្ងាច នៅគេហដ្ឋានខាងស្រី")
    )
  );

  return new ImageResponse(container, {
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
  });
}
