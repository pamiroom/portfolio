import { createClient } from 'microcms-js-sdk';
import { getSecret } from 'astro:env/server';

type MicroCMSClient = ReturnType<typeof createClient>;

/**
 * Returns a client, or undefined when credentials are missing.
 *
 * Credentials are server-only `astro:env` secrets (never PUBLIC_, never inlined
 * into a bundle). They resolve from the build environment / .env when static
 * pages are prerendered, and from the Worker's runtime secrets when the preview
 * route renders on Cloudflare. Whether missing keys may fall back to mock data
 * at build time is decided by the deployment guard in astro.config.mjs.
 */
export function getMicroCMSClient(): MicroCMSClient | undefined {
  const serviceDomain = getSecret('MICROCMS_SERVICE_DOMAIN');
  const apiKey = getSecret('MICROCMS_API_KEY');
  if (!serviceDomain || !apiKey) return undefined;
  return createClient({ serviceDomain, apiKey });
}
