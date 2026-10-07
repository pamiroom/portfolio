import type { ImageMetadata } from 'astro';

export type ProfileLink = {
  label: string;
  href: string;
  /** Account name shown on /about, e.g. "@pami__chans". Falls back to the label. */
  handle?: string;
};

export type HistoryEntry = {
  /** Free-form date label, e.g. "2025.05". Omit for undated lines. */
  date?: string;
  text: string;
  link?: ProfileLink;
};

export type HistorySection = {
  heading: string;
  /** Sections with no entries are not rendered. */
  entries: HistoryEntry[];
};

export type Profile = {
  /** Display name; also the site name in titles and the footer. */
  name: string;
  /** Name in Japanese. */
  nameJa: string;
  role: string;
  location: string;
  /** One line used in <title>, OGP and the top of the home page. */
  tagline: string;
  /** Short intro on the home page; also the default meta description. */
  intro: string;
  /** Paragraphs; the first one is the lead line. */
  bioJa: string[];
  bioEn: string[];
  email: string;
  portrait: ImageMetadata;
  portraitAlt: string;
  /** Only links listed here are shown. */
  links: ProfileLink[];
  history: HistorySection[];
  /** Not rendered while empty. */
  clients: string[];
};
