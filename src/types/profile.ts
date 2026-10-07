import type { ImageMetadata } from 'astro';

export type ProfileLink = {
  label: string;
  href: string;
};

export type HistoryEntry = {
  /** Free-form date label, e.g. "2025.05". Omit for undated lines. */
  date?: string;
  text: string;
  link?: ProfileLink;
};

export type HistorySection = {
  heading: string;
  entries: HistoryEntry[];
};

export type Profile = {
  name: string;
  /** One line used in <title>, OGP and the top of the home page. */
  tagline: string;
  /** Short intro on the home page. */
  intro: string;
  bioJa: string;
  bioEn: string;
  email: string;
  location: string;
  since: string;
  portrait: ImageMetadata;
  portraitAlt: string;
  links: ProfileLink[];
  history: HistorySection[];
  clients: string[];
};
