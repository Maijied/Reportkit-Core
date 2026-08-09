import type { TripRow } from './merge';

const OPERATORS = ['Hanif', 'Green Line', 'Shyamoli', 'Ena', 'Desh Travels'];
const ROUTES = ['DHK-CTG', 'DHK-SYL', 'DHK-RAJ', 'DHK-KHL', 'CTG-DHK', 'SYL-DHK'];
const CHANNELS = ['online', 'offline'];

/** Deterministic xorshift for synthetic mode — any index, constant time. */
export function syntheticRow(index: number): TripRow {
  let x = (index + 1) * 2654435761 >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const day = x % 3650; // ~10 years
  const d = new Date(Date.UTC(2016, 0, 1));
  d.setUTCDate(d.getUTCDate() + day);
  return {
    trip_id: `SYN-${index.toString(16).padStart(10, '0')}`,
    booked_at: d.toISOString().slice(0, 10),
    operator: OPERATORS[x % OPERATORS.length],
    route: ROUTES[(x >>> 3) % ROUTES.length],
    channel: CHANNELS[(x >>> 5) % CHANNELS.length],
    seats: 1 + (x % 4),
    fare_cents: 50000 + (x % 50) * 1000,
    status: 'confirmed',
    _source: index % 5 === 0 ? 'archive' : 'live',
  };
}

export const SYNTHETIC_TOTAL = 2_400_000_000;

export function syntheticPage(start: number, length: number): TripRow[] {
  const s = Math.max(0, start | 0);
  const n = Math.min(Math.max(0, length | 0), 100);
  const rows: TripRow[] = [];
  for (let i = 0; i < n && s + i < SYNTHETIC_TOTAL; i++) {
    rows.push(syntheticRow(s + i));
  }
  return rows;
}
