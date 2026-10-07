/**
 * Event data access. Pages call getEvents()/getEventBySlug() and never touch
 * microCMS or the mock data directly.
 *
 * Source:
 *   - MICROCMS_SERVICE_DOMAIN + MICROCMS_API_KEY set → microCMS `events` API
 *   - otherwise → src/data/events.ts (deploys are stopped earlier by the
 *     deployment guard in astro.config.mjs)
 */
import { SITE } from '../config/site';
import { mockEvents } from '../data/events';
import type { EventStatus, MicroCMSEvent, MicroCMSEventFields, MockEvent, PamiEvent } from '../types/event';
import { isoDay } from './format';
import { getMicroCMSClient } from './microcms';
import { sanitizeRichText } from './sanitize';

const ENDPOINT = 'events';
/** Slugs become URLs: lowercase letters, digits and hyphens only. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Events without an end time are treated as lasting until the end of their
 * start day (site time zone).
 */
function effectiveEnd(startAt: Date, endAt?: Date): Date {
  return endAt ?? new Date(`${isoDay(startAt)}T23:59:59.999${SITE.utcOffset}`);
}

/** Boundaries are inclusive: ongoing from startAt up to and including endAt. */
export function getEventStatus(startAt: Date, endAt: Date | undefined, now = new Date()): EventStatus {
  if (now < startAt) return 'upcoming';
  if (now <= effectiveEnd(startAt, endAt)) return 'ongoing';
  return 'past';
}

const warn = (message: string) => console.warn(`[events] ${message}`);

/** Empty or whitespace-only CMS fields count as not set. */
const text = (value?: string) => value?.trim() || undefined;

const toDate = (value?: string) => {
  const date = value ? new Date(value) : undefined;
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
};

/** Keeps only absolute http(s) URLs, so a typo can't break the page. */
function httpUrl(value: string | undefined, context: string): string | undefined {
  const raw = text(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {
    // fall through
  }
  warn(`${context}: ignoring externalUrl "${raw}" (must start with https://)`);
  return undefined;
}

function fromMicroCMS(item: MicroCMSEvent, now: Date): PamiEvent | undefined {
  const context = `microCMS "${item.title}" (${item.id})`;
  const startAt = toDate(item.startAt);
  if (!startAt) {
    warn(`${context}: skipped, startAt is missing or invalid`);
    return undefined;
  }
  let endAt = toDate(item.endAt);
  if (endAt && endAt < startAt) {
    warn(`${context}: endAt is before startAt, ignoring endAt`);
    endAt = undefined;
  }
  let slug = text(item.slug) ?? item.id;
  if (!SLUG_PATTERN.test(slug)) {
    warn(`${context}: slug "${slug}" is not lowercase-hyphenated, using the content ID instead`);
    slug = item.id;
  }
  const { thumbnail } = item;
  return {
    id: item.id,
    slug,
    title: item.title,
    description: text(item.description),
    contentHtml: sanitizeRichText(item.content),
    startAt,
    endAt,
    venue: text(item.venue),
    address: text(item.address),
    image:
      thumbnail?.width && thumbnail.height
        ? { src: thumbnail.url, width: thumbnail.width, height: thumbnail.height }
        : undefined,
    imageAlt: text(thumbnail?.alt),
    externalUrl: httpUrl(item.externalUrl, context),
    organizer: text(item.organizer),
    publishedAt: toDate(item.publishedAt),
    updatedAt: toDate(item.revisedAt) ?? toDate(item.updatedAt),
    status: getEventStatus(startAt, endAt, now),
  };
}

function fromMock({ content, ...item }: MockEvent, now: Date): PamiEvent {
  const startAt = new Date(item.startAt);
  const endAt = toDate(item.endAt);
  const publishedAt = new Date(item.publishedAt);
  return {
    ...item,
    id: item.slug,
    contentHtml: sanitizeRichText(content),
    startAt,
    endAt,
    publishedAt,
    updatedAt: publishedAt,
    status: getEventStatus(startAt, endAt, now),
  };
}

/** Two events with one URL would silently overwrite each other; fail the build instead. */
function assertUniqueSlugs(events: PamiEvent[]): void {
  const seen = new Set<string>();
  for (const { slug } of events) {
    if (seen.has(slug)) throw new Error(`[events] Duplicate slug "${slug}". Each event needs its own slug.`);
    seen.add(slug);
  }
}

async function load(): Promise<PamiEvent[]> {
  const now = new Date();
  const client = getMicroCMSClient();

  if (!client) {
    warn('microCMS is not configured — using mock events from src/data/events.ts');
    return mockEvents.map((item) => fromMock(item, now));
  }

  const items = await client.getAllContents<MicroCMSEventFields>({
    endpoint: ENDPOINT,
    queries: { orders: '-startAt' },
  });
  return items.map((item) => fromMicroCMS(item, now)).filter((event) => event !== undefined);
}

const STATUS_ORDER: Record<EventStatus, number> = { ongoing: 0, upcoming: 1, past: 2 };

/** Ongoing first, then upcoming soonest-first, then past newest-first. */
function compare(a: PamiEvent, b: PamiEvent): number {
  const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
  if (byStatus !== 0) return byStatus;
  const diff = a.startAt.getTime() - b.startAt.getTime();
  return a.status === 'past' ? -diff : diff;
}

// One request per build, shared by every page. The dev server refetches so CMS edits show up.
let cache: Promise<PamiEvent[]> | undefined;

export function getEvents(): Promise<PamiEvent[]> {
  const fetchSorted = () =>
    load().then((events) => {
      assertUniqueSlugs(events);
      return events.toSorted(compare);
    });
  if (import.meta.env.DEV) return fetchSorted();
  cache ??= fetchSorted();
  return cache;
}

export async function getEventBySlug(slug: string): Promise<PamiEvent | undefined> {
  return (await getEvents()).find((event) => event.slug === slug);
}
