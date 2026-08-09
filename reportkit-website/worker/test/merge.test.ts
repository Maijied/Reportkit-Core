import { describe, expect, it } from 'vitest';
import { dedupeByKey, getWeeklyRanges, mergeSources, sortBy, sliceRows } from '../src/merge';

describe('merge parity with PseudoPaginator', () => {
  it('dedupes keeping first', () => {
    const rows = [
      { trip_id: 'T1', n: 'a' },
      { trip_id: 'T2', n: 'b' },
      { trip_id: 'T1', n: 'c' },
      { n: 'orphan' },
    ];
    const unique = dedupeByKey(rows, 'trip_id');
    expect(unique).toHaveLength(3);
    expect(unique[0].n).toBe('a');
  });

  it('sorts desc stably', () => {
    const rows = [
      { id: 1, v: 10 },
      { id: 2, v: 30 },
      { id: 3, v: 20 },
    ];
    const sorted = sortBy(rows, 'v', 'desc');
    expect(sorted.map((r) => r.v)).toEqual([30, 20, 10]);
  });

  it('merges live over archive', () => {
    const live = [
      { trip_id: 'T1', booked_at: '2026-01-02', operator: 'A', route: 'X', channel: 'online', seats: 1, fare_cents: 1, status: 'ok' },
      { trip_id: 'T2', booked_at: '2026-01-03', operator: 'A', route: 'X', channel: 'online', seats: 1, fare_cents: 1, status: 'ok' },
    ];
    const archive = [
      { trip_id: 'T1', booked_at: '2026-01-02', operator: 'B', route: 'X', channel: 'offline', seats: 1, fare_cents: 1, status: 'ok' },
      { trip_id: 'T0', booked_at: '2025-12-01', operator: 'B', route: 'X', channel: 'offline', seats: 1, fare_cents: 1, status: 'ok' },
    ];
    const m = mergeSources(live, archive);
    expect(m.deduped).toBe(3);
    expect(m.dropped).toBe(1);
    expect(m.rows[0].trip_id).toBe('T2');
    expect(m.rows.find((r) => r.trip_id === 'T1')?._source).toBe('live');
  });

  it('slices pages', () => {
    expect(sliceRows([1, 2, 3, 4], 1, 2)).toEqual([2, 3]);
  });

  it('chunks weeks like DateRangeChunker', () => {
    const weeks = getWeeklyRanges('2026-01-01', '2026-01-20');
    expect(weeks[0]).toEqual({ start: '2026-01-01', end: '2026-01-07' });
    expect(weeks[weeks.length - 1].end).toBe('2026-01-20');
  });
});
