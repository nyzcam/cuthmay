import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(GUESTS_TABLE)
      .select(
        "slug, khmer_name, english_name, title, relationship, status, created_by_user_id, created_by_email, created_by_name"
      )
      .order("created_at", { ascending: false });

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
        createdByUserId: guest.created_by_user_id ?? undefined,
        createdByEmail: guest.created_by_email ?? undefined,
        createdByName: guest.created_by_name ?? undefined,
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
