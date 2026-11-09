import { formatWhen } from './format';
import { plainText } from './text';
import type { EventRecord } from './types';

function icsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function eventEnd(event: EventRecord): string {
  return event.endDate || new Date(new Date(event.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString();
}

export function googleCalendarUrl(event: EventRecord, pageUrl: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${icsStamp(event.startDate)}/${icsStamp(eventEnd(event))}`,
    details: `${plainText(event.description)}\n${pageUrl}`.slice(0, 1500),
    location: `${event.locationName}, ${event.district}, Cyprus`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcs(event: EventRecord, pageUrl: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Whats On Cyprus//Events//EL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.slug}@whatson.cy`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(event.startDate)}`,
    `DTEND:${icsStamp(eventEnd(event))}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `LOCATION:${icsEscape(`${event.locationName}, ${event.district}, Cyprus`)}`,
    `DESCRIPTION:${icsEscape(`${plainText(event.description)}\n${pageUrl}`)}`,
    `URL:${pageUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.join('\r\n')}\r\n`;
}

export function whatsappUrl(event: EventRecord, pageUrl: string): string {
  const text = `${event.title}\n${formatWhen(event.startDate, event.endDate)}\n${event.locationName}\n${pageUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function mapsUrl(event: Pick<EventRecord, 'googleMapsUrl' | 'locationName' | 'district'>): string {
  if (event.googleMapsUrl) return event.googleMapsUrl;
  const query = `${event.locationName}, ${event.district}, Cyprus`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
