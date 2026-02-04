"use client";

import { useCallback, useEffect, useState } from 'react';
import type { AuthUser as AuthUserType } from '../types/auth';

export function useAuthMe() {
  const [user, setUser] = useState<AuthUserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include', headers: { Accept: 'application/json' } });
      if (!res.ok) {
        setUser(null);
        setError(`Status ${res.status}`);
        return null;
      }
      const data = await res.json();
      setUser(data as AuthUserType);
      return data as AuthUserType;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return { user, isLoading, error, refresh: fetchMe, setUser } as const;
}

export default useAuthMe;
