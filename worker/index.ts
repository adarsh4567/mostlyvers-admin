import { proxyRequest, type ProxyEnv } from './proxy';

export default {
  fetch(request: Request, env: ProxyEnv): Promise<Response> {
    return proxyRequest(request, env);
  },
};
