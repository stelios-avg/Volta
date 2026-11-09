export const CYPRUS_TZ = 'Asia/Nicosia';

export interface CalendarDate {
  y: number;
  m: number;
  d: number;
}

export function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function cyprusDate(instant = new Date()): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CYPRUS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { y: read('year'), m: read('month'), d: read('day') };
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(Date.UTC(date.y, date.m - 1, date.d + days));
  return { y: shifted.getUTCFullYear(), m: shifted.getUTCMonth() + 1, d: shifted.getUTCDate() };
}

/** 0 = Sunday … 6 = Saturday, for the Cyprus calendar day. */
export function weekdayIndex(date: CalendarDate): number {
  return new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay();
}

export function compareCalendar(a: CalendarDate, b: CalendarDate): number {
  return a.y - b.y || a.m - b.m || a.d - b.d;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function offsetMinutes(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(read('year'), read('month') - 1, read('day'), read('hour'), read('minute'), read('second'));
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** Interpret a `datetime-local` value as Asia/Nicosia and return a UTC ISO string. */
export function cyprusLocalToISO(local: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  const wallAsUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const firstOffset = offsetMinutes(CYPRUS_TZ, wallAsUtc);
  const firstInstant = new Date(wallAsUtc.getTime() - firstOffset * 60_000);
  const secondOffset = offsetMinutes(CYPRUS_TZ, firstInstant);
  return new Date(wallAsUtc.getTime() - secondOffset * 60_000).toISOString();
}

export function formatLocalInput(date: CalendarDate, hour: number, minute = 0): string {
  return `${date.y}-${pad(date.m)}-${pad(date.d)}T${pad(hour)}:${pad(minute)}`;
}

export function atCyprus(dayOffset: number, hour: number, minute = 0, durationHours = 3, now = new Date()): {
  startDate: string;
  endDate: string;
} {
  const day = addDays(cyprusDate(now), dayOffset);
  const startDate = cyprusLocalToISO(formatLocalInput(day, hour, minute));
  if (!startDate) throw new Error('Could not build a Cyprus timestamp');
  const endDate = new Date(new Date(startDate).getTime() + durationHours * 60 * 60 * 1000).toISOString();
  return { startDate, endDate };
}
