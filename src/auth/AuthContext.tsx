import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi, setSessionTokens } from '../api/client';
import type { AdminSession } from '../types';

type AuthValue = { session: AdminSession | null; loading: boolean; login: (email: string, password: string, remember: boolean) => Promise<void>; logout: () => Promise<void>; updateOwner: (owner: AdminSession['owner']) => void };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  useEffect(() => {
    adminApi.refresh().then(value => { setSessionTokens(value); setSession(value); }).catch(() => undefined).finally(() => setLoading(false));
    const sessionListener = (event: Event) => setSession((event as CustomEvent<AdminSession>).detail);
    const logoutListener = () => { setSession(null); queryClient.clear(); };
    window.addEventListener('mostlyvers:session', sessionListener);
    window.addEventListener('mostlyvers:logout', logoutListener);
    return () => { window.removeEventListener('mostlyvers:session', sessionListener); window.removeEventListener('mostlyvers:logout', logoutListener); };
  }, [queryClient]);
  const value = useMemo<AuthValue>(() => ({
    session, loading,
    login: async (email, password, remember) => { const next = await adminApi.login(email, password, remember); setSessionTokens(next); setSession(next); },
    logout: async () => { try { await adminApi.logout(); } finally { setSessionTokens(); setSession(null); queryClient.clear(); } },
    updateOwner: owner => setSession(current => current ? { ...current, owner } : current),
  }), [session, loading, queryClient]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider is missing'); return value; };
