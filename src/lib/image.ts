import { getImage } from 'astro:assets';
import type { ImageSource, RemoteImage } from '../types/image';

const isRemote = (source: ImageSource): source is RemoteImage => !('format' in source);

/**
 * Props for <Image /> / getImage() at a given display width (never upscaled).
 * Remote images need an explicit height, derived from their intrinsic ratio.
 */
export function sizedImage(source: ImageSource, width: number) {
  const w = Math.min(width, source.width);
  if (isRemote(source)) {
    return { src: source.src, width: w, height: Math.round((w * source.height) / source.width) };
  }
  return { src: source, width: w };
}

/** Absolute URL of an optimised copy, for og:image and JSON-LD. */
export async function shareImageUrl(source: ImageSource, site: URL | undefined, width = 1200): Promise<string> {
  const image = await getImage({ ...sizedImage(source, width), format: 'jpeg' });
  return new URL(image.src, site).href;
}
