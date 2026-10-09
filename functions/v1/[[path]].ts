interface Env { API_ORIGIN: string }

export const onRequest: PagesFunction<Env> = async context => {
	const upstream = context.env.API_ORIGIN?.replace(/\/$/, '');
	if (!upstream) return new Response(JSON.stringify({ error: { code: 'PROXY_NOT_CONFIGURED', message: 'API_ORIGIN is not configured.', requestId: crypto.randomUUID() } }), { status: 503, headers: { 'content-type': 'application/json' } });
	const incoming = new URL(context.request.url);
	const upstreamPath = incoming.pathname === '/v1/health/live'
		? '/health/live'
		: incoming.pathname === '/v1/health/ready'
			? '/health/ready'
			: incoming.pathname;
	const target = new URL(upstreamPath + incoming.search, upstream);
	const headers = new Headers(context.request.headers); headers.delete('host'); headers.delete('cf-connecting-ip');
	return fetch(target, { method: context.request.method, headers, body: ['GET', 'HEAD'].includes(context.request.method) ? undefined : context.request.body, redirect: 'manual' });
};
