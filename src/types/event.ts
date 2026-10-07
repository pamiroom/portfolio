import type { MicroCMSImage, MicroCMSListContent } from 'microcms-js-sdk';
import type { ImageSource } from './image';

/**
 * Fields of the microCMS `events` API, exactly as configured in the admin
 * (see README › microCMS). Optional fields are omitted from the response
 * when empty.
 */
export type MicroCMSEventFields = {
  title: string;
  slug: string;
  description?: string;
  /** Rich Editor HTML. Always sanitised before rendering. */
  content?: string;
  /** ISO 8601 (UTC), e.g. 2026-11-03T10:00:00.000Z */
  startAt: string;
  endAt?: string;
  venue?: string;
  address?: string;
  thumbnail?: MicroCMSImage;
  externalUrl?: string;
  organizer?: string;
};

/** A single item from GET /api/v1/events. */
export type MicroCMSEvent = MicroCMSEventFields & MicroCMSListContent;

export type EventStatus = 'upcoming' | 'ongoing' | 'past';

/** The shape every page works with, regardless of where the data came from. */
export type PamiEvent = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  /** Sanitised HTML, safe for set:html. */
  contentHtml: string;
  startAt: Date;
  endAt?: Date;
  venue?: string;
  address?: string;
  image?: ImageSource;
  imageAlt?: string;
  externalUrl?: string;
  organizer?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  status: EventStatus;
};

/** Input for local mock events (src/data/events.ts). */
export type MockEvent = Omit<PamiEvent, 'id' | 'status' | 'contentHtml' | 'startAt' | 'endAt' | 'publishedAt' | 'updatedAt'> & {
  content: string;
  startAt: string;
  endAt?: string;
  publishedAt: string;
};
