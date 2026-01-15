import { ImageResponse } from "next/og";
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
  req: Request,
  { params }: { params: { guestSlug: string } }
) {
  const guestName = normalizeGuestName(params.guestSlug);

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
        <div style={{ fontSize: 70, marginBottom: 20 }}>
          សូមគោរមអញ្ជើញ
        </div>

        <div style={{ fontSize: 90, fontWeight: "bold" }}>
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
