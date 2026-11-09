import type { APIRoute } from 'astro';
import type Stripe from 'stripe';
import { env } from '../../../lib/env';
import { json } from '../../../lib/http';
import { canWriteSanity, markEventBoosted } from '../../../lib/sanity';
import { stripeClient } from '../../../lib/stripe';
import { isEventId } from '../../../lib/submit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const stripe = stripeClient();
  const secret = env('STRIPE_WEBHOOK_SECRET');
  if (!stripe || !secret) return json({ error: 'not_configured' }, 503);

  const signature = request.headers.get('stripe-signature');
  if (!signature) return json({ error: 'missing_signature' }, 400);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return json({ error: 'invalid_signature' }, 400);
  }

  if (event.type !== 'checkout.session.completed') return json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  const eventId = session.metadata?.eventId ?? '';
  if (!isEventId(eventId)) return json({ received: true, ignored: true });
  if (!canWriteSanity()) return json({ error: 'sanity_not_configured' }, 500);

  try {
    const result = await markEventBoosted(eventId);
    if (result === 'missing') {
      console.warn('Paid checkout referenced an unknown event', eventId);
      return json({ received: true, ignored: true });
    }
    return json({ received: true, featured: true });
  } catch (error) {
    console.error(error);
    return json({ error: 'sanity_update_failed' }, 500);
  }
};
