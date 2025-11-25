import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// Consider loading a custom font for better Khmer script rendering
// const interBold = fetch(
//   new URL("./Inter-Bold.ttf", import.meta.url)
// ).then((res) => res.arrayBuffer());

export async function GET(
  req: NextRequest,
  { params }: { params: { guestSlug: string } }
) {
  const { guestSlug } = params;

  try {
    const decoded = decodeURIComponent(guestSlug).replace(/-/g, " ");
    const guestName = decoded || "ភ្ញៀវ";

    const title = `សូមគោរមអញ្ជើញ ${guestName}`;
    const subtitle = "សិរីសួស្ដីអាពាហ៍ពិពាហ៍";
    const details = "អាទិត្យ ១៧ មេសា ២០២៦ • ម៉ោង ៦:០០ល្ងាច";

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
            background: "linear-gradient(135deg, #0a1220 0%, #1e3a5f 50%, #0a1220 100%)",
            color: "white",
            textAlign: "center",
            padding: "60px 40px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 40,
              right: 40,
              height: 2,
              background: "linear-gradient(90deg, transparent, #ffffff66, transparent)",
            }}
          />
          
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              marginBottom: 30,
              background: "linear-gradient(45deg, #ffffff, #e2e8f0)",
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
              borderTop: "1px solid rgba(255,255,255,0.3)",
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

          {/* Bottom decorative element */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 40,
              right: 40,
              height: 2,
              background: "linear-gradient(90deg, transparent, #ffffff66, transparent)",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // fonts: [
        //   {
        //     name: "Inter",
        //     data: await interBold,
        //     weight: 700,
        //   },
        // ],
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    
    // Fallback image in case of error
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