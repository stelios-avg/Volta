import { getMockEvents } from './mock-events';
import { canReadSanity, fetchEventBySlug, fetchPublishedEvents } from './sanity';
import type { EventRecord } from './types';

export interface EventFeed {
  events: EventRecord[];
  source: 'sanity' | 'mock';
  reason: 'live' | 'unconfigured' | 'error';
}

export async function getPublishedEvents(): Promise<EventFeed> {
  if (!canReadSanity()) {
    return { events: getMockEvents(), source: 'mock', reason: 'unconfigured' };
  }
  try {
    const events = await fetchPublishedEvents();
    return { events, source: 'sanity', reason: 'live' };
  } catch (error) {
    console.error('Sanity event query failed, using sample events.', error);
    return { events: getMockEvents(), source: 'mock', reason: 'error' };
  }
}

export async function getEventBySlug(slug: string): Promise<{ event: EventRecord | null; source: EventFeed['source'] }> {
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
