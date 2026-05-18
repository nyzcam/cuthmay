import { NextResponse } from "next/server";
import { getSupabaseAuthClient } from "@/lib/supabase/auth";

interface LoginBody {
  email?: string;
  password?: string;
}

function normalizeRole(value: unknown): 'super_admin' | 'admin' | 'guest' {
  if (typeof value !== 'string') {
    return 'guest';
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'super_admin' || normalized === 'superadmin') {
    return 'super_admin';
  }
  if (normalized === 'admin') {
    return 'admin';
  }

  return 'guest';
}

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseAuth = getSupabaseAuthClient();
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { success: false, error: error?.message ?? "Invalid login credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        name:
          data.user.user_metadata?.name ??
          data.user.user_metadata?.full_name ??
          data.user.email ??
          "User",
        role: normalizeRole(data.user.user_metadata?.role ?? data.user.app_metadata?.role),
      },
    });

    response.cookies.set("auth_token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    response.cookies.set("refresh_token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 500 }
    );
  }
}
