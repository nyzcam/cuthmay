import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { findGuestBySlug, getGuestDisplayName } from "@/data/guestList";

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
  const guestName = normalizeGuestName(guestSlug);

  const fontData = await fetch(
    new URL("../../../../app/fonts/Moul-Regular.ttf", import.meta.url)
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
          background: "linear-gradient(135deg, #7a1c1c, #d4af37)",
          color: "#fff",
          fontFamily: "Khmer",
          textAlign: "center",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 70 }}>សូមគោរមអញ្ជើញ</div>
        <div style={{ fontSize: 92, fontWeight: "bold", marginTop: 20 }}>
          {guestName}
        </div>
        <div style={{ fontSize: 48, marginTop: 40 }}>
          ចូលរួមពិធីមង្គលការ
        </div>
        <div style={{ fontSize: 36, marginTop: 10 }}>
          កុម្ភម្នី & កញ្ញា គន្ធា
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Khmer",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
