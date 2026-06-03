import { NextResponse } from "next/server";
import { canAccessGuestManagement, getAuthenticatedRequestUser, isSuperAdmin } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";

type EventPayload = {
  slug?: string;
  displayName?: string;
  groomName?: string;
  brideName?: string;
  groomFatherName?: string;
  groomMotherName?: string;
  brideFatherName?: string;
  brideMotherName?: string;
  weddingDate?: string;
  lunarDate?: string;
  locationText?: string;
  directionMapUrl?: string;
  directionsJson?: Array<{ id: number; description: string; detail: string }>;
  heroTitle?: string;
  heroSubtitle?: string;
  invitationText?: string;
  theme?: string;
  ownerUserId?: string;
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapEventRow(event: any) {
  return {
    id: event.id,
    slug: event.slug,
    ownerUserId: event.owner_user_id,
    displayName: event.display_name,
    groomName: event.groom_name,
    brideName: event.bride_name,
    groomFatherName: event.groom_father_name,
    groomMotherName: event.groom_mother_name,
    brideFatherName: event.bride_father_name,
    brideMotherName: event.bride_mother_name,
    weddingDate: event.wedding_date,
    lunarDate: event.lunar_date,
    locationText: event.location_text,
    directionMapUrl: event.direction_map_url,
    directionsJson: event.directions_json,
    heroTitle: event.hero_title,
    heroSubtitle: event.hero_subtitle,
    invitationText: event.invitation_text,
    theme: event.theme,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };
}

function parseDate(dateText: string | undefined): string | null {
  if (!dateText?.trim()) {
    return null;
  }

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

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
  const ownerOnly = url.searchParams.get("ownerOnly") === "1";
    const supabaseAdmin = getSupabaseAdminClient();

    let query = supabaseAdmin
      .from(EVENTS_TABLE)
      .select(
        "id, slug, owner_user_id, display_name, groom_name, bride_name, groom_father_name, groom_mother_name, bride_father_name, bride_mother_name, wedding_date, lunar_date, location_text, direction_map_url, directions_json, hero_title, hero_subtitle, invitation_text, theme, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    // Join with event_admins to check if current user is an admin of the event
    if (!isSuperAdmin(user) || ownerOnly) {
      if (ownerOnly) {
        query = query.eq("owner_user_id", user.id);
      } else {
        // Find events where they are an admin via the event_admins table
        const EVENT_ADMINS_TABLE = process.env.SUPABASE_EVENT_ADMINS_TABLE ?? "event_admins";
        
        const { data: adminEvents } = await supabaseAdmin
          .from(EVENT_ADMINS_TABLE)
          .select("event_id")
          .eq("user_id", user.id);

        const eventIds = adminEvents ? adminEvents.map((ae) => ae.event_id) : [];

        // Also include events they directly own for safety during transition
        query = query.or(`id.in.(${eventIds.join(',')}),owner_user_id.eq.${user.id}`);
      }
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        events: (data ?? []).map(mapEventRow),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessGuestManagement(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as EventPayload;
    const displayName = body.displayName?.trim();
    const slugInput = body.slug?.trim() || displayName || "";
    const slug = toSlug(slugInput);

    if (!displayName) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }

    const weddingDate = parseDate(body.weddingDate);
    if (body.weddingDate && !weddingDate) {
      return NextResponse.json({ error: "Invalid wedding date" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    
    // Only superadmin can assign to a different owner
    const finalOwnerId = isSuperAdmin(user) && body.ownerUserId?.trim() ? body.ownerUserId.trim() : user.id;

    let currentSlug = slug;
    let data, error;
    let attempts = 0;

    while (attempts < 5) {
      const result = await supabaseAdmin
        .from(EVENTS_TABLE)
        .insert({
          slug: currentSlug,
          owner_user_id: finalOwnerId,
          display_name: displayName,
          groom_name: body.groomName?.trim() || null,
          bride_name: body.brideName?.trim() || null,
          groom_father_name: body.groomFatherName?.trim() || null,
          groom_mother_name: body.groomMotherName?.trim() || null,
          bride_father_name: body.brideFatherName?.trim() || null,
          bride_mother_name: body.brideMotherName?.trim() || null,
          wedding_date: weddingDate,
          lunar_date: body.lunarDate?.trim() || null,
          location_text: body.locationText?.trim() || null,
          direction_map_url: body.directionMapUrl?.trim() || null,
          directions_json: body.directionsJson ?? null,
          hero_title: body.heroTitle?.trim() || null,
          hero_subtitle: body.heroSubtitle?.trim() || null,
          invitation_text: body.invitationText?.trim() || null,
          theme: isSuperAdmin(user) ? (body.theme?.trim() || 'default') : 'default',
        })
        .select(
          "id, slug, owner_user_id, display_name, groom_name, bride_name, groom_father_name, groom_mother_name, bride_father_name, bride_mother_name, wedding_date, lunar_date, location_text, direction_map_url, directions_json, hero_title, hero_subtitle, invitation_text, theme, created_at, updated_at"
        )
        .single();
        
      data = result.data;
      error = result.error;

      if (error && error.code === "23505") {
        // Slug already exists, append a random string
        currentSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        attempts++;
        continue;
      }
      
      break;
    }

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Event slug already exists" }, { status: 409 });
      }
      throw new Error(error.message);
    }

    if (data) {
      const EVENT_ADMINS_TABLE = process.env.SUPABASE_EVENT_ADMINS_TABLE ?? "event_admins";
      // Add the creator as the owner automatically in the event_admins table
      await supabaseAdmin.from(EVENT_ADMINS_TABLE).insert({
        event_id: data.id,
        user_id: finalOwnerId,
        role: "owner"
      });
    }

    return NextResponse.json({ event: mapEventRow(data) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create event" },
      { status: 500 }
    );
  }
}
