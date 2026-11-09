import type { APIRoute } from 'astro';
import { getEventBySlug } from '../../../lib/events';
import { buildIcs } from '../../../lib/share';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug;
  if (!slug) return new Response('Not found', { status: 404 });
  const { event } = await getEventBySlug(slug);
  if (!event) return new Response('Not found', { status: 404 });
  const pageUrl = new URL(`/events/${event.slug}`, url.origin).href;
  return new Response(buildIcs(event, pageUrl), {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${event.slug}.ics"`,
      'cache-control': 'public, max-age=300',
    },
  });
};
