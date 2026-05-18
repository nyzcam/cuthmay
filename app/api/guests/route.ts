import { NextResponse } from "next/server";
import { canAccessGuestManagement, getAuthenticatedRequestUser, isSuperAdmin } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessGuestManagement(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    let query = supabaseAdmin
      .from(GUESTS_TABLE)
      .select(
        "slug, khmer_name, english_name, title, relationship, status, created_by_user_id, created_by_email, created_by_name"
      )
      .order("created_at", { ascending: false });

    if (!isSuperAdmin(user)) {
      query = query.eq("created_by_user_id", user.id);
    }

    const { data, error } = await query;

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

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessGuestManagement(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const slug = url.searchParams.get("slug")?.trim();

    if (!slug) {
      return NextResponse.json({ error: "Missing guest slug" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    
    // Non-super-admins can only delete their own guests
    if (!isSuperAdmin(user)) {
      const { data: guestData, error: guestError } = await supabaseAdmin
        .from(GUESTS_TABLE)
        .select("created_by_user_id")
        .eq("slug", slug)
        .single();
        
      if (guestError) {
        return NextResponse.json({ error: "Guest not found" }, { status: 404 });
      }
      
      if (guestData.created_by_user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden: You don't own this guest" }, { status: 403 });
      }
    }

    const { error } = await supabaseAdmin
      .from(GUESTS_TABLE)
      .delete()
      .eq("slug", slug);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete guest" },
      { status: 500 }
    );
  }
}
