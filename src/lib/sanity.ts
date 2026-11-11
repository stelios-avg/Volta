import { createClient, type SanityClient } from '@sanity/client';
import { isCategory, isDistrict, isStatus } from '../../shared/taxonomy';
import { env } from './env';
import type { EventRecord, PortableBlock } from './types';

const EVENT_FIELDS = `{
  _id,
  title,
  "slug": slug.current,
  description,
  startDate,
  endDate,
  district,
  locationName,
  googleMapsUrl,
  category,
  priceText,
  ticketUrl,
  "imageUrl": mainImage.asset->url,
  "imageAlt": coalesce(mainImage.alt, title),
  isFeatured,
  featuredUntil,
  status
}`;

const LIST_QUERY = `*[_type == "event" && status == "published"] | order(startDate asc) ${EVENT_FIELDS}`;
const SLUG_QUERY = `*[_type == "event" && slug.current == $slug && status == "published"][0] ${EVENT_FIELDS}`;

interface SanityEvent {
  _id: string;
  title?: string;
  slug?: string;
  description?: PortableBlock[];
  startDate?: string;
  endDate?: string;
  district?: string;
  locationName?: string;
  googleMapsUrl?: string;
  category?: string;
  priceText?: string;
  ticketUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  isFeatured?: boolean;
  featuredUntil?: string;
  status?: string;
}

export interface NewEventInput {
  title: string;
  slug: string;
  description: PortableBlock[];
  startDate: string;
  endDate?: string;
  district: EventRecord['district'];
  locationName: string;
  googleMapsUrl?: string;
  category: EventRecord['category'];
  priceText: string;
  ticketUrl?: string;
  organizerContact: string;
  mainImage?: {
    _type: 'image';
    asset: { _type: 'reference'; _ref: string };
    alt: string;
  };
}

export function sanityProjectId(): string | undefined {
  return env('PUBLIC_SANITY_PROJECT_ID');
}

export function canReadSanity(): boolean {
  return Boolean(sanityProjectId());
}

export function canWriteSanity(): boolean {
  return Boolean(sanityProjectId() && env('SANITY_API_TOKEN'));
}

function readClient(): SanityClient | null {
  const projectId = sanityProjectId();
  if (!projectId) return null;
  const token = env('SANITY_API_READ_TOKEN') || env('SANITY_API_TOKEN');
  return createClient({
    projectId,
    dataset: env('PUBLIC_SANITY_DATASET') || 'production',
    apiVersion: '2026-11-01',
    useCdn: !token,
    token,
    perspective: 'published',
  });
}

function writeClient(): SanityClient | null {
  const projectId = sanityProjectId();
  const token = env('SANITY_API_TOKEN');
  if (!projectId || !token) return null;
  return createClient({
    projectId,
    dataset: env('PUBLIC_SANITY_DATASET') || 'production',
    apiVersion: '2026-11-01',
    useCdn: false,
    token,
    perspective: 'raw',
  });
}

function imageUrl(url?: string): string {
  if (!url) return '/media/fallback.jpg';
  if (!url.includes('cdn.sanity.io')) return url;
  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}w=1600&h=1000&fit=crop&auto=format&q=75`;
}

export function normalizeEvent(doc: SanityEvent | null): EventRecord | null {
  if (!doc?.title || !doc.slug || !doc.startDate || !doc.district || !doc.category || !doc.status) return null;
  if (!isDistrict(doc.district) || !isCategory(doc.category) || !isStatus(doc.status)) return null;
  return {
    id: doc._id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description?.length ? doc.description : '',
    startDate: doc.startDate,
    endDate: doc.endDate,
    district: doc.district,
    locationName: doc.locationName || doc.district,
    googleMapsUrl: doc.googleMapsUrl,
    category: doc.category,
    priceText: doc.priceText || 'Δωρεάν',
    ticketUrl: doc.ticketUrl,
    imageUrl: imageUrl(doc.imageUrl),
    imageAlt: doc.imageAlt || doc.title,
    isFeatured: Boolean(doc.isFeatured),
    featuredUntil: doc.featuredUntil,
    status: doc.status,
  };
}

export async function fetchPublishedEvents(): Promise<EventRecord[]> {
  const client = readClient();
  if (!client) return [];
  const docs = await client.fetch<SanityEvent[]>(LIST_QUERY);
  return docs.map((doc) => normalizeEvent(doc)).filter((event): event is EventRecord => Boolean(event));
}

export async function fetchEventBySlug(slug: string): Promise<EventRecord | null> {
  const client = readClient();
  if (!client) return null;
  const doc = await client.fetch<SanityEvent | null>(SLUG_QUERY, { slug });
  return normalizeEvent(doc);
}

export async function uploadEventImage(file: File): Promise<NewEventInput['mainImage']> {
  const client = writeClient();
  if (!client) return undefined;
  const asset = await client.assets.upload('image', Buffer.from(await file.arrayBuffer()), {
    filename: file.name || 'event-image',
    contentType: file.type,
  });
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: file.name,
  };
}

export async function createPendingEvent(input: NewEventInput): Promise<string> {
  const client = writeClient();
  if (!client) throw new Error('Sanity is not configured');
  const id = `event-${crypto.randomUUID()}`;
  await client.create({
    _id: `drafts.${id}`,
    _type: 'event',
    title: input.title,
    slug: { _type: 'slug', current: input.slug },
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    district: input.district,
    locationName: input.locationName,
    googleMapsUrl: input.googleMapsUrl,
    category: input.category,
    priceText: input.priceText,
    ticketUrl: input.ticketUrl,
    organizerContact: input.organizerContact,
    mainImage: input.mainImage,
    isFeatured: false,
    status: 'published',
  });
  return id;
}

export async function markEventBoosted(eventId: string): Promise<'updated' | 'missing'> {
  const client = writeClient();
  if (!client) throw new Error('Sanity is not configured');
  const publishedId = eventId.replace(/^drafts\./, '');
  const draftId = `drafts.${publishedId}`;
  const featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const draft = await client.getDocument(draftId);
  const published = await client.getDocument(publishedId);
  const source = draft ?? published;
  if (!source) return 'missing';

  const { _id, _rev, _createdAt, _updatedAt, ...rest } = source;
  await client.createOrReplace({
    ...rest,
    _id: publishedId,
    _type: 'event',
    isFeatured: true,
    status: 'published',
    featuredUntil,
  });
  if (draft) await client.delete(draftId);
  return 'updated';
}
