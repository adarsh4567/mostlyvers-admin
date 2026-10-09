import { describe, expect, it, vi } from 'vitest';
import config from '../../wrangler.json';
import { proxyRequest } from '../../worker/proxy';

describe('Cloudflare Worker deployment', () => {
  it('routes every /v1 request through the Worker before static assets', () => {
    expect(config.main).toBe('worker/index.ts');
    expect(config.assets.directory).toBe('./dist');
    expect(config.assets.not_found_handling).toBe('single-page-application');
    expect(config.assets.run_worker_first).toContain('/v1/*');
    expect(config.vars.API_ORIGIN).toBe('https://mostlyvers-api.onrender.com');
  });

  it('forwards POST bodies and methods to the Render API', async () => {
    const upstreamFetch = vi.fn(async (request: Request) => {
      void request;
      return new Response('{"error":{"code":"INVALID_CREDENTIALS"}}', {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    });
    const request = new Request('https://admin.example/v1/admin/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"email":"invalid@example.com","password":"invalid"}',
    });

    const response = await proxyRequest(request, { API_ORIGIN: 'https://api.example' }, upstreamFetch);

    expect(response.status).toBe(401);
    expect(upstreamFetch).toHaveBeenCalledOnce();
    const forwarded = upstreamFetch.mock.calls[0]![0];
    expect(forwarded.method).toBe('POST');
    expect(forwarded.url).toBe('https://api.example/v1/admin/auth/login');
    await expect(forwarded.text()).resolves.toContain('invalid@example.com');
  });
});
