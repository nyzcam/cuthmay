import { NextResponse } from "next/server";
import { canAccessGuestManagement, getAuthenticatedRequestUser, isSuperAdmin } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";
const EVENT_ADMINS_TABLE = process.env.SUPABASE_EVENT_ADMINS_TABLE ?? "event_admins";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessGuestManagement(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const eventId = url.searchParams.get("eventId")?.trim();

    const supabaseAdmin = getSupabaseAdminClient();
    let query = supabaseAdmin
      .from(GUESTS_TABLE)
      .select(
        "slug, khmer_name, english_name, title, relationship, status, created_by_user_id, created_by_email, created_by_name"
      )
      .order("created_at", { ascending: false });

    let allowedEventIds: string[] = [];
    
    if (!isSuperAdmin(user)) {
      const { data: userAdminEvents, error: adminError } = await supabaseAdmin
        .from(EVENT_ADMINS_TABLE)
        .select("event_id")
        .eq("user_id", user.id);
        
      if (adminError) throw new Error(adminError.message);
      
      allowedEventIds = (userAdminEvents ?? []).map(e => e.event_id);
      
      if (allowedEventIds.length === 0) {
        return NextResponse.json({ guests: [] });
      }

      // If specific event is requested, verify admin manages it
      if (eventId && !allowedEventIds.includes(eventId)) {
        return NextResponse.json({ error: "Forbidden: You are not an admin of this event" }, { status: 403 });
      }

      query = query.in("event_id", allowedEventIds);
    }

    if (eventId) {
      query = query.eq("event_id", eventId);
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
    const eventId = url.searchParams.get("eventId")?.trim();

    if (!slug) {
      return NextResponse.json({ error: "Missing guest slug" }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    
    // Non-super-admins can only delete guests in events they're admin of
    if (!isSuperAdmin(user)) {
      const { data: adminRecord } = await supabaseAdmin
        .from(EVENT_ADMINS_TABLE)
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (!adminRecord) {
        return NextResponse.json({ error: "Forbidden: You are not an admin of this event" }, { status: 403 });
      }
    }

    const { error } = await supabaseAdmin
      .from(GUESTS_TABLE)
      .delete()
      .eq("event_id", eventId)
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
