import { NextResponse } from "next/server";
import type { GuestCommentInput, GuestCommentRecord } from "@/types/types";
import { getAuthenticatedRequestUser } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_COMMENT_LENGTH = 1200;
const COMMENTS_TABLE = process.env.SUPABASE_GUEST_COMMENTS_TABLE ?? "guest_comments";
const GUESTS_TABLE = process.env.SUPABASE_GUESTS_TABLE ?? "guests";
const ALLOWED_COMMENT_STATUSES = new Set<GuestCommentRecord["status"]>([
  "new",
  "reviewed",
  "archived",
]);

function validateInput(body: Partial<GuestCommentInput>) {
  if (!body.guestSlug || typeof body.guestSlug !== "string") {
    return "Missing guest slug";
  }
  if (!body.guestName || typeof body.guestName !== "string") {
    return "Missing guest name";
  }
  if (!body.pagePath || typeof body.pagePath !== "string") {
    return "Missing page path";
  }
  if (!body.comment || typeof body.comment !== "string") {
    return "Comment is required";
  }

  const trimmed = body.comment.trim();
  if (!trimmed) {
    return "Comment cannot be empty";
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return `Comment too long (max ${MAX_COMMENT_LENGTH} characters)`;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<GuestCommentInput>;
    const validationError = validateInput(body);

    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const guestSlug = body.guestSlug!.trim();
    const expectedPath = `/invite/${guestSlug}`;
    const pagePath = body.pagePath!.trim();
    const referer = request.headers.get("referer");
    const supabaseAdmin = getSupabaseAdminClient();

    const { data: knownGuest, error: guestLookupError } = await supabaseAdmin
      .from(GUESTS_TABLE)
      .select("slug")
      .eq("slug", guestSlug)
      .maybeSingle();

    if (guestLookupError) {
      throw new Error(guestLookupError.message);
    }

    if (!knownGuest) {
      return NextResponse.json(
        { success: false, error: "Unknown guest slug" },
        { status: 400 }
      );
    }

    if (pagePath !== expectedPath) {
      return NextResponse.json(
        { success: false, error: "Comment must be submitted from guest invite URL" },
        { status: 400 }
      );
    }

    if (referer) {
      try {
        const refererPath = new URL(referer).pathname;
        if (refererPath !== expectedPath) {
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

    const record: Omit<GuestCommentRecord, "id" | "createdAt"> = {
      guestSlug,
      guestName: body.guestName!.trim(),
      pagePath,
      comment: body.comment!.trim(),
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
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .select("id, guest_slug, guest_name, page_path, comment, source, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const comments: GuestCommentRecord[] = (data ?? []).map((row) => ({
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
          "Cache-Control": "no-store",
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

    const body = (await request.json()) as Partial<Pick<GuestCommentRecord, "id" | "status">>;
    const id = body.id?.trim();
    const status = body.status;

    if (!id) {
      return NextResponse.json({ error: "Missing comment id" }, { status: 400 });
    }

    if (!status || !ALLOWED_COMMENT_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid comment status" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from(COMMENTS_TABLE)
      .update({ status })
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
