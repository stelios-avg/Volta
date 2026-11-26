import type { Category, District, EventStatus } from '../../shared/taxonomy';

export type { Category, District, EventStatus };

export interface PortableSpan {
  _type: 'span';
  _key?: string;
  text: string;
  marks?: string[];
}

export interface PortableBlock {
  _type: 'block';
  _key?: string;
  style?: string;
  markDefs?: unknown[];
  children: PortableSpan[];
}

export type EventDescription = string | PortableBlock[];

export interface VenueRecord {
  id: string;
  title: string;
  slug: string;
  description: EventDescription;
  district: District;
  locationName: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  category: Category;
  subcategory: string;
  imageUrl: string;
  imageAlt: string;
  status: EventStatus;
}

export interface EventRecord {
  id: string;
  title: string;
  slug: string;
  description: EventDescription;
  startDate: string;
  endDate?: string;
  district: District;
  locationName: string;
  googleMapsUrl?: string;
  category: Category;
  subcategory: string;
  priceText: string;
  ticketUrl?: string;
  imageUrl: string;
  imageAlt: string;
  isFeatured: boolean;
  featuredUntil?: string;
  status: EventStatus;
}

export interface FilterableEvent {
  startDate: string;
  endDate?: string;
  district: District;
  category: Category;
  subcategory?: string;
  title?: string;
  locationName?: string;
  searchText?: string;
}
