import { isCategory, isDistrict, type Category, type District } from '../../shared/taxonomy';
import { addDays, compareCalendar, cyprusDate, daysInMonth, weekdayIndex, type CalendarDate } from './dates';
import { searchText } from './labels';
import type { FilterableEvent } from './types';

export type Timeframe = 'today' | 'weekend' | 'week' | 'month';

export interface EventFilters {
  timeframe: Timeframe | null;
  district: District | 'all';
  category: Category | null;
  q: string;
}

export function parseTimeframe(value: string | null | undefined): Timeframe | null {
  if (value === 'today' || value === 'weekend' || value === 'week' || value === 'month') return value;
  return null;
}

export function parseDistrictParam(value: string | null | undefined): District | 'all' {
  if (!value || value === 'all') return 'all';
  return isDistrict(value) ? value : 'all';
}

export function parseCategoryParam(value: string | null | undefined): Category | null {
  if (!value || value === 'all') return null;
  return isCategory(value) ? value : null;
}

export function filtersFromURL(url: URL): EventFilters {
  return {
    timeframe: parseTimeframe(url.searchParams.get('when')),
    district: parseDistrictParam(url.searchParams.get('district')),
    category: parseCategoryParam(url.searchParams.get('category')),
    q: url.searchParams.get('q')?.trim() ?? '',
  };
}

export function filtersToQuery(filters: EventFilters): string {
  const params = new URLSearchParams();
  if (filters.timeframe) params.set('when', filters.timeframe);
  if (filters.district !== 'all') params.set('district', filters.district);
  if (filters.category) params.set('category', filters.category);
  if (filters.q.trim()) params.set('q', filters.q.trim());
  const query = params.toString();
  return query ? `/browse?${query}` : '/browse';
}

export function fold(value: string): string {
  return value
    .toLocaleLowerCase('el-CY')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ς/g, 'σ');
}

function eventSpan(event: FilterableEvent): { start: CalendarDate; end: CalendarDate } {
  return {
    start: cyprusDate(new Date(event.startDate)),
    end: cyprusDate(new Date(event.endDate || event.startDate)),
  };
}

function overlaps(
  start: CalendarDate,
  end: CalendarDate,
  windowStart: CalendarDate,
  windowEnd: CalendarDate,
): boolean {
  return compareCalendar(start, windowEnd) <= 0 && compareCalendar(windowStart, end) <= 0;
}

export function timeframeWindow(timeframe: Timeframe, now = new Date()): { start: CalendarDate; end: CalendarDate } {
  const today = cyprusDate(now);
  if (timeframe === 'today') return { start: today, end: today };
  if (timeframe === 'month') {
    return { start: today, end: { y: today.y, m: today.m, d: daysInMonth(today.y, today.m) } };
  }
  const weekday = weekdayIndex(today);
  if (timeframe === 'weekend') {
    const saturday = weekday === 0 ? addDays(today, -1) : addDays(today, (6 - weekday + 7) % 7);
    const sunday = addDays(saturday, 1);
    const start = compareCalendar(today, saturday) > 0 ? today : saturday;
    return { start, end: sunday };
  }
  const daysUntilSunday = (7 - weekday) % 7;
  return { start: today, end: addDays(today, daysUntilSunday) };
}

export function isUpcoming(event: FilterableEvent, now = new Date()): boolean {
  const end = cyprusDate(new Date(event.endDate || event.startDate));
  return compareCalendar(end, cyprusDate(now)) >= 0;
}

export function isBoosted(
  event: { isFeatured: boolean; featuredUntil?: string; status?: string },
  now = new Date(),
): boolean {
  if (!event.isFeatured) return false;
  if (event.status && event.status !== 'published') return false;
  if (!event.featuredUntil) return true;
  return new Date(event.featuredUntil).getTime() >= now.getTime();
}

export function matchesEvent(event: FilterableEvent, filters: EventFilters, now = new Date()): boolean {
  if (!isUpcoming(event, now)) return false;
  if (filters.timeframe) {
    const window = timeframeWindow(filters.timeframe, now);
    const span = eventSpan(event);
    if (!overlaps(span.start, span.end, window.start, window.end)) return false;
  }
  if (filters.district !== 'all' && event.district !== filters.district) return false;
  if (filters.category && event.category !== filters.category) return false;
  const query = filters.q.trim();
  if (query && !matchesQuery(event.searchText || searchText(event), query)) return false;
  return true;
}

function matchesQuery(haystack: string, query: string): boolean {
  const hay = fold(haystack);
  const needle = fold(query);
  if (hay.includes(needle)) return true;
  const stem = needle.replace(/σ$/u, '');
  return stem.length >= 4 && hay.includes(stem);
}
