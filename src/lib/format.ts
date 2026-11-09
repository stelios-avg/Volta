import { CYPRUS_TZ, cyprusDate } from './dates';

function capitalize(value: string): string {
  return value ? value.charAt(0).toLocaleUpperCase('el-CY') + value.slice(1) : value;
}

export function formatDayBadge(iso: string): { day: string; month: string } {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat('el-CY', { timeZone: CYPRUS_TZ, day: 'numeric' }).format(date);
  const month = new Intl.DateTimeFormat('el-CY', { timeZone: CYPRUS_TZ, month: 'short' })
    .format(date)
    .replace('.', '');
  return { day, month: capitalize(month) };
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('el-CY', {
    timeZone: CYPRUS_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

export function formatWhen(startIso: string, endIso?: string): string {
  const start = new Date(startIso);
  const date = capitalize(
    new Intl.DateTimeFormat('el-CY', {
      timeZone: CYPRUS_TZ,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(start),
  );
  const startTime = formatTime(startIso);
  if (!endIso) return `${date}, ${startTime}`;
  const sameDay =
    cyprusDate(start).d === cyprusDate(new Date(endIso)).d &&
    cyprusDate(start).m === cyprusDate(new Date(endIso)).m &&
    cyprusDate(start).y === cyprusDate(new Date(endIso)).y;
  if (sameDay) return `${date}, ${startTime}–${formatTime(endIso)}`;
  const endDate = capitalize(
    new Intl.DateTimeFormat('el-CY', {
      timeZone: CYPRUS_TZ,
      day: 'numeric',
      month: 'short',
    }).format(new Date(endIso)),
  );
  return `${date}, ${startTime} – ${endDate}, ${formatTime(endIso)}`;
}

export function formatMonthYear(now = new Date()): string {
  const label = new Intl.DateTimeFormat('el-CY', {
    timeZone: CYPRUS_TZ,
    month: 'long',
    year: 'numeric',
  }).format(now);
  return capitalize(label);
}

export function extractPriceAmount(priceText: string): number {
  const match = priceText.replace(/\./g, '').match(/(\d+(?:,\d+)?)/);
  if (!match) return 0;
  return Number(match[1].replace(',', '.'));
}
