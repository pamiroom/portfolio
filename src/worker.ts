/**
 * Cloudflare Worker entry for the preview site (preview.pami.ooo).
 *
 * - Static files (the same build XServer serves) come from the ASSETS binding;
 *   anything else (the preview route, /_image, 404) is rendered by Astro.
 * - Every response is marked noindex: this host only exists for editors, and
 *   must never compete with pami.ooo in search results.
 * - A preview URL without its trailing slash gets a bare redirect. Astro's own
 *   trailing-slash redirect renders an HTML page that repeats the full URL —
 *   including ?draftKey=… — so it is answered here with no body instead.
 *
 * Needs `assets.run_worker_first: true` in wrangler.jsonc so static files pass
 * through here too.
 */
import { handle } from '@astrojs/cloudflare/handler';

type Handler = typeof handle;
type Env = Parameters<Handler>[1] & { ASSETS: { fetch(request: Request): Promise<Response> } };

const PREVIEW_PREFIX = '/preview/';
const PREVIEW_WITHOUT_SLASH = /^\/preview\/events\/[^/]+$/;
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};

async function route(request: Request, env: Env, context: Parameters<Handler>[2]): Promise<Response> {
  const url = new URL(request.url);
  if (PREVIEW_WITHOUT_SLASH.test(url.pathname)) {
    return new Response(null, { status: 308, headers: { Location: `${url.pathname}/${url.search}`, ...PRIVATE_HEADERS } });
  }
  if (!url.pathname.startsWith(PREVIEW_PREFIX)) {
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;
  }
  return handle(request, env, context);
}

export default {
  async fetch(request: Request, env: Env, context: Parameters<Handler>[2]): Promise<Response> {
    const response = await route(request, env, context);
    const marked = new Response(response.body, response);
    marked.headers.set('X-Robots-Tag', PRIVATE_HEADERS['X-Robots-Tag']);
    return marked;
  },
};
