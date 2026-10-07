import type { ImageMetadata } from 'astro';

/** A remote image whose intrinsic size is known (e.g. a microCMS media field). */
export type RemoteImage = {
  src: string;
  width: number;
  height: number;
};

/**
 * Anything <Image /> can render without layout shift: a local import from
 * src/assets, or a remote image with known dimensions.
 */
export type ImageSource = ImageMetadata | RemoteImage;
