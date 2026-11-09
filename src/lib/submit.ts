import { isCategory, isDistrict, type Category, type District } from '../../shared/taxonomy';
import { cyprusLocalToISO } from './dates';

export interface SubmitPayload {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  district: District;
  locationName: string;
  googleMapsUrl?: string;
  category: Category;
  priceText: string;
  ticketUrl?: string;
  organizerContact: string;
  tier: 'free' | 'boosted';
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function httpUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function isContact(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^\+?[0-9][0-9\s()-]{6,}$/.test(value);
}

export function isEventId(value: string): boolean {
  return /^(preview-[a-z0-9-]{3,96}|event-[0-9a-f-]{10,80})$/i.test(value);
}

export function parseSubmitForm(form: FormData): { data?: SubmitPayload; errors: string[] } {
  const errors: string[] = [];
  const title = field(form, 'title');
  if (title.length < 3 || title.length > 140) errors.push('Ο τίτλος χρειάζεται 3 έως 140 χαρακτήρες.');

  const description = field(form, 'description');
  if (description.length < 20 || description.length > 4000) {
    errors.push('Η περιγραφή χρειάζεται 20 έως 4000 χαρακτήρες.');
  }

  const startDate = cyprusLocalToISO(field(form, 'startDate'));
  if (!startDate) errors.push('Συμπλήρωσε έγκυρη ημερομηνία έναρξης.');

  const endRaw = field(form, 'endDate');
  let endDate: string | undefined;
  if (endRaw) {
    const parsedEnd = cyprusLocalToISO(endRaw);
    if (!parsedEnd) errors.push('Η ημερομηνία λήξης δεν είναι έγκυρη.');
    else endDate = parsedEnd;
  }
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    errors.push('Η λήξη είναι πριν από την έναρξη.');
  }

  const district = field(form, 'district');
  if (!isDistrict(district)) errors.push('Διάλεξε επαρχία.');

  const category = field(form, 'category');
  if (!isCategory(category)) errors.push('Διάλεξε κατηγορία.');

  const locationName = field(form, 'locationName');
  if (locationName.length < 2 || locationName.length > 160) errors.push('Συμπλήρωσε τον χώρο ή το χωριό.');

  const mapsRaw = field(form, 'googleMapsUrl');
  const googleMapsUrl = mapsRaw ? httpUrl(mapsRaw) : undefined;
  if (mapsRaw && !googleMapsUrl) errors.push('Ο σύνδεσμος χάρτη πρέπει να ξεκινά με http ή https.');

  const ticketRaw = field(form, 'ticketUrl');
  const ticketUrl = ticketRaw ? httpUrl(ticketRaw) : undefined;
  if (ticketRaw && !ticketUrl) errors.push('Ο σύνδεσμος εισιτηρίων πρέπει να ξεκινά με http ή https.');

  const organizerContact = field(form, 'organizerContact');
  if (!isContact(organizerContact)) errors.push('Συμπλήρωσε email ή τηλέφωνο επικοινωνίας.');

  const tierRaw = field(form, 'tier');
  const tier = tierRaw === 'boosted' || tierRaw === 'free' ? tierRaw : null;
  if (!tier) errors.push('Διάλεξε δωρεάν ή προβεβλημένη καταχώρηση.');

  const priceText = (field(form, 'priceText') || 'Δωρεάν').slice(0, 40);

  if (errors.length || !startDate || !isDistrict(district) || !isCategory(category) || !tier) {
    return { errors };
  }

  return {
    errors: [],
    data: {
      title,
      description,
      startDate,
      endDate,
      district,
      locationName,
      googleMapsUrl,
      category,
      priceText,
      ticketUrl,
      organizerContact,
      tier,
    },
  };
}
