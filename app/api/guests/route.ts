import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(GUESTS_TABLE)
      .select("slug, khmer_name, english_name, title, relationship, status")
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      guests: (data ?? []).map((guest) => ({
        slug: guest.slug,
        khmerName: guest.khmer_name,
        englishName: guest.english_name ?? undefined,
        title: guest.title ?? undefined,
        relationship: guest.relationship ?? undefined,
        status: guest.status ?? undefined,
      })),
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch guests" },
      { status: 500 }
    );
  }
}
