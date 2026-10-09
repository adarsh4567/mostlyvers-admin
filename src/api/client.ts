import type { ApiErrorBody, AdminSession } from '../types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/v1').replace(/\/$/, '');
let accessToken: string | null = null;
let csrfToken: string | null = null;
let refreshPromise: Promise<AdminSession | null> | null = null;

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public requestId?: string, public details?: Record<string, unknown>) { super(message); }
}

export const setSessionTokens = (session?: Pick<AdminSession, 'accessToken' | 'csrfToken'>) => {
  accessToken = session?.accessToken || null;
  csrfToken = session?.csrfToken || null;
};

const parseError = async (response: Response) => {
  let body: ApiErrorBody | undefined;
  try { body = await response.json(); } catch { /* no JSON body */ }
  return new ApiError(response.status, body?.error.code || `HTTP_${response.status}`, body?.error.message || 'The request could not be completed.', body?.error.requestId, body?.error.details);
};

const refreshSession = async () => {
  if (!refreshPromise) refreshPromise = fetch(`${API_URL}/admin/auth/refresh`, { method: 'POST', credentials: 'include', headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {} })
    .then(async response => {
      if (!response.ok) return null;
      const session = await response.json() as AdminSession;
      setSessionTokens(session);
      window.dispatchEvent(new CustomEvent('mostlyvers:session', { detail: session }));
      return session;
    }).finally(() => { refreshPromise = null; });
  return refreshPromise;
};

export async function api<T>(path: string, init: RequestInit & { retry?: boolean } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (csrfToken && init.method && init.method !== 'GET') headers.set('X-CSRF-Token', csrfToken);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && init.retry !== false && !path.includes('/auth/')) {
    if (await refreshSession()) return api<T>(path, { ...init, retry: false });
    setSessionTokens();
    window.dispatchEvent(new Event('mostlyvers:logout'));
  }
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const idempotencyKey = () => crypto.randomUUID();

export const adminApi = {
  login: (email: string, password: string, rememberMe: boolean) => api<AdminSession>('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password, rememberMe }) }),
  refresh: async () => {
    const session = await refreshSession();
    if (!session) throw new ApiError(401, 'AUTH_EXPIRED', 'The refresh session has expired.');
    return session;
  },
  logout: () => api<void>('/admin/auth/logout', { method: 'POST' }),
  get: <T>(path: string) => api<T>(path),
  post: <T>(path: string, body?: unknown) => api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body), headers: { 'Idempotency-Key': idempotencyKey() } }),
	postForm: <T>(path: string, body: FormData) => api<T>(path, { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey() } }),
  put: <T>(path: string, body: unknown) => api<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => api<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => api<T>(path, { method: 'DELETE' }),
};
