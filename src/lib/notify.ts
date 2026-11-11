import { categoryLabels, districtLabels } from './labels';
import type { SubmitPayload } from './submit';

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function notifyNewSubmission(input: SubmitPayload, id: string, origin: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info('Submission saved. RESEND_API_KEY is missing, so no email was sent.');
    return;
  }

  const to = process.env.MODERATION_EMAIL || 'stelios0102@gmail.com';
  const when = new Intl.DateTimeFormat('el-CY', {
    timeZone: 'Asia/Nicosia',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(input.startDate));
  const studio = `${origin}/studio/intent/edit/id=drafts.${id};type=event`;
  const rows = [
    ['Τίτλος', input.title],
    ['Κατηγορία', categoryLabels[input.category]],
    ['Επαρχία', districtLabels[input.district]],
    ['Χώρος', input.locationName],
    ['Έναρξη', when],
    ['Επικοινωνία', input.organizerContact],
  ];
  const details = rows
    .map(([label, value]) => `<p><strong>${escape(label)}</strong><br />${escape(value)}</p>`)
    .join('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Volta <onboarding@resend.dev>',
      to: [to],
      subject: `Νέα καταχώρηση: ${input.title}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;color:#16120c">
        <p>Κάποιος έστειλε νέα εκδήλωση. Άνοιξε το Studio και πάτα Publish για να φανεί στο site.</p>
        ${details}
        <p><a href="${studio}">Άνοιγμα στο Studio</a></p>
      </div>`,
    }),
  });

  if (!response.ok) console.error(await response.text());
}
