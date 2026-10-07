/**
 * Local stand-in for the microCMS `events` API.
 * Used only when MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY are not set,
 * so the site runs straight after `npm install`.
 */
import type { MockEvent } from '../types/event';
import pamiNight00 from '../assets/events/pami-night-00.png';
import pamiNight01 from '../assets/events/pami-night-01.png';
import roomRoom from '../assets/events/room-room.png';

export const mockEvents: MockEvent[] = [
  {
    slug: 'pami-night-02',
    title: 'PAMI NIGHT #02',
    description: 'Winter edition. Hot drinks, cold room.',
    content: '<p>Details soon. Same idea as always: come early, leave late.</p>',
    startAt: '2026-12-19T09:00:00.000Z',
    endAt: '2026-12-19T14:00:00.000Z',
    venue: 'TBA',
    address: 'Kyoto, Japan',
    organizer: 'PAMI',
    publishedAt: '2026-09-30T03:00:00.000Z',
  },
  {
    slug: 'pami-night-01',
    title: 'PAMI NIGHT #01',
    description: 'A small night of records, prints and whatever happens in between.',
    content:
      '<p>The first numbered PAMI NIGHT. Records on a borrowed turntable, a table of prints, a few new stickers and a lot of talking.</p><h2>Timetable</h2><ul><li>18:00 Doors</li><li>19:00 Records</li><li>22:00 Close (probably)</li></ul><p>No reservation needed. Bring a friend, or come alone and leave with one.</p>',
    startAt: '2026-11-03T09:00:00.000Z',
    endAt: '2026-11-03T13:00:00.000Z',
    venue: 'Room 2F',
    address: '1-2-3 Nakazakinishi, Kita-ku, Osaka',
    image: pamiNight01,
    imageAlt: 'PAMI NIGHT #01 poster: lime type on black with a blue square',
    externalUrl: 'https://example.com/',
    organizer: 'PAMI',
    publishedAt: '2026-09-01T03:00:00.000Z',
  },
  {
    slug: 'room-room',
    title: 'ROOM / ROOM',
    description: 'An exhibition about rooms, in a room.',
    content:
      '<p>Prints, objects and notes from two years of borrowed rooms. Open on weekends.</p><p><strong>Open:</strong> Sat–Sun 13:00–19:00</p>',
    startAt: '2026-10-01T04:00:00.000Z',
    endAt: '2026-10-25T10:00:00.000Z',
    venue: 'Stairwell Gallery',
    address: 'Osaka, Japan',
    image: roomRoom,
    imageAlt: 'ROOM / ROOM key visual: a blue block and lines of text on cream paper',
    organizer: 'PAMI',
    publishedAt: '2026-09-10T03:00:00.000Z',
  },
  {
    slug: 'pami-night-00',
    title: 'PAMI NIGHT #00',
    description: 'The one before the first one.',
    content: '<p>A test run in a borrowed room. Twelve people came. Thank you.</p>',
    startAt: '2024-04-20T09:00:00.000Z',
    endAt: '2024-04-20T13:00:00.000Z',
    venue: 'A borrowed room',
    address: 'Osaka, Japan',
    image: pamiNight00,
    imageAlt: 'PAMI NIGHT #00 poster: white type on red with a yellow square',
    organizer: 'PAMI',
    publishedAt: '2024-04-01T03:00:00.000Z',
  },
];
