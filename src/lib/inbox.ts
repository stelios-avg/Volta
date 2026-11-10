import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Category, District } from '../../shared/taxonomy';
import { isCategory, isDistrict } from '../../shared/taxonomy';
import { categoryLabels, districtLabels } from './labels';
import type { SubmitPayload } from './submit';
import type { EventRecord } from './types';

type SubmissionStatus = 'pending' | 'published' | 'rejected';

type StoredSubmission = {
  id: string;
  title: string;
  slug: string;
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
  imageUrl: string;
  imageAlt: string;
  status: SubmissionStatus;
  approveHash: string;
  rejectHash: string;
  createdAt: string;
};

const FILE = path.join(process.cwd(), 'data', 'submissions.json');

function moderationEmail(): string {
  return process.env.MODERATION_EMAIL || 'stelios0102@gmail.com';
}

function resendKey(): string | undefined {
  return process.env.RESEND_API_KEY;
}

function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

export function inboxReady(): boolean {
  return Boolean(resendKey() && (supabaseConfig() || process.env.VERCEL !== '1'));
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function sameHash(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

let queue = Promise.resolve();

function locked<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readFileStore(): Promise<StoredSubmission[]> {
  try {
    const raw = await readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw) as StoredSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFileStore(rows: StoredSubmission[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(rows, null, 2));
}

async function supabaseRequest(pathname: string, init: RequestInit = {}): Promise<Response> {
  const config = supabaseConfig();
  if (!config) throw new Error('supabase_not_configured');
  return fetch(`${config.url}${pathname}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

function fromRow(row: Record<string, unknown> | null): StoredSubmission | null {
  if (!row || typeof row.title !== 'string' || typeof row.slug !== 'string') return null;
  if (typeof row.district !== 'string' || !isDistrict(row.district)) return null;
  if (typeof row.category !== 'string' || !isCategory(row.category)) return null;
  const status = row.status;
  if (status !== 'pending' && status !== 'published' && status !== 'rejected') return null;
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    description: typeof row.description === 'string' ? row.description : '',
    startDate: String(row.start_date ?? row.startDate),
    endDate: typeof row.end_date === 'string' ? row.end_date : typeof row.endDate === 'string' ? row.endDate : undefined,
    district: row.district,
    locationName: typeof row.location_name === 'string' ? row.location_name : String(row.locationName ?? ''),
    googleMapsUrl: typeof row.google_maps_url === 'string' ? row.google_maps_url : undefined,
    category: row.category,
    priceText: typeof row.price_text === 'string' ? row.price_text : 'Δωρεάν',
    ticketUrl: typeof row.ticket_url === 'string' ? row.ticket_url : undefined,
    organizerContact: typeof row.organizer_contact === 'string' ? row.organizer_contact : '',
    imageUrl: typeof row.image_url === 'string' ? row.image_url : '/media/fallback.jpg',
    imageAlt: typeof row.image_alt === 'string' ? row.image_alt : row.title,
    status,
    approveHash: String(row.approve_token_hash ?? row.approveHash ?? ''),
    rejectHash: String(row.reject_token_hash ?? row.rejectHash ?? ''),
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
  };
}

async function insertSubmission(row: StoredSubmission): Promise<void> {
  const config = supabaseConfig();
  if (!config) {
    if (process.env.VERCEL === '1') throw new Error('store_not_configured');
    await locked(async () => {
      const rows = await readFileStore();
      rows.push(row);
      await writeFileStore(rows);
    });
    return;
  }
  const response = await supabaseRequest('/rest/v1/submissions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      start_date: row.startDate,
      end_date: row.endDate ?? null,
      district: row.district,
      location_name: row.locationName,
      google_maps_url: row.googleMapsUrl ?? null,
      category: row.category,
      price_text: row.priceText,
      ticket_url: row.ticketUrl ?? null,
      organizer_contact: row.organizerContact,
      image_url: row.imageUrl,
      image_alt: row.imageAlt,
      status: row.status,
      approve_token_hash: row.approveHash,
      reject_token_hash: row.rejectHash,
    }),
  });
  if (!response.ok) throw new Error(`supabase_insert_${response.status}`);
}

async function findByHash(hash: string): Promise<StoredSubmission | null> {
  const config = supabaseConfig();
  if (!config) {
    const rows = await readFileStore();
    return rows.find((row) => sameHash(row.approveHash, hash) || sameHash(row.rejectHash, hash)) ?? null;
  }
  const filter = `or=(approve_token_hash.eq.${hash},reject_token_hash.eq.${hash})`;
  const response = await supabaseRequest(`/rest/v1/submissions?${filter}&limit=1`);
  if (!response.ok) throw new Error(`supabase_read_${response.status}`);
  const rows = (await response.json()) as Record<string, unknown>[];
  return fromRow(rows[0] ?? null);
}

async function updateStatus(id: string, status: SubmissionStatus): Promise<void> {
  const config = supabaseConfig();
  if (!config) {
    await locked(async () => {
      const rows = await readFileStore();
      const row = rows.find((item) => item.id === id);
      if (row) row.status = status;
      await writeFileStore(rows);
    });
    return;
  }
  const response = await supabaseRequest(`/rest/v1/submissions?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(`supabase_update_${response.status}`);
}

async function saveImage(id: string, file: File): Promise<string | undefined> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const config = supabaseConfig();
  if (config) {
    const objectPath = `${id}.${extension}`;
    const response = await fetch(`${config.url}/storage/v1/object/event-images/${objectPath}`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: bytes,
    });
    if (!response.ok) return undefined;
    return `${config.url}/storage/v1/object/public/event-images/${objectPath}`;
  }
  if (process.env.VERCEL === '1') return undefined;
  const folder = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(folder, { recursive: true });
  const filename = `${id}.${extension}`;
  await writeFile(path.join(folder, filename), bytes);
  return `/uploads/${filename}`;
}

function toEvent(row: StoredSubmission): EventRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    district: row.district,
    locationName: row.locationName,
    googleMapsUrl: row.googleMapsUrl,
    category: row.category,
    priceText: row.priceText,
    ticketUrl: row.ticketUrl,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    isFeatured: false,
    status: 'published',
  };
}

export async function listPublishedSubmissions(): Promise<EventRecord[]> {
  try {
    const config = supabaseConfig();
    if (!config) {
      if (process.env.VERCEL === '1') return [];
      const rows = await readFileStore();
      return rows.filter((row) => row.status === 'published').map(toEvent);
    }
    const response = await supabaseRequest('/rest/v1/submissions?status=eq.published&select=*');
    if (!response.ok) return [];
    const rows = (await response.json()) as Record<string, unknown>[];
    return rows.map(fromRow).filter((row): row is StoredSubmission => Boolean(row && row.status === 'published')).map(toEvent);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function findPublishedSubmission(slug: string): Promise<EventRecord | null> {
  const events = await listPublishedSubmissions();
  return events.find((event) => event.slug === slug) ?? null;
}

function emailHtml(row: StoredSubmission, origin: string, approveToken: string, rejectToken: string): string {
  const when = new Intl.DateTimeFormat('el-CY', {
    timeZone: 'Asia/Nicosia',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(row.startDate));
  const rows = [
    ['Τίτλος', row.title],
    ['Κατηγορία', categoryLabels[row.category]],
    ['Επαρχία', districtLabels[row.district]],
    ['Χώρος', row.locationName],
    ['Έναρξη', when],
    ['Είσοδος', row.priceText],
    ['Επικοινωνία', row.organizerContact],
  ];
  const details = rows
    .map(([label, value]) => `<p><strong>${escape(label)}</strong><br />${escape(value)}</p>`)
    .join('');
  const approve = `${origin}/api/moderate?token=${approveToken}`;
  const reject = `${origin}/api/moderate?token=${rejectToken}`;
  return `<div style="font-family:Inter,Arial,sans-serif;color:#16120c">
    <p>Νέα καταχώρηση για έγκριση.</p>
    ${details}
    <p style="white-space:pre-wrap">${escape(row.description)}</p>
    <p><a href="${approve}">Έγκριση</a> · <a href="${reject}">Απόρριψη</a></p>
  </div>`;
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendReviewEmail(row: StoredSubmission, origin: string, approveToken: string, rejectToken: string): Promise<void> {
  const key = resendKey();
  if (!key) {
    if (process.env.VERCEL === '1') throw new Error('resend_not_configured');
    console.info(`Moderation links for ${row.title}: approve ${origin}/api/moderate?token=${approveToken}`);
    return;
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Volta <onboarding@resend.dev>',
      to: [moderationEmail()],
      subject: `Νέα καταχώρηση: ${row.title}`,
      html: emailHtml(row, origin, approveToken, rejectToken),
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error(detail);
    throw new Error('resend_failed');
  }
}

export async function submitForReview(
  input: SubmitPayload,
  slug: string,
  image: File | undefined,
  origin: string,
): Promise<{ id: string; emailed: boolean }> {
  const id = crypto.randomUUID();
  const approveToken = randomBytes(32).toString('hex');
  const rejectToken = randomBytes(32).toString('hex');
  const imageUrl = image && image.size > 0 ? await saveImage(id, image) : undefined;
  const row: StoredSubmission = {
    id,
    title: input.title,
    slug,
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
    imageUrl: imageUrl || '/media/fallback.jpg',
    imageAlt: input.title,
    status: 'pending',
    approveHash: hashToken(approveToken),
    rejectHash: hashToken(rejectToken),
    createdAt: new Date().toISOString(),
  };
  await insertSubmission(row);
  await sendReviewEmail(row, origin, approveToken, rejectToken);
  return { id, emailed: Boolean(resendKey()) };
}

export async function readModeration(token: string): Promise<{ row: StoredSubmission; action: 'approve' | 'reject' } | null> {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const hash = hashToken(token);
  const row = await findByHash(hash);
  if (!row) return null;
  if (sameHash(row.approveHash, hash)) return { row, action: 'approve' };
  if (sameHash(row.rejectHash, hash)) return { row, action: 'reject' };
  return null;
}

export async function decideSubmission(token: string): Promise<'approved' | 'rejected' | 'already' | 'missing'> {
  const match = await readModeration(token);
  if (!match) return 'missing';
  if (match.row.status !== 'pending') return 'already';
  await updateStatus(match.row.id, match.action === 'approve' ? 'published' : 'rejected');
  return match.action === 'approve' ? 'approved' : 'rejected';
}
