import { createClient } from 'microcms-js-sdk';

type MicroCMSClient = ReturnType<typeof createClient>;

let client: MicroCMSClient | undefined;

/**
 * Returns the shared client, or undefined when credentials are missing.
 * Build-time only: these variables are not PUBLIC_ and never reach the browser.
 * Whether missing keys are allowed is decided by the deployment guard in astro.config.mjs.
 */
export function getMicroCMSClient(): MicroCMSClient | undefined {
  const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
  const apiKey = import.meta.env.MICROCMS_API_KEY;
  if (!serviceDomain || !apiKey) return undefined;
  client ??= createClient({ serviceDomain, apiKey, retry: true });
  return client;
}
