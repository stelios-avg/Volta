import type { APIRoute } from 'astro';
import { decideSubmission, readModeration } from '../../lib/inbox';

export const prerender = false;

function page(title: string, message: string, token?: string): Response {
  const action = token
    ? `<form method="post"><input type="hidden" name="token" value="${token}" /><button type="submit">Επιβεβαίωση</button></form>`
    : '';
  return new Response(
    `<!doctype html><html lang="el"><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title}</title>
    <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#e7e0d1;color:#16120c;font-family:Inter,sans-serif">
      <main style="max-width:28rem;padding:2rem;text-align:center">
        <h1 style="font-size:1.6rem">${title}</h1>
        <p>${message}</p>
        ${action}
      </main>
    </body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  );
}

export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get('token') ?? '';
  const match = await readModeration(token);
  if (!match) return page('Άκυρος σύνδεσμος', 'Αυτός ο σύνδεσμος δεν αντιστοιχεί σε καταχώρηση.');
  if (match.row.status !== 'pending') return page('Ήδη απαντήθηκε', 'Αυτή η καταχώρηση έχει ήδη εγκριθεί ή απορριφθεί.');
  const verb = match.action === 'approve' ? 'έγκριση' : 'απόρριψη';
  return page(`Επιβεβαίωση ${verb}`, `«${escapeHtml(match.row.title)}». Πάτα επιβεβαίωση για ${verb}.`, token);
};

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const token = String(form.get('token') ?? '');
  const result = await decideSubmission(token);
  if (result === 'approved') return page('Εγκρίθηκε', 'Η εκδήλωση δημοσιεύτηκε.');
  if (result === 'rejected') return page('Απορρίφθηκε', 'Η εκδήλωση δεν θα εμφανιστεί.');
  if (result === 'already') return page('Ήδη απαντήθηκε', 'Αυτή η καταχώρηση έχει ήδη εγκριθεί ή απορριφθεί.');
  return page('Άκυρος σύνδεσμος', 'Αυτός ο σύνδεσμος δεν αντιστοιχεί σε καταχώρηση.');
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
