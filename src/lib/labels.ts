import type { Category, District } from '../../shared/taxonomy';
import { CATEGORIES, DISTRICTS } from '../../shared/taxonomy';
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

export const categoryLabels: Record<Category, string> = {
  'Village Festivals': 'Πανηγύρια',
  'Live Music & Nightlife': 'Ζωντανή μουσική',
  'Kids & Family': 'Παιδιά & οικογένεια',
  'Food & Wine': 'Φαγητό & κρασί',
  'Culture & Theatre': 'Πολιτισμός & θέατρο',
  'Outdoors & Nature': 'Φύση & ύπαιθρος',
};

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
      event.priceText ?? '',
    ].join(' '),
  );
}

export function resultLabel(count: number): string {
  return count === 1 ? '1 εκδήλωση' : `${count} εκδηλώσεις`;
}
