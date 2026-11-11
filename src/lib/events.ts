import { findPublishedSubmission, listPublishedSubmissions } from './inbox';
import { getMockEvents } from './mock-events';
import { canReadSanity, fetchEventBySlug, fetchPublishedEvents } from './sanity';
import type { EventRecord } from './types';

export interface EventFeed {
  events: EventRecord[];
  source: 'sanity' | 'mock';
  reason: 'live' | 'unconfigured' | 'error';
}

function mergeEvents(primary: EventRecord[], extra: EventRecord[]): EventRecord[] {
  const slugs = new Set(primary.map((event) => event.slug));
  return [...primary, ...extra.filter((event) => !slugs.has(event.slug))];
}

export async function getPublishedEvents(): Promise<EventFeed> {
  const submitted = await listPublishedSubmissions();
  if (!canReadSanity()) {
    return { events: mergeEvents(submitted, getMockEvents()), source: 'mock', reason: 'unconfigured' };
  }
  try {
    const events = await fetchPublishedEvents();
    if (events.length === 0) {
      return { events: mergeEvents(submitted, getMockEvents()), source: 'mock', reason: 'live' };
    }
    return { events: mergeEvents(submitted, events), source: 'sanity', reason: 'live' };
  } catch (error) {
    console.error('Sanity event query failed, using sample events.', error);
    return { events: mergeEvents(submitted, getMockEvents()), source: 'mock', reason: 'error' };
  }
}

export async function getEventBySlug(slug: string): Promise<{ event: EventRecord | null; source: EventFeed['source'] }> {
  const submitted = await findPublishedSubmission(slug);
  if (submitted) return { event: submitted, source: 'mock' };
  if (!canReadSanity()) {
    return { event: getMockEvents().find((item) => item.slug === slug) ?? null, source: 'mock' };
  }
  try {
    const event = await fetchEventBySlug(slug);
    return { event, source: 'sanity' };
  } catch (error) {
    console.error('Sanity event lookup failed, using sample events.', error);
    return { event: getMockEvents().find((item) => item.slug === slug) ?? null, source: 'mock' };
  }
}
