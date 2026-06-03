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
  adminUserIds?: string[];
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

function normalizeUserIds(userIds: string[] | undefined): string[] {
  if (!Array.isArray(userIds)) {
    return [];
  }

  return Array.from(new Set(userIds.map((value) => value?.trim()).filter(Boolean))) as string[];
}

async function validateAdminUserIds(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  userIds: string[]
): Promise<{ validIds: string[]; invalidIds: string[]; nonAdminIds: string[] }> {
  const validIds: string[] = [];
  const invalidIds: string[] = [];
  const nonAdminIds: string[] = [];

  for (const userId of userIds) {
    const userResult = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userResult.error || !userResult.data.user) {
      invalidIds.push(userId);
      continue;
    }

    const role = normalizeRole(
      userResult.data.user.user_metadata?.role ?? userResult.data.user.app_metadata?.role
    );

    if (role !== "admin" && role !== "super_admin") {
      nonAdminIds.push(userId);
      continue;
    }

    validIds.push(userResult.data.user.id);
  }

  return { validIds, invalidIds, nonAdminIds };
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

  return { user, event };
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
    let resolvedOwnerUserId = auth.event.owner_user_id;

    if (!isSuperAdmin(auth.user) && body.theme !== undefined) {
      return NextResponse.json(
        { error: "Forbidden: Only super admins can edit event theme" },
        { status: 403 }
      );
    }

    if (!isSuperAdmin(auth.user) && body.ownerUserId !== undefined) {
      return NextResponse.json(
        { error: "Forbidden: Only super admins can assign event owner" },
        { status: 403 }
      );
    }

    if (!isSuperAdmin(auth.user) && body.adminUserIds !== undefined) {
      return NextResponse.json(
        { error: "Forbidden: Only super admins can assign event admins" },
        { status: 403 }
      );
    }

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
      resolvedOwnerUserId = ownerResolution.ownerId ?? resolvedOwnerUserId;
      updates.owner_user_id = resolvedOwnerUserId;
    }

    if (body.weddingDate !== undefined) {
      const weddingDate = parseDate(body.weddingDate);
      if (body.weddingDate && !weddingDate) {
        return NextResponse.json({ error: "Invalid wedding date" }, { status: 400 });
      }
      updates.wedding_date = weddingDate;
    }

    const shouldSyncAdmins = isSuperAdmin(auth.user) && (body.adminUserIds !== undefined || body.ownerUserId !== undefined);

    if (Object.keys(updates).length === 0 && !shouldSyncAdmins) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    let data: EventRow | null = null;

    if (Object.keys(updates).length > 0) {
      const { data: updatedEvent, error } = await supabaseAdmin
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

      data = updatedEvent;
    } else {
      const { data: existingEvent, error } = await supabaseAdmin
        .from(EVENTS_TABLE)
        .select(
          "id, slug, owner_user_id, display_name, groom_name, bride_name, groom_father_name, groom_mother_name, bride_father_name, bride_mother_name, wedding_date, lunar_date, location_text, direction_map_url, directions_json, hero_title, hero_subtitle, invitation_text, theme, created_at, updated_at"
        )
        .eq("id", eventId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      data = existingEvent;
    }

    if (shouldSyncAdmins) {
      const requestedAdminIds = normalizeUserIds(body.adminUserIds);
      const adminUserIdsToAssign = Array.from(new Set([resolvedOwnerUserId, ...requestedAdminIds]));

      const { invalidIds, nonAdminIds } = await validateAdminUserIds(supabaseAdmin, adminUserIdsToAssign);
      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: `Admin user not found: ${invalidIds.join(", ")}` },
          { status: 400 }
        );
      }

      if (nonAdminIds.length > 0) {
        return NextResponse.json(
          { error: `Only admin or super_admin users can be assigned: ${nonAdminIds.join(", ")}` },
          { status: 400 }
        );
      }

      const { data: existingAdmins, error: existingAdminsError } = await supabaseAdmin
        .from(EVENT_ADMINS_TABLE)
        .select("user_id")
        .eq("event_id", eventId);

      if (existingAdminsError) {
        throw new Error(existingAdminsError.message);
      }

      const userIdsToRemove = (existingAdmins ?? [])
        .map((row) => row.user_id as string)
        .filter((userId) => !adminUserIdsToAssign.includes(userId));

      if (userIdsToRemove.length > 0) {
        const { error: deleteOldAdminsError } = await supabaseAdmin
          .from(EVENT_ADMINS_TABLE)
          .delete()
          .eq("event_id", eventId)
          .in("user_id", userIdsToRemove);

        if (deleteOldAdminsError) {
          throw new Error(deleteOldAdminsError.message);
        }
      }

      const adminRows = adminUserIdsToAssign.map((userId) => ({
        event_id: eventId,
        user_id: userId,
        role: userId === resolvedOwnerUserId ? "owner" : "admin",
      }));

      const { error: upsertAdminsError } = await supabaseAdmin
        .from(EVENT_ADMINS_TABLE)
        .upsert(adminRows, { onConflict: "event_id,user_id" });

      if (upsertAdminsError) {
        throw new Error(upsertAdminsError.message);
      }
    }

    if (!data) {
      throw new Error("Failed to load updated event");
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
