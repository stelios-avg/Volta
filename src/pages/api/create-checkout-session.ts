import type { APIRoute } from 'astro';
import { json, sameOrigin } from '../../lib/http';
import { BOOST_PRICE_CENTS, siteOrigin, stripeClient } from '../../lib/stripe';
import { isEventId } from '../../lib/submit';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  if (!sameOrigin(request, url.origin)) return json({ ok: false, error: 'forbidden' }, 403);

  let body: { eventId?: unknown; title?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const eventId = typeof body.eventId === 'string' ? body.eventId : '';
  if (!isEventId(eventId)) return json({ ok: false, error: 'invalid_event' }, 400);

  const stripe = stripeClient();
  if (!stripe) return json({ ok: false, error: 'stripe_not_configured' }, 503);

  const title = (typeof body.title === 'string' ? body.title : "What's On Cyprus").replace(/\s+/g, ' ').slice(0, 140);
  const origin = siteOrigin(url.origin);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${origin}/submit?status=boosted&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/submit?status=cancelled&eventId=${encodeURIComponent(eventId)}`,
      metadata: { eventId },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: BOOST_PRICE_CENTS,
            product_data: {
              name: 'Προβεβλημένη καταχώρηση',
              description: title,
            },
          },
        },
      ],
    });
    if (!session.url) return json({ ok: false, error: 'missing_url' }, 502);
    return json({ ok: true, url: session.url });
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: 'stripe_error' }, 502);
  }
};
