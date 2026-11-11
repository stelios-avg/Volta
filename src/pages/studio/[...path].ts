import type { APIRoute } from 'astro';
import html from '../../../public/studio/index.html?raw';

function canonical(path: string): string | null {
  if (path === 'index.html' || path === 'studio') return '/studio';
  if (path.startsWith('studio/')) return `/studio/${path.slice('studio/'.length)}`;
  return null;
}

export const GET: APIRoute = ({ params, redirect }) => {
  const target = canonical(params.path ?? '');
  if (target) return redirect(target);
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-cache',
    },
  });
};
