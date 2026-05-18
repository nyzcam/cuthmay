export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export type AuthRole = 'super_admin' | 'admin' | 'guest';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
}

export interface ValidationResult {
  valid: boolean;
  provider?: string;
  verified?: boolean;
  user?: AuthUser;
  reason?: string;
}
