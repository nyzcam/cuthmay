import { NextResponse } from "next/server";
import type { GuestCommentInput, GuestCommentRecord } from "@/types/types";
import {
  canAccessGuestManagement,
  getAuthenticatedRequestUser,
  isSuperAdmin,
} from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_COMMENT_LENGTH = 130;
const COMMENTS_TABLE = process.env.SUPABASE_GUEST_COMMENTS_TABLE ?? "guest_comments";
const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";
const EVENTS_TABLE = process.env.SUPABASE_EVENTS_TABLE ?? "events";
const EVENT_ADMINS_TABLE = process.env.SUPABASE_EVENT_ADMINS_TABLE ?? "event_admins";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 1;
const ALLOWED_COMMENT_STATUSES = new Set<GuestCommentRecord["status"]>([
  "new",
  "reviewed",
  "archived",
]);
const commentSubmissionBucket = new Map<string, number[]>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

function isRateLimited(key: string, nowMs: number) {
  const existing = commentSubmissionBucket.get(key) ?? [];
  const recent = existing.filter((ts) => nowMs - ts < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    commentSubmissionBucket.set(key, recent);
    return true;
  }

  recent.push(nowMs);
  commentSubmissionBucket.set(key, recent);
  return false;
}

function normalizeComment(raw: string) {
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function normalizePagePath(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) {
    return `/${trimmed}`;
  }
  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

function validateInput(body: Partial<GuestCommentInput>) {
  if (!body.guestSlug || typeof body.guestSlug !== "string") {
    return "Missing guest slug";
  }
  if (!body.pagePath || typeof body.pagePath !== "string") {
    return "Missing page path";
  }
  if (!body.comment || typeof body.comment !== "string") {
    return "Comment is required";
  }

  const normalized = normalizeComment(body.comment);
  if (!normalized) {
    return "Comment cannot be empty";
  }
  if (normalized.length > MAX_COMMENT_LENGTH) {
    return `Comment too long (max ${MAX_COMMENT_LENGTH} characters)`;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Invalid content type" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as Partial<GuestCommentInput>;
    const validationError = validateInput(body);

    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const guestSlug = body.guestSlug!.trim();
    const submittedPagePath = normalizePagePath(body.pagePath!);
    const normalizedComment = normalizeComment(body.comment!);
    const referer = request.headers.get("referer");
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    const clientIp = getClientIp(request);
    const supabaseAdmin = getSupabaseAdminClient();
    const eventPathMatch = /^\/([^/]+)\/([^/]+)$/.exec(submittedPagePath);
    const isLegacyPath = submittedPagePath === `/invite/${guestSlug}`;

    if (!isLegacyPath && (!eventPathMatch || eventPathMatch[2] !== guestSlug)) {
      return NextResponse.json(
        { success: false, error: "Comment must be submitted from guest invite URL" },
        { status: 400 }
      );
    }

    if (isRateLimited(clientIp, Date.now())) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { success: false, error: "Invalid request origin" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid origin header" },
          { status: 400 }
        );
      }
    }

    let resolvedEventId: string | null = null;
    if (eventPathMatch) {
      const eventSlug = eventPathMatch[1];
      const { data: eventData, error: eventLookupError } = await supabaseAdmin
        .from(EVENTS_TABLE)
        .select("id")
        .eq("slug", eventSlug)
        .maybeSingle();

      if (eventLookupError) {
        throw new Error(eventLookupError.message);
      }

      if (!eventData?.id) {
        return NextResponse.json(
          { success: false, error: "Unknown event" },
          { status: 400 }
        );
      }

      resolvedEventId = eventData.id;
    }

    let guestLookupQuery = supabaseAdmin
      .from(GUESTS_TABLE)
      .select("slug, khmer_name, english_name")
      .eq("slug", guestSlug);

    if (resolvedEventId) {
      guestLookupQuery = guestLookupQuery.eq("event_id", resolvedEventId);
    }

    const { data: knownGuest, error: guestLookupError } = await guestLookupQuery.maybeSingle();

    if (guestLookupError) {
      throw new Error(guestLookupError.message);
    }

    if (!knownGuest) {
      return NextResponse.json(
        { success: false, error: "Unknown guest slug" },
        { status: 400 }
      );
    }

    if (referer) {
      try {
        const refererPath = normalizePagePath(new URL(referer).pathname);
        if (refererPath !== submittedPagePath) {
          return NextResponse.json(
            { success: false, error: "Invalid comment source URL" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid referer URL" },
          { status: 400 }
        );
      }
    }

    const normalizedGuestName = knownGuest.khmer_name?.trim() || knownGuest.english_name?.trim() || guestSlug;

    const record: Omit<GuestCommentRecord, "id" | "createdAt"> = {
      guestSlug,
      guestName: normalizedGuestName,
      pagePath: submittedPagePath,
      comment: normalizedComment,
      source: "invite",
      status: "new",
    };

    const { data, error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .insert({
        guest_slug: record.guestSlug,
        guest_name: record.guestName,
        page_path: record.pagePath,
        comment: record.comment,
        source: record.source,
        status: record.status,
        ...(resolvedEventId ? { event_id: resolvedEventId } : {}),
      })
      .select("id, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Comment submitted successfully",
      data: {
        id: data?.id,
        createdAt: data?.created_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit comment",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isPublic = url.searchParams.get("public") === "1";
    const eventId = url.searchParams.get("eventId")?.trim();
    const limitParam = Number(url.searchParams.get("limit") ?? "8");
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(20, Math.trunc(limitParam)))
      : 8;

    let user = null;
    if (!isPublic) {
      user = await getAuthenticatedRequestUser(request);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (!canAccessGuestManagement(user)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const supabaseAdmin = getSupabaseAdminClient();
    
    const queryField = "id, guest_slug, guest_name, page_path, comment, source, status, created_at";

    let query = supabaseAdmin
      .from(COMMENTS_TABLE)
      .select(queryField)
      .order("created_at", { ascending: false });

    if (isPublic) {
      query = query
        .eq("source", "invite")
        .limit(limit);
    } else if (user && !isSuperAdmin(user)) {
      // Non-super-admins can only see comments from events they're admin of
      if (!eventId) {
        return NextResponse.json({ error: "Event id is required for non-super-admins" }, { status: 400 });
      }

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

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const comments: GuestCommentRecord[] = (data as Array<{
      id: number;
      guest_slug: string;
      guest_name: string;
      page_path: string;
      comment: string;
      source: "invite" | "admin" | "seed";
      status: GuestCommentRecord["status"];
      created_at: string;
    }> ?? []).map((row) => ({
      id: String(row.id),
      guestSlug: row.guest_slug,
      guestName: row.guest_name,
      pagePath: row.page_path,
      comment: row.comment,
      source: row.source,
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json(
      { comments },
      {
        headers: {
          "Cache-Control": isPublic ? "public, max-age=30, s-maxage=30" : "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch comments",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessGuestManagement(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as Partial<Pick<GuestCommentRecord, "id" | "status">> & {
      eventId?: string;
    };
    const id = body.id?.trim();
    const status = body.status;
    const eventId = body.eventId?.trim();

    if (!id) {
      return NextResponse.json({ error: "Missing comment id" }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    if (!status || !ALLOWED_COMMENT_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid comment status" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    
    // Non-super-admins can only modify comments from events they're admin of
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

    const { data, error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .update({ status })
      .eq("event_id", eventId)
      .eq("id", Number(id))
      .select("id, guest_slug, guest_name, page_path, comment, source, status, created_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: String(data.id),
        guestSlug: data.guest_slug,
        guestName: data.guest_name,
        pagePath: data.page_path,
        comment: data.comment,
        source: data.source,
        status: data.status,
        createdAt: data.created_at,
      } satisfies GuestCommentRecord,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update comment",
      },
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
    const id = url.searchParams.get("id")?.trim();
    const eventId = url.searchParams.get("eventId")?.trim();

    if (!id) {
      return NextResponse.json({ error: "Missing comment id" }, { status: 400 });
    }

    if (!eventId) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    
    // Non-super-admins can only delete comments for events they're admin of
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
      .from(COMMENTS_TABLE)
      .delete()
      .eq("event_id", eventId)
      .eq("id", numericId);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete comment",
      },
      { status: 500 }
    );
  }
}
