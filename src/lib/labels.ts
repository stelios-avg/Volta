import type { Category, District } from '../../shared/taxonomy';
import { CATEGORIES, DISTRICTS, DOORS, subcategoryById } from '../../shared/taxonomy';
import type { Timeframe } from './filters';
import { fold } from './filters';

export const districtLabels: Record<District, string> = {
  Nicosia: 'Λευκωσία',
  Limassol: 'Λεμεσός',
  Larnaca: 'Λάρνακα',
  Paphos: 'Πάφος',
  Famagusta: 'Αμμόχωστος',
  'Troodos & Mountains': 'Τρόοδος',
};

export const categoryLabels: Record<Category, string> = Object.fromEntries(DOORS.map((door) => [door.id, door.label])) as Record<
  Category,
  string
>;

export function subcategoryLabel(id: string): string {
  return subcategoryById(id)?.label ?? '';
}

export const timeframeLabels: Record<Timeframe, string> = {
  today: 'Σήμερα',
  weekend: 'Σαββατοκύριακο',
  week: 'Εβδομάδα',
  month: 'Μήνας',
};

export const districtPills: { id: District | 'all'; label: string }[] = [
  { id: 'all', label: 'Όλη η Κύπρος' },
  ...(['Limassol', 'Nicosia', 'Larnaca', 'Paphos', 'Famagusta', 'Troodos & Mountains'] as District[]).map(
    (id) => ({ id, label: districtLabels[id] }),
  ),
];

export const categoryPills = CATEGORIES.map((id) => ({ id, label: categoryLabels[id] }));

export const allDistricts = DISTRICTS;

export function searchText(event: {
  title?: string;
  locationName?: string;
  district: District;
  category: Category;
  subcategory?: string;
  priceText?: string;
}): string {
  return fold(
    [
      event.title ?? '',
      event.locationName ?? '',
      event.district,
      districtLabels[event.district],
      event.category,
      categoryLabels[event.category],
      event.subcategory ? subcategoryLabel(event.subcategory) : '',
      event.priceText ?? '',
    ].join(' '),
  );
}

export function resultLabel(count: number): string {
  return count === 1 ? '1 εκδήλωση' : `${count} εκδηλώσεις`;
}
