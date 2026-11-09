export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export function sameOrigin(request: Request, origin: string): boolean {
  const header = request.headers.get('origin');
  return !header || header === origin;
}
