import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
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

function buildAuthenticatedUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): AuthenticatedUser {
  const metadata = user.user_metadata ?? {};
  const email = user.email ?? "";
  const name =
    (typeof metadata.name === "string" && metadata.name) ||
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    email ||
    "Admin";

  return {
    id: user.id,
    email,
    name,
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