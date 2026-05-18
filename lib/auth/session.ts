import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AuthRole = "super_admin" | "admin" | "guest";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
}

function readCookie(cookieHeader: string | null, cookieName: string): string {
  if (!cookieHeader) {
    return "";
  }

  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  if (!token) {
    return "";
  }

  return decodeURIComponent(token.slice(cookieName.length + 1));
}

function normalizeRole(value: unknown): AuthRole {
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

function buildAuthenticatedUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}): AuthenticatedUser {
  const metadata = user.user_metadata ?? {};
  const appMetadata = user.app_metadata ?? {};
  const email = user.email ?? "";
  const name =
    (typeof metadata.name === "string" && metadata.name) ||
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    email ||
    "Admin";
  const role = normalizeRole(metadata.role ?? appMetadata.role);

  return {
    id: user.id,
    email,
    name,
    role,
  };
}

export async function getAuthenticatedUserFromToken(
  authToken: string
): Promise<AuthenticatedUser | null> {
  if (!authToken) {
    return null;
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const userResult = await supabaseAdmin.auth.getUser(authToken);

  if (userResult.error || !userResult.data.user) {
    return null;
  }

  return buildAuthenticatedUser(userResult.data.user);
}

export function getAuthTokenFromRequest(request: Request): string {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return readCookie(request.headers.get("cookie"), "auth_token");
}

export async function getAuthenticatedRequestUser(
  request: Request
): Promise<AuthenticatedUser | null> {
  const authToken = getAuthTokenFromRequest(request);
  return getAuthenticatedUserFromToken(authToken);
}

export async function getAuthenticatedCookieUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value ?? "";
  return getAuthenticatedUserFromToken(authToken);
}

export function canAccessGuestManagement(user: AuthenticatedUser | null): boolean {
  if (!user) {
    return false;
  }

  return user.role === "admin" || user.role === "super_admin";
}

export function isSuperAdmin(user: AuthenticatedUser | null): boolean {
  return !!user && user.role === "super_admin";
}