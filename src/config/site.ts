import { profile } from '../data/profile';

export const SITE = {
  name: profile.name,
  title: profile.tagline,
  description: profile.intro,
  lang: 'ja',
  ogLocale: 'ja_JP',
  defaultOgImage: '/og.png',
  /** Events are displayed and judged (upcoming / ongoing / past) in this zone. */
  timeZone: 'Asia/Tokyo',
  /** UTC offset of timeZone; Japan has no daylight saving time. */
  utcOffset: '+09:00',
} as const;

export type RoomId = 'home' | 'about' | 'events';

export type Room = {
  id: RoomId;
  label: string;
  href: string;
};

/**
 * The rooms in walking order. The arrow in the middle bar always leads to the
 * next room, and the last one loops back to the first.
 */
export const ROOMS: Room[] = [
  { id: 'home', label: 'PAMI', href: '/' },
  { id: 'about', label: 'ABOUT', href: '/about/' },
  { id: 'events', label: 'EVENTS', href: '/events/' },
];

export function nextRoom(id: RoomId): Room {
  const index = ROOMS.findIndex((room) => room.id === id);
  return ROOMS[(index + 1) % ROOMS.length]!;
}
