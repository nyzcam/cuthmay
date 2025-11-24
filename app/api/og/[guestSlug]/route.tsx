import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: { guestSlug: string } }
) {
  const { guestSlug } = params;

  const decoded = decodeURIComponent(guestSlug).replace(/-/g, " ");
  const guestName = decoded || "ភ្ញៀវ";

  const title = `សូមគោរមអញ្ជើញ ${guestName}`;
  const subtitle = "សិរីសួស្ដីអាពាហ៍ពិពាហ៍";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
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
        <div style={{ fontSize: 70, fontWeight: 600, marginBottom: 20 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 54, fontWeight: 400, lineHeight: 1.4 }}>
          {title}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
