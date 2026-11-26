export const DISTRICTS = [
  'Nicosia',
  'Limassol',
  'Larnaca',
  'Paphos',
  'Famagusta',
  'Troodos & Mountains',
] as const;

export const DOORS = [
  { id: 'events', label: 'Εκδηλώσεις' },
  { id: 'panigyria', label: 'Πανηγύρια' },
  { id: 'music', label: 'Μουσική' },
  { id: 'food', label: 'Γεύσεις' },
  { id: 'culture', label: 'Πολιτισμός' },
  { id: 'family', label: 'Οικογένεια' },
  { id: 'outings', label: 'Εξορμήσεις' },
] as const;

export const SUBCATEGORIES = [
  { id: 'festival', door: 'events', label: 'Φεστιβάλ', listing: 'event' },
  { id: 'market', door: 'events', label: 'Αγορές', listing: 'event' },
  { id: 'municipality', door: 'events', label: 'Δήμοι', listing: 'event' },
  { id: 'village', door: 'panigyria', label: 'Χωριού', listing: 'event' },
  { id: 'produce', door: 'panigyria', label: 'Προϊόντων', listing: 'event' },
  { id: 'religious', door: 'panigyria', label: 'Θρησκευτικό', listing: 'event' },
  { id: 'live', door: 'music', label: 'Live & Συναυλίες', listing: 'event' },
  { id: 'dj', door: 'music', label: 'DJ Sets', listing: 'event' },
  { id: 'traditional', door: 'music', label: 'Παραδοσιακή / Ρεμπέτικο', listing: 'event' },
  { id: 'acoustic', door: 'music', label: 'Acoustic / Jazz', listing: 'event' },
  { id: 'dish', door: 'food', label: 'Φαγητό', listing: 'event' },
  { id: 'wine', door: 'food', label: 'Κρασί', listing: 'event' },
  { id: 'tavern', door: 'food', label: 'Ταβέρνες & οινοποιεία', listing: 'venue' },
  { id: 'theatre', door: 'culture', label: 'Θέατρο', listing: 'event' },
  { id: 'arts', door: 'culture', label: 'Τέχνες', listing: 'event' },
  { id: 'hall', door: 'culture', label: 'Χώροι', listing: 'venue' },
  { id: 'animals', door: 'family', label: 'Φάρμες & Ζώα', listing: 'venue' },
  { id: 'parks', door: 'family', label: 'Παιδότοποι & Πάρκα', listing: 'venue' },
  { id: 'kids-show', door: 'family', label: 'Παιδικές Παραστάσεις', listing: 'event' },
  { id: 'workshop', door: 'family', label: 'Workshops', listing: 'event' },
  { id: 'hiking', door: 'outings', label: 'Hiking & Μονοπάτια', listing: 'venue' },
  { id: 'adventure', door: 'outings', label: 'Adventure & Δράση', listing: 'venue' },
  { id: 'agri', door: 'outings', label: 'Φάρμες & Αγροκτήματα', listing: 'venue' },
  { id: 'trip', door: 'outings', label: 'Εκδρομές', listing: 'event' },
] as const;

export const STATUSES = ['pending', 'published', 'rejected'] as const;

export const LEGACY_CATEGORIES = {
  'Village Festivals': 'panigyria',
  'Live Music & Nightlife': 'music',
  'Kids & Family': 'family',
  'Food & Wine': 'food',
  'Culture & Theatre': 'culture',
  'Outdoors & Nature': 'outings',
} as const;

export type District = (typeof DISTRICTS)[number];
export type Category = (typeof DOORS)[number]['id'];
export type SubcategoryId = (typeof SUBCATEGORIES)[number]['id'];
export type ListingKind = (typeof SUBCATEGORIES)[number]['listing'];
export type EventStatus = (typeof STATUSES)[number];

export const CATEGORIES: readonly Category[] = DOORS.map((door) => door.id);

export function isDistrict(value: string): value is District {
  return (DISTRICTS as readonly string[]).includes(value);
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isSubcategory(value: string): value is SubcategoryId {
  return SUBCATEGORIES.some((item) => item.id === value);
}

export function isStatus(value: string): value is EventStatus {
  return (STATUSES as readonly string[]).includes(value);
}

export function subsFor(door: Category) {
  return SUBCATEGORIES.filter((item) => item.door === door);
}

export function subcategoryById(value: string) {
  return SUBCATEGORIES.find((item) => item.id === value);
}

export function listingKind(door: string, subcategory: string): ListingKind | null {
  const item = subcategoryById(subcategory);
  if (!item || item.door !== door) return null;
  return item.listing;
}

export function resolveListing(category: string, subcategory?: string): { category: Category; subcategory: string } | null {
  const legacy = (LEGACY_CATEGORIES as Record<string, Category>)[category];
  if (legacy) return { category: legacy, subcategory: '' };
  if (!isCategory(category)) return null;
  if (subcategory && listingKind(category, subcategory)) return { category, subcategory };
  return { category, subcategory: '' };
}

export function doorHref(door: Category, sub?: string | null, district?: string | null): string {
  if (door === 'events' && !sub && (!district || district === 'all')) return '/browse';
  const params = new URLSearchParams();
  if (door === 'events') {
    if (sub) params.set('sub', sub);
    if (district && district !== 'all') params.set('district', district);
    const query = params.toString();
    return query ? `/browse?${query}` : '/browse';
  }
  params.set('category', door);
  if (sub) params.set('sub', sub);
  if (district && district !== 'all') params.set('district', district);
  return `/categories?${params.toString()}`;
}
