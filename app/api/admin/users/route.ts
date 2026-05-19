import { NextResponse } from "next/server";
import { getAuthenticatedRequestUser, isSuperAdmin } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type AdminRole = "super_admin" | "admin" | "guest";

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
}

function normalizeRole(value: unknown): AdminRole {
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

function mapUser(user: {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): AdminUserRow {
  const metadata = user.user_metadata ?? {};
  const appMetadata = user.app_metadata ?? {};
  const name =
    (typeof metadata.name === "string" && metadata.name) ||
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    user.email ||
    "User";

  return {
    id: user.id,
    email: user.email ?? "",
    name,
    role: normalizeRole(metadata.role ?? appMetadata.role),
    createdAt: user.created_at ?? "",
  };
}

async function loadAllUsers() {
  const supabaseAdmin = getSupabaseAdminClient();
  const pageSize = 100;
  const users: AdminUserRow[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });

    if (error) {
      throw error;
    }

    const pageUsers = data?.users ?? [];
    users.push(...pageUsers.map(mapUser));

    if (pageUsers.length < pageSize) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function GET(request: Request) {
  try {
    const currentUser = await getAuthenticatedRequestUser(request);

    if (!isSuperAdmin(currentUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await loadAllUsers();

    return NextResponse.json(
      { users },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load admin users",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getAuthenticatedRequestUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSuperAdmin(currentUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as { id?: string; role?: AdminRole };
    const id = body.id?.trim();
    const role = normalizeRole(body.role);

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (error) {
      throw error;
    }

    const targetUser = data.users.find((user) => user.id === id);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentRole = normalizeRole(targetUser.user_metadata?.role ?? targetUser.app_metadata?.role);

    if (targetUser.id === currentUser.id && role !== "super_admin") {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    if (currentRole === "super_admin" && role !== "super_admin") {
      const superAdmins = data.users.filter(
        (user) => normalizeRole(user.user_metadata?.role ?? user.app_metadata?.role) === "super_admin"
      );

      if (superAdmins.length <= 1) {
        return NextResponse.json(
          { error: "At least one super_admin must remain" },
          { status: 400 }
        );
      }
    }

    const updatedMetadata = {
      ...(targetUser.user_metadata ?? {}),
      role,
    };
    const updatedAppMetadata = {
      ...(targetUser.app_metadata ?? {}),
      role,
    };

    const updateResult = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: updatedMetadata,
      app_metadata: updatedAppMetadata,
    });

    if (updateResult.error || !updateResult.data.user) {
      throw updateResult.error ?? new Error("Failed to update user");
    }

    return NextResponse.json({
      user: mapUser(updateResult.data.user),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update admin user",
      },
      { status: 500 }
    );
  }
}