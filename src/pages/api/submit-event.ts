import type { APIRoute } from 'astro';
import { json, sameOrigin } from '../../lib/http';
import { canWriteSanity, createPendingEvent, uploadEventImage } from '../../lib/sanity';
import { slugify } from '../../lib/slug';
import { parseSubmitForm } from '../../lib/submit';
import { textToBlocks } from '../../lib/text';

export const prerender = false;

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 4_000_000;

export const POST: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request, url.origin)) {
    return json({ ok: false, errors: ['Μη έγκυρη προέλευση.'] }, 403);
  }

  const form = await request.formData();
  if (String(form.get('company') || '').trim()) {
    return json({ ok: true, id: 'ignored', preview: true });
  }

  const parsed = parseSubmitForm(form);
  if (!parsed.data) return json({ ok: false, errors: parsed.errors }, 400);

  const image = form.get('image');
  if (image instanceof File && image.size > 0) {
    if (!IMAGE_TYPES.has(image.type)) {
      return json({ ok: false, errors: ['Η εικόνα πρέπει να είναι JPG, PNG ή WebP.'] }, 400);
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return json({ ok: false, errors: ['Η εικόνα πρέπει να είναι έως 4MB.'] }, 400);
    }
  }

  const slug = slugify(parsed.data.title);
  if (!canWriteSanity()) {
    return json({ ok: true, id: `preview-${slug}`, preview: true, tier: parsed.data.tier });
  }

  try {
    const mainImage = image instanceof File && image.size > 0 ? await uploadEventImage(image) : undefined;
    if (mainImage) mainImage.alt = parsed.data.title;
    const id = await createPendingEvent({
      ...parsed.data,
      slug,
      description: textToBlocks(parsed.data.description),
      mainImage,
    });
    return json({ ok: true, id, preview: false, tier: parsed.data.tier });
  } catch (error) {
    console.error(error);
    return json({ ok: false, errors: ['Η αποθήκευση στο Sanity απέτυχε. Δοκίμασε ξανά.'] }, 502);
  }
};
