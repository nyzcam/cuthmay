import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser, isSuperAdmin } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const EVENT_ADMINS_TABLE = process.env.SUPABASE_EVENT_ADMINS_TABLE ?? "event_admins";
const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ eventId: string; userId: string }> }
) {
  try {
    const { eventId, userId } = await context.params;
    const user = await getAuthenticatedRequestUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSuperAdmin(user)) {
      return NextResponse.json(
        { error: "Forbidden: Only super admins can remove event admins" },
        { status: 403 }
      );
    }

    const targetUserId = userId?.trim();
    if (!targetUserId) {
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

    // Check that there's at least one other admin with role='owner' before removing
    const { data: ownerAdmins, error: ownerError } = await supabaseAdmin
      .from(EVENT_ADMINS_TABLE)
      .select("id")
      .eq("event_id", eventId)
      .eq("role", "owner");

    if (ownerError) {
      throw new Error(ownerError.message);
    }

    // If removing an owner and they're the only owner, don't allow it
    const { data: adminToRemove } = await supabaseAdmin
      .from(EVENT_ADMINS_TABLE)
      .select("role")
      .eq("event_id", eventId)
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (adminToRemove?.role === "owner" && (ownerAdmins ?? []).length <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last owner of the event. Assign another owner first." },
        { status: 400 }
      );
    }

    // Remove admin from event
    const { error: deleteError } = await supabaseAdmin
      .from(EVENT_ADMINS_TABLE)
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", targetUserId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove event admin" },
      { status: 500 }
    );
  }
}
