import { NextResponse } from "next/server";
import { canAccessGuestManagement, getAuthenticatedRequestUser, isSuperAdmin } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";
const EVENT_ADMINS_TABLE = process.env.SUPABASE_EVENT_ADMINS_TABLE ?? "event_admins";

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

type EventRow = {
  id: string;
  slug: string;
  owner_user_id: string;
  display_name: string;
  groom_name: string | null;
  bride_name: string | null;
  groom_father_name: string | null;
  groom_mother_name: string | null;
  bride_father_name: string | null;
  bride_mother_name: string | null;
  wedding_date: string | null;
  lunar_date: string | null;
  location_text: string | null;
  direction_map_url: string | null;
  directions_json: Array<{ id: number; description: string; detail: string }> | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  invitation_text: string | null;
  theme: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeRole(value: unknown): "super_admin" | "admin" | "guest" {
  if (typeof value !== "string") {
    return "guest";
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "super_admin" || normalized === "superadmin") {
    return "super_admin";
  }
  if (normalized === "admin") {
    return "admin";
  }

  return "guest";
}

async function resolveEventOwnerId(
  requestedOwnerUserId: string | undefined,
  fallbackUserId: string
): Promise<{ ownerId?: string; error?: NextResponse }> {
  const ownerUserId = requestedOwnerUserId?.trim();
  if (!ownerUserId) {
    return { ownerId: fallbackUserId };
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const ownerLookup = await supabaseAdmin.auth.admin.getUserById(ownerUserId);
  if (ownerLookup.error || !ownerLookup.data.user) {
    return {
      error: NextResponse.json({ error: "Owner user not found" }, { status: 400 }),
    };
  }

  const ownerRole = normalizeRole(
    ownerLookup.data.user.user_metadata?.role ?? ownerLookup.data.user.app_metadata?.role
  );
  if (ownerRole !== "admin" && ownerRole !== "super_admin") {
    return {
      error: NextResponse.json(
        { error: "Event owner must be an admin or super_admin user" },
        { status: 400 }
      ),
    };
  }

  return { ownerId: ownerLookup.data.user.id };
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapEventRow(event: EventRow) {
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
  if (dateText === undefined) {
    return null;
  }

  if (!dateText.trim()) {
    return null;
  }

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

async function getAuthorizedEvent(eventId: string, request: Request) {
  const user = await getAuthenticatedRequestUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!canAccessGuestManagement(user)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: event, error } = await supabaseAdmin
    .from(EVENTS_TABLE)
    .select("id, owner_user_id")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    return { error: NextResponse.json({ error: error.message }, { status: 500 }) };
  }

  if (!event) {
    return { error: NextResponse.json({ error: "Event not found" }, { status: 404 }) };
  }

  if (!isSuperAdmin(user)) {
    // Check if user is an admin of this event
    const { data: adminRecord } = await supabaseAdmin
      .from(EVENT_ADMINS_TABLE)
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminRecord) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }

  return { user };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;
    const auth = await getAuthorizedEvent(eventId, request);
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as EventPayload;
    const updates: Record<string, unknown> = {};

    if (body.displayName !== undefined) {
      const displayName = body.displayName.trim();
      if (!displayName) {
        return NextResponse.json({ error: "Display name cannot be empty" }, { status: 400 });
      }
      updates.display_name = displayName;
    }

    if (body.slug !== undefined) {
      const slug = toSlug(body.slug);
      if (!slug) {
        return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
      }
      updates.slug = slug;
    }

    if (body.groomName !== undefined) updates.groom_name = body.groomName.trim() || null;
    if (body.brideName !== undefined) updates.bride_name = body.brideName.trim() || null;
    if (body.groomFatherName !== undefined) updates.groom_father_name = body.groomFatherName.trim() || null;
    if (body.groomMotherName !== undefined) updates.groom_mother_name = body.groomMotherName.trim() || null;
    if (body.brideFatherName !== undefined) updates.bride_father_name = body.brideFatherName.trim() || null;
    if (body.brideMotherName !== undefined) updates.bride_mother_name = body.brideMotherName.trim() || null;
    if (body.lunarDate !== undefined) updates.lunar_date = body.lunarDate.trim() || null;
    if (body.locationText !== undefined) updates.location_text = body.locationText.trim() || null;
    if (body.directionMapUrl !== undefined) updates.direction_map_url = body.directionMapUrl.trim() || null;
    if (body.directionsJson !== undefined) updates.directions_json = body.directionsJson.length > 0 ? body.directionsJson : null;
    if (body.heroTitle !== undefined) updates.hero_title = body.heroTitle.trim() || null;
    if (body.heroSubtitle !== undefined) updates.hero_subtitle = body.heroSubtitle.trim() || null;
    if (body.invitationText !== undefined) updates.invitation_text = body.invitationText.trim() || null;
    if (body.theme !== undefined && isSuperAdmin(auth.user)) {
      updates.theme = body.theme.trim() || 'default';
    }
    if (body.ownerUserId !== undefined && isSuperAdmin(auth.user)) {
      const ownerResolution = await resolveEventOwnerId(body.ownerUserId, auth.user.id);
      if (ownerResolution.error) {
        return ownerResolution.error;
      }
      updates.owner_user_id = ownerResolution.ownerId;
    }

    if (body.weddingDate !== undefined) {
      const weddingDate = parseDate(body.weddingDate);
      if (body.weddingDate && !weddingDate) {
        return NextResponse.json({ error: "Invalid wedding date" }, { status: 400 });
      }
      updates.wedding_date = weddingDate;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(EVENTS_TABLE)
      .update(updates)
      .eq("id", eventId)
      .select(
        "id, slug, owner_user_id, display_name, groom_name, bride_name, groom_father_name, groom_mother_name, bride_father_name, bride_mother_name, wedding_date, lunar_date, location_text, direction_map_url, directions_json, hero_title, hero_subtitle, invitation_text, theme, created_at, updated_at"
      )
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Event slug already exists" }, { status: 409 });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ event: mapEventRow(data) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;
    const auth = await getAuthorizedEvent(eventId, request);
    if ("error" in auth) {
      return auth.error;
    }

    if (eventId === "00000000-0000-0000-0000-000000000001") {
      return NextResponse.json({ error: "Default event cannot be deleted" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from(EVENTS_TABLE)
      .delete()
      .eq("id", eventId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, id: eventId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete event" },
      { status: 500 }
    );
  }
}
