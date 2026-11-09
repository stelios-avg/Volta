import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Astro 5+ removed `output: 'hybrid'`. `output: 'server'` with the Vercel
// adapter is the on-demand equivalent: pages and API routes render on request,
// which keeps the event feed fresh without a rebuild.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  vite: {
    plugins: [tailwindcss()],
  },
});
