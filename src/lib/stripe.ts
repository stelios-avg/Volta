import Stripe from 'stripe';
import { env } from './env';

export const BOOST_PRICE_CENTS = 2500;

export function stripeClient(): Stripe | null {
  const key = env('STRIPE_SECRET_KEY');
  if (!key) return null;
  return new Stripe(key);
}

export function siteOrigin(fallback: string): string {
  return env('PUBLIC_SITE_URL') || fallback;
}
