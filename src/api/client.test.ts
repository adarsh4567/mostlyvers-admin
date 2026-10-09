import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminApi, setSessionTokens } from './client';
import type { AdminSession } from '../types';

const session: AdminSession = {
  accessToken: 'access-token',
  accessTokenExpiresAt: '2099-01-01T00:00:00Z',
  csrfToken: 'csrf-token',
  owner: { id: 'owner-id', name: 'Owner', email: 'owner@example.test', phone: '+910000000000' },
  capabilities: ['*'],
};

describe('admin session refresh', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setSessionTokens();
  });

  it('coalesces concurrent refreshes so a rotating token is used once', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(session), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    const [first, second] = await Promise.all([adminApi.refresh(), adminApi.refresh()]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first.accessToken).toBe(session.accessToken);
    expect(second.accessToken).toBe(session.accessToken);
  });
});
