# What's On Cyprus

Mobile-first directory of events across Cyprus. The interface is Greek. The code, schema, and URLs stay in English.

Astro 7 no longer has `output: 'hybrid'`. This app uses `output: 'server'` with `@astrojs/vercel`, which server-renders pages and API routes on demand.

## Scripts

```bash
npm run dev       # http://127.0.0.1:4321
npm run build
npm run preview
npm run check
npm run studio    # Sanity Studio
```

Without Sanity keys, the homepage renders sample events so the UI can be reviewed immediately. A banner on the page says so.

## Environment

Copy `.env.example` to `.env`.

| Name | Purpose |
| --- | --- |
| `PUBLIC_SANITY_PROJECT_ID` | Sanity project. Reads fall back to sample events when this is empty. |
| `PUBLIC_SANITY_DATASET` | Defaults to `production`. |
| `SANITY_API_TOKEN` | Editor token used to create submissions and to publish paid boosts. |
| `SANITY_API_READ_TOKEN` | Optional. Needed only when the dataset is private. |
| `STRIPE_SECRET_KEY` | Checkout for the €25 featured listing. |
| `STRIPE_WEBHOOK_SECRET` | Verifies `checkout.session.completed`. |
| `PUBLIC_SITE_URL` | Absolute origin for Stripe return URLs. The request origin is used when this is empty. |

Point the Stripe webhook at `/api/webhooks/stripe`.

## Submissions

Free listings are created as Sanity drafts with `status: 'pending'` and `isFeatured: false`. Approve them in Studio, set `status` to `published`, and publish the document.

A featured listing (€25) uses the same draft, then Stripe Checkout. The webhook publishes the document, sets `isFeatured: true`, `status: 'published'`, and `featuredUntil` 30 days out. `organizerContact` is never queried by the public site.

## Filters

Timeframe, district, and category are shareable query params (`when`, `district`, `category`, `q`) and also update instantly in the browser. Dates are calculated in `Asia/Nicosia`.
