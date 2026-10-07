import { SITE } from '../config/site';

const parts = (date: Date, options: Intl.DateTimeFormatOptions) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: SITE.timeZone, hourCycle: 'h23', ...options })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

/** 2026.11.03 */
export function formatDate(date: Date): string {
  const p = parts(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${p.year}.${p.month}.${p.day}`;
}

/** TUE */
export function formatWeekday(date: Date): string {
  return parts(date, { weekday: 'short' }).weekday!.toUpperCase();
}

/** 18:00 */
export function formatTime(date: Date): string {
  const p = parts(date, { hour: '2-digit', minute: '2-digit' });
  return `${p.hour}:${p.minute}`;
}

/** 2026-11-03, in the site time zone. */
export function isoDay(date: Date): string {
  return formatDate(date).replaceAll('.', '-');
}

/** "2026.11.03 (TUE) 18:00 — 22:00", collapsing the end date when it is the same day. */
export function formatRange(start: Date, end?: Date): string {
  const head = `${formatDate(start)} (${formatWeekday(start)}) ${formatTime(start)}`;
  if (!end) return head;
  const tail = isoDay(start) === isoDay(end) ? formatTime(end) : `${formatDate(end)} (${formatWeekday(end)}) ${formatTime(end)}`;
  return `${head} — ${tail}`;
}
