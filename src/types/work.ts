import type { ImageSource } from './image';

export type Work = {
  /** URL segment for /works/[slug]. Lowercase, hyphenated, unique. */
  slug: string;
  title: string;
  year: number;
  category?: string;
  image: ImageSource;
  /** Describes the image for screen readers. Defaults to the title. */
  alt?: string;
  /**
   * Optional second frame. When set, the thumbnail flips between the two
   * frames like a two-frame GIF (paused for reduced motion).
   */
  altImage?: ImageSource;
  /** If set, the thumbnail links straight to this external page. */
  url?: string;
  /** Short text shown on /works/[slug]. */
  description?: string;
};
