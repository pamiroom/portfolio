/**
 * Data access for works. Pages only call these functions, so moving works to
 * a CMS later means changing this file and nothing else.
 */
import { works } from '../data/works';
import type { Work } from '../types/work';

/** Slugs become URLs: lowercase letters, digits and hyphens only. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Fails the build on a bad or repeated slug instead of publishing a broken link. */
function validate(list: Work[]): Work[] {
  const seen = new Set<string>();
  for (const { slug } of list) {
    if (!SLUG_PATTERN.test(slug)) throw new Error(`[works] Slug "${slug}" must be lowercase letters, digits and hyphens.`);
    if (seen.has(slug)) throw new Error(`[works] Duplicate slug "${slug}" in src/data/works.ts.`);
    seen.add(slug);
  }
  return list;
}

export async function getWorks(): Promise<Work[]> {
  return validate(works);
}

/** Works without an external URL get a detail page. */
export function hasDetailPage(work: Work): boolean {
  return !work.url;
}

export function workHref(work: Work): string {
  return work.url ?? `/works/${work.slug}/`;
}
