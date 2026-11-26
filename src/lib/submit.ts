import { isCategory, isDistrict, listingKind, type Category, type District } from '../../shared/taxonomy';
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
  subcategory: string;
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
  if (description.length > 4000) {
    errors.push('Η περιγραφή μπορεί να έχει έως 4000 χαρακτήρες.');
  }

  const stamp = (dayName: string, timeName: string) => {
    const day = field(form, dayName);
    const time = field(form, timeName).slice(0, 5);
    if (!day && !time) return undefined;
    if (!day || !time) return null;
    return cyprusLocalToISO(`${day}T${time}`);
  };

  const startDate = stamp('startDay', 'startTime');
  if (!startDate) errors.push('Συμπλήρωσε ημέρα και ώρα έναρξης.');

  const endDate = stamp('endDay', 'endTime');
  if (endDate === null) errors.push('Η λήξη θέλει και ημέρα και ώρα.');
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    errors.push('Η λήξη είναι πριν από την έναρξη.');
  }

  const district = field(form, 'district');
  if (!isDistrict(district)) errors.push('Διάλεξε επαρχία.');

  const category = field(form, 'category');
  if (!isCategory(category)) errors.push('Διάλεξε κατηγορία.');

  const subcategory = field(form, 'subcategory');
  if (isCategory(category) && listingKind(category, subcategory) !== 'event') {
    errors.push('Διάλεξε υποκατηγορία εκδήλωσης.');
  }

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

  const priceText = (field(form, 'priceText') || 'Δωρεάν').slice(0, 40);

  if (errors.length || !startDate || !isDistrict(district) || !isCategory(category) || listingKind(category, subcategory) !== 'event') {
    return { errors };
  }

  return {
    errors: [],
    data: {
      title,
      description,
      startDate,
      endDate: endDate || undefined,
      district,
      locationName,
      googleMapsUrl,
      category,
      subcategory,
      priceText,
      ticketUrl,
      organizerContact,
      tier: 'free',
    },
  };
}

export interface VenuePayload {
  title: string;
  description: string;
  district: District;
  locationName: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  category: Category;
  subcategory: string;
  organizerContact: string;
}

export function parseVenueForm(form: FormData): { data?: VenuePayload; errors: string[] } {
  const errors: string[] = [];
  const title = field(form, 'title');
  if (title.length < 2 || title.length > 140) errors.push('Το όνομα του χώρου χρειάζεται 2 έως 140 χαρακτήρες.');

  const description = field(form, 'description');
  if (description.length > 4000) errors.push('Η περιγραφή μπορεί να έχει έως 4000 χαρακτήρες.');

  const district = field(form, 'district');
  if (!isDistrict(district)) errors.push('Διάλεξε επαρχία.');

  const category = field(form, 'category');
  if (!isCategory(category)) errors.push('Διάλεξε κατηγορία.');

  const subcategory = field(form, 'subcategory');
  if (isCategory(category) && listingKind(category, subcategory) !== 'venue') {
    errors.push('Διάλεξε υποκατηγορία χώρου.');
  }

  const locationName = field(form, 'locationName');
  if (locationName.length < 2 || locationName.length > 160) errors.push('Συμπλήρωσε τη διεύθυνση ή την περιοχή.');

  const mapsRaw = field(form, 'googleMapsUrl');
  const googleMapsUrl = mapsRaw ? httpUrl(mapsRaw) : undefined;
  if (mapsRaw && !googleMapsUrl) errors.push('Ο σύνδεσμος χάρτη πρέπει να ξεκινά με http ή https.');

  const siteRaw = field(form, 'websiteUrl');
  const websiteUrl = siteRaw ? httpUrl(siteRaw) : undefined;
  if (siteRaw && !websiteUrl) errors.push('Ο ιστότοπος πρέπει να ξεκινά με http ή https.');

  const organizerContact = field(form, 'organizerContact');
  if (!isContact(organizerContact)) errors.push('Συμπλήρωσε email ή τηλέφωνο επικοινωνίας.');

  if (errors.length || !isDistrict(district) || !isCategory(category) || listingKind(category, subcategory) !== 'venue') {
    return { errors };
  }

  return {
    errors: [],
    data: { title, description, district, locationName, googleMapsUrl, websiteUrl, category, subcategory, organizerContact },
  };
}
