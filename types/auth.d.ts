export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface ValidationResult {
  valid: boolean;
  provider?: string;
  verified?: boolean;
  user?: AuthUser;
  reason?: string;
}
