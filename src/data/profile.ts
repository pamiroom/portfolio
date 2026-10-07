/**
 * Everything about Pami lives in this one file.
 * Edit the strings below; the home page, /about and the SEO tags follow.
 * (All entries are placeholders until the real ones are ready.)
 */
import type { Profile } from '../types/profile';
import portrait from '../assets/profile/portrait.png';

export const profile: Profile = {
  name: 'PAMI',
  tagline: 'PAMI — a small room on the internet.',
  intro:
    'Things, places, gatherings, and whatever happens in between. Prints, objects, small parties and the occasional sign. Based in Osaka, Japan. 2024 — Now.',
  bioJa:
    'パミ：大阪を拠点に、もの・場所・集まりをつくっています。2024年より、小さな印刷物やオブジェの制作、展示、そして不定期のパーティー「PAMI NIGHT」を企画しています。何かと何かのあいだで起きることに興味があります。ご依頼やご相談などありましたら、お気軽にご連絡ください。',
  bioEn:
    'Pami makes things, places and gatherings in Osaka. Since 2024: small printed matter, objects, exhibitions, and an irregular party called PAMI NIGHT. Mostly interested in what happens in between. For commissions or a chat, feel free to get in touch.',
  email: 'hello@example.com',
  location: 'OSAKA / JAPAN',
  since: '2024',
  portrait,
  portraitAlt: 'Portrait placeholder: a flash snapshot of a black pixel figure wearing a PAMI shirt.',
  links: [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Bluesky', href: 'https://bsky.app/' },
  ],
  history: [
    {
      heading: 'Exhibition / Activities',
      entries: [
        { date: '2024.04', text: 'First gathering “PAMI NIGHT #00” at a borrowed room, Osaka' },
        { date: '2024.09', text: 'Group show “Small Weather” at an empty shop, Nakazakicho' },
        { date: '2025.03', text: 'Solo show “ROOM NOTES” at a stairwell gallery, Osaka' },
        { date: '2025.11', text: 'Print table at a zine fair, Kyoto' },
        { date: '2026.10', text: 'Exhibition “ROOM / ROOM”', link: { label: 'EVENT', href: '/events/room-room/' } },
      ],
    },
    {
      heading: 'Media',
      entries: [
        { date: '2025.02', text: 'Zine “ROOM NOTES vol.1”, self-published' },
        { date: '2025.08', text: 'Interview in a friend’s newsletter, issue 12' },
        { date: '2026.01', text: 'Sticker set “WINK”, self-published' },
      ],
    },
    {
      heading: 'Award',
      entries: [{ text: 'Nothing yet. Maybe someday.' }],
    },
  ],
  clients: [
    'A LOCAL RECORD SHOP',
    'A COFFEE STAND IN NAKAZAKICHO',
    'A BOOKSTORE THAT CLOSES AT 7',
    'TWO BANDS',
    'A BAKERY (STICKERS)',
    'FRIENDS',
    'AND MORE.',
  ],
};
