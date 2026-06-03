import { NextResponse } from "next/server";
import { canAccessGuestManagement, getAuthenticatedRequestUser, isSuperAdmin } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const EVENT_ADMINS_TABLE = process.env.SUPABASE_EVENT_ADMINS_TABLE ?? "event_admins";
const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";

type EventAdminRow = {
  id: number;
  user_id: string;
  role: "admin" | "owner";
  created_at: string;
};

type EventAdminResponse = {
  id: number;
  userId: string;
  role: "admin" | "owner";
  createdAt: string;
};

async function verifyEventAccess(eventId: string, request: Request) {
  const user = await getAuthenticatedRequestUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!canAccessGuestManagement(user)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data: event, error: eventError } = await supabaseAdmin
    .from(EVENTS_TABLE)
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) {
    return { error: NextResponse.json({ error: eventError.message }, { status: 500 }) };
  }

  if (!event) {
    return { error: NextResponse.json({ error: "Event not found" }, { status: 404 }) };
  }

  if (!isSuperAdmin(user)) {
    const { data: adminRecord } = await supabaseAdmin
      .from(EVENT_ADMINS_TABLE)
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminRecord) {
      return { error: NextResponse.json({ error: "Forbidden: You are not an admin of this event" }, { status: 403 }) };
    }
  }

  return { user };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;
    const auth = await verifyEventAccess(eventId, request);
    if ("error" in auth) {
      return auth.error;
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: admins, error } = await supabaseAdmin
      .from(EVENT_ADMINS_TABLE)
      .select("id, user_id, role, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      admins: (admins ?? []).map((admin: EventAdminRow) => ({
        id: admin.id,
        userId: admin.user_id,
        role: admin.role,
        createdAt: admin.created_at,
      } satisfies EventAdminResponse)),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch event admins" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isSuperAdmin(user)) {
      return NextResponse.json({ error: "Forbidden: Only super admins can manage event admins" }, { status: 403 });
    }

    const body = (await request.json()) as { userId: string; role?: "admin" | "owner" };
    const userId = body.userId?.trim();
    const role = body.role === "owner" ? "owner" : "admin";

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Verify event exists
    const { data: event, error: eventError } = await supabaseAdmin
      .from(EVENTS_TABLE)
      .select("id")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      throw new Error(eventError.message);
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify user exists and has admin/super_admin role
    const targetUser = await supabaseAdmin.auth.admin.getUserById(userId);
    if (targetUser.error || !targetUser.data.user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const targetUserRole = (
      targetUser.data.user.user_metadata?.role ?? 
      targetUser.data.user.app_metadata?.role ?? 
      "guest"
    ) as string;

    const normalizedRole = targetUserRole.trim().toLowerCase().replace(/\s+/g, "_");
    if (normalizedRole !== "admin" && normalizedRole !== "super_admin") {
      return NextResponse.json(
        { error: "Only admin or super_admin users can be added as event admins" },
        { status: 400 }
      );
    }

    // Add admin to event
    const { data: result, error: insertError } = await supabaseAdmin
      .from(EVENT_ADMINS_TABLE)
      .insert({
        event_id: eventId,
        user_id: userId,
        role,
      })
      .select("id, user_id, role, created_at")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "User is already an admin of this event" },
          { status: 409 }
        );
      }
      throw new Error(insertError.message);
    }

    return NextResponse.json({
      admin: {
        id: result.id,
        userId: result.user_id,
        role: result.role,
        createdAt: result.created_at,
      } satisfies EventAdminResponse,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add event admin" },
      { status: 500 }
    );
  }
}
