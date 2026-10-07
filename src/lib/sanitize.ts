import sanitizeHtml from 'sanitize-html';

/** Hosts allowed for <iframe> embeds pasted into the microCMS Rich Editor. */
const EMBED_HOSTS = ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com', 'open.spotify.com', 'w.soundcloud.com'];

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * Cleans Rich Editor HTML: keeps editorial markup, drops scripts, styles and
 * event handlers, forces safe rel on external links and lazy images.
 * A stray <h1> becomes <h2> so the page keeps a single <h1>.
 */
export function sanitizeRichText(html: string | undefined): string {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'hr', 'h2', 'h3', 'h4', 'h5', 'strong', 'b', 'em', 'i', 's', 'u', 'code', 'pre',
      'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'iframe', 'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'loading'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      '*': ['id'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: EMBED_HOSTS,
    // An iframe whose src was stripped (host not allowed) would leave an empty box.
    exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
    transformTags: {
      h1: 'h2',
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';
        const external: sanitizeHtml.Attributes = { target: '_blank', rel: 'noopener noreferrer' };
        return { tagName, attribs: isExternal(href) ? { href, ...external } : { href } };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, alt: attribs.alt ?? '', loading: 'lazy', decoding: 'async' },
      }),
      iframe: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: 'lazy', title: attribs.title ?? 'Embedded content' },
      }),
    },
  });
}
