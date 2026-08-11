import type { TripRow } from './merge';

/** Fictional operators — not based on any real carrier or customer data. */
const OPERATORS = [
  'Northline Transit',
  'Riverway Coaches',
  'Summit Express',
  'Harbor Link',
  'Pioneer Routes',
  'Cedar Motor',
  'Atlas Shuttle',
  'Meridian Travel',
  'Beacon Lines',
  'Orbit Coaches',
  'Silver Route Co',
  'Skyway Transit',
  'Blue Ridge Bus',
  'Metro Forge',
  'Pearl Transit',
  'Sunrise Carriers',
  'Moonlight Express',
  'Rapid Axis',
  'Vista Horizon',
  'Orient Pathways',
];
const ROUTES = ['HUB-A-HUB-B', 'HUB-A-HUB-C', 'HUB-A-HUB-D', 'HUB-B-HUB-A', 'HUB-C-HUB-A', 'HUB-D-HUB-A', 'HUB-E-HUB-A', 'HUB-F-HUB-A'];
const CHANNELS = ['online', 'offline'];

/** Dummy virtual fleet size for synthetic paging demo. */
export const SYNTHETIC_TOTAL = 1_000_000_000;

const RANGE_START = Date.UTC(2012, 0, 1);
const RANGE_END = Date.UTC(2026, 7, 10);

/** Deterministic xorshift — any index, constant time. Dates span 2012 → present. */
export function syntheticRow(index: number): TripRow {
  let x = (index + 1) * 2654435761 >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const span = RANGE_END - RANGE_START;
  const ts = RANGE_START + (x % span);
  const d = new Date(ts);
  return {
    trip_id: `SYN-${index.toString(16).padStart(10, '0')}`,
    booked_at: d.toISOString().slice(0, 10),
    operator: OPERATORS[x % OPERATORS.length],
    route: ROUTES[(x >>> 3) % ROUTES.length],
    channel: CHANNELS[(x >>> 5) % CHANNELS.length],
    seats: 1 + (x % 4),
    fare_cents: 35000 + (x % 120) * 500,
    status: x % 30 === 0 ? 'cancelled' : 'confirmed',
    _source: d.getTime() < Date.UTC(2018, 0, 1) ? 'archive' : 'live',
  };
}

export function syntheticPage(start: number, length: number): TripRow[] {
  const s = Math.max(0, start | 0);
  const n = Math.min(Math.max(0, length | 0), 100);
  const rows: TripRow[] = [];
  for (let i = 0; i < n && s + i < SYNTHETIC_TOTAL; i++) {
    rows.push(syntheticRow(s + i));
  }
  return rows;
}
