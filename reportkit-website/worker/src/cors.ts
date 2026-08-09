export function corsHeaders(origin: string | null, allowed: string): HeadersInit {
  const allow =
    origin &&
    (origin === allowed ||
      origin === 'http://localhost:4321' ||
      origin === 'http://127.0.0.1:4321')
      ? origin
      : allowed;

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function jsonResponse(
  data: unknown,
  init: ResponseInit & { mode?: string; origin?: string | null; allowed?: string } = {}
) {
  const headers = new Headers(init.headers);
  const cors = corsHeaders(init.origin ?? null, init.allowed || 'https://reportkit.lorapok.tech');
  for (const [k, v] of Object.entries(cors)) headers.set(k, v as string);
  if (init.mode) headers.set('X-RK-Mode', init.mode);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}
