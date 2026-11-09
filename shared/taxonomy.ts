export const DISTRICTS = [
  'Nicosia',
  'Limassol',
  'Larnaca',
  'Paphos',
  'Famagusta',
  'Troodos & Mountains',
] as const;

export const CATEGORIES = [
  'Village Festivals',
  'Live Music & Nightlife',
  'Kids & Family',
  'Food & Wine',
  'Culture & Theatre',
  'Outdoors & Nature',
] as const;

export const STATUSES = ['pending', 'published', 'rejected'] as const;

export type District = (typeof DISTRICTS)[number];
export type Category = (typeof CATEGORIES)[number];
export type EventStatus = (typeof STATUSES)[number];

export function isDistrict(value: string): value is District {
  return (DISTRICTS as readonly string[]).includes(value);
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function isStatus(value: string): value is EventStatus {
  return (STATUSES as readonly string[]).includes(value);
}
