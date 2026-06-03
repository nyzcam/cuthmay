import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser, isSuperAdmin } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSuperAdmin(user)) {
      return NextResponse.json(
        { error: "Forbidden: Only super admins can impersonate users" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as { targetAdminId?: string };
    const targetAdminId = body.targetAdminId?.trim();

    if (!targetAdminId) {
      return NextResponse.json({ error: "Target admin ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Verify target user exists and has admin role
    const targetUser = await supabaseAdmin.auth.admin.getUserById(targetAdminId);
    if (targetUser.error || !targetUser.data.user) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    const targetUserRole = (
      targetUser.data.user.user_metadata?.role ?? 
      targetUser.data.user.app_metadata?.role ?? 
      "guest"
    ) as string;

    const normalizedRole = targetUserRole.trim().toLowerCase().replace(/\s+/g, "_");
    if (normalizedRole !== "admin" && normalizedRole !== "super_admin") {
      return NextResponse.json(
        { error: "Target user must be an admin or super_admin" },
        { status: 400 }
      );
    }

    // Create impersonation session
    const impersonationData = {
      actualUserId: user.id,
      impersonatedUserId: targetAdminId,
      impersonatedAt: new Date().toISOString(),
    };

    // Set cookie with impersonation data
    const response = NextResponse.json({
      success: true,
      impersonating: {
        userId: targetAdminId,
        email: targetUser.data.user.email ?? "",
        name: (
          targetUser.data.user.user_metadata?.name ?? 
          targetUser.data.user.user_metadata?.full_name ?? 
          targetUser.data.user.email ?? 
          "Admin"
        ) as string,
      },
      actualUser: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    });

    // Set impersonation cookie
    response.cookies.set("impersonate_data", JSON.stringify(impersonationData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start impersonation" },
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

    if (!isSuperAdmin(user)) {
      return NextResponse.json(
        { error: "Forbidden: Only super admins can check impersonation status" },
        { status: 403 }
      );
    }

    const cookieHeader = request.headers.get("cookie") ?? "";
    const impersonateDataStr = cookieHeader
      .split(";")
      .map(part => part.trim())
      .find(part => part.startsWith("impersonate_data="))
      ?.slice("impersonate_data=".length);

    if (!impersonateDataStr) {
      return NextResponse.json({
        isImpersonating: false,
        actualUser: {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
      });
    }

    const impersonationData = JSON.parse(decodeURIComponent(impersonateDataStr));
    const supabaseAdmin = getSupabaseAdminClient();
    const targetUser = await supabaseAdmin.auth.admin.getUserById(
      impersonationData.impersonatedUserId
    );

    if (targetUser.error || !targetUser.data.user) {
      return NextResponse.json({
        isImpersonating: false,
        actualUser: {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
      });
    }

    return NextResponse.json({
      isImpersonating: true,
      impersonating: {
        userId: impersonationData.impersonatedUserId,
        email: targetUser.data.user.email ?? "",
        name: (
          targetUser.data.user.user_metadata?.name ?? 
          targetUser.data.user.user_metadata?.full_name ?? 
          targetUser.data.user.email ?? 
          "Admin"
        ) as string,
      },
      actualUser: {
        userId: impersonationData.actualUserId,
        email: user.email,
        name: user.name,
      },
      impersonatedAt: impersonationData.impersonatedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get impersonation status" },
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

    if (!isSuperAdmin(user)) {
      return NextResponse.json(
        { error: "Forbidden: Only super admins can end impersonation" },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("impersonate_data", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to end impersonation" },
      { status: 500 }
    );
  }
}
