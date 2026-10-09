export interface ProxyEnv {
  API_ORIGIN?: string;
}

type Fetcher = (request: Request) => Promise<Response>;

const errorResponse = (code: string, message: string, status: number) => new Response(JSON.stringify({
  error: { code, message, requestId: crypto.randomUUID() },
}), {
  status,
  headers: { 'content-type': 'application/json' },
});

export async function proxyRequest(request: Request, env: ProxyEnv, fetcher: Fetcher = fetch): Promise<Response> {
  const origin = env.API_ORIGIN?.replace(/\/$/, '');
  if (!origin) return errorResponse('PROXY_NOT_CONFIGURED', 'API_ORIGIN is not configured.', 503);

  const incoming = new URL(request.url);
  if (!incoming.pathname.startsWith('/v1/')) {
    return errorResponse('NOT_FOUND', 'Route not found.', 404);
  }

  const upstreamPath = incoming.pathname === '/v1/health/live'
    ? '/health/live'
    : incoming.pathname === '/v1/health/ready'
      ? '/health/ready'
      : incoming.pathname;
  const target = new URL(upstreamPath + incoming.search, origin);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cf-connecting-ip');
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: 'manual',
  };
  if (hasBody) init.duplex = 'half';

  return fetcher(new Request(target, init));
}
