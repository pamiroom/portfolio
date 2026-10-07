// @ts-check
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

/** Placeholder origin for local work only; hosted builds must set SITE_URL. */
const LOCAL_SITE = 'https://pami.example';

/** Builds on a hosting platform / CI are treated as deploys. */
const isHostedBuild = Boolean(env.CI || env.WORKERS_CI || env.VERCEL || env.NETLIFY || env.CF_PAGES);

/**
 * Stops a deploy that would publish placeholder URLs or mock events.
 * Local builds only warn, so `npm run build` keeps working without a .env.
 * @returns {import('astro').AstroIntegration}
 */
function deploymentGuards() {
  return {
    name: 'pami:deployment-guards',
    hooks: {
      'astro:config:setup': ({ command, logger }) => {
        if (command !== 'build') return;
        /** @type {string[]} */
        const errors = [];
        /** @type {string[]} */
        const warnings = [];

        const siteProblem = `SITE_URL is not set or still the placeholder (canonical / OGP / sitemap would point to ${LOCAL_SITE}).`;
        if (!env.SITE_URL || new URL(env.SITE_URL).origin === LOCAL_SITE) (isHostedBuild ? errors : warnings).push(siteProblem);

        // MICROCMS_REQUIRED: "true" always requires keys, "false" never; unset → required on hosted builds.
        const cmsRequired = env.MICROCMS_REQUIRED ? env.MICROCMS_REQUIRED === 'true' : isHostedBuild;
        const cmsProblem = 'MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY are not set (events would come from mock data).';
        if (!(env.MICROCMS_SERVICE_DOMAIN && env.MICROCMS_API_KEY)) (cmsRequired ? errors : warnings).push(cmsProblem);

        warnings.forEach((warning) => logger.warn(`${warning} Fine for a local build, not for a deploy.`));
        if (errors.length > 0) {
          throw new Error(`[deployment-guards]\n- ${errors.join('\n- ')}\nSee README › 環境変数.`);
        }
      },
    },
  };
}

/** microCMS credentials: read at build time (static pages) and at request time (preview Worker). */
const microCMSSecret = () => envField.string({ context: 'server', access: 'secret', optional: true });

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs, OGP and the sitemap.
  site: env.SITE_URL || LOCAL_SITE,
  // Pages are emitted as /about/index.html, so /about/ is the one canonical form.
  trailingSlash: 'always',
  // Every page stays static (prerendered) for XServer. Only routes that opt out with
  // `export const prerender = false` (the microCMS preview) run on Cloudflare Workers.
  output: 'static',
  adapter: cloudflare({
    // Build static pages in Node exactly as before (sharp, build-time microCMS fetch).
    prerenderEnvironment: 'node',
    // Optimise images at build time; the Worker passes images through (no Images binding).
    imageService: 'compile',
  }),
  // No sessions: avoids the adapter's default Cloudflare KV session binding.
  session: false,
  env: {
    schema: {
      MICROCMS_SERVICE_DOMAIN: microCMSSecret(),
      MICROCMS_API_KEY: microCMSSecret(),
    },
  },
  integrations: [deploymentGuards(), sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/preview/') })],
  image: {
    // microCMS media is served from this host; Astro optimizes it at build time.
    domains: ['images.microcms-assets.io'],
  },
});
