import { proxyRequest, type ProxyEnv } from '../../worker/proxy';

export const onRequest: PagesFunction<ProxyEnv> = context => proxyRequest(context.request, context.env);
