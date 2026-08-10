export const DEMO_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_DEMO_API_URL) ||
  'https://reportkit-api.lorapok.tech';

export type Provenance = 'live' | 'synthetic' | 'measured' | 'cached';

export async function fetchDemoJson<T>(
  path: string,
  init?: RequestInit
): Promise<{ data: T | null; provenance: Provenance; error?: string }> {
  try {
    const res = await fetch(`${DEMO_API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers || {}),
      },
    });
    if (res.status === 429) {
      return { data: null, provenance: 'cached', error: 'quota' };
    }
    if (!res.ok) {
      return { data: null, provenance: 'cached', error: `http_${res.status}` };
    }
    const mode = (res.headers.get('X-RK-Mode') || 'live') as Provenance;
    const data = (await res.json()) as T;
    return { data, provenance: mode };
  } catch {
    return { data: null, provenance: 'cached', error: 'network' };
  }
}
