export type TripRow = {
  trip_id: string;
  booked_at: string;
  operator: string;
  route: string;
  channel: string;
  seats: number;
  fare_cents: number;
  status: string;
  _source?: string;
};

/** Parity with PHP PseudoPaginator::dedupeByKey — first wins, stable. */
export function dedupeByKey<T extends Record<string, unknown>>(
  rows: T[],
  key: string
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const v = row[key];
    if (v === undefined || v === null || v === '') {
      out.push(row);
      continue;
    }
    const id = String(v);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
}

/** Parity with PHP PseudoPaginator::sortBy */
export function sortBy<T extends Record<string, unknown>>(
  rows: T[],
  key: string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  const dir = direction === 'desc' ? -1 : 1;
  return rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => {
      const av = a.row[key];
      const bv = b.row[key];
      if (av === bv) return a.i - b.i;
      if (av == null) return -1 * dir;
      if (bv == null) return 1 * dir;
      if (typeof av === 'number' && typeof bv === 'number') {
        if (av === bv) return a.i - b.i;
        return (av < bv ? -1 : 1) * dir;
      }
      const cmp = String(av).localeCompare(String(bv));
      return cmp === 0 ? a.i - b.i : cmp * dir;
    })
    .map((x) => x.row);
}

export function sliceRows<T>(rows: T[], start: number, length: number): T[] {
  const s = Math.max(0, start | 0);
  const n = length | 0;
  if (n < 0) return rows.slice(s);
  return rows.slice(s, s + n);
}

export function mergeSources(
  live: TripRow[],
  archive: TripRow[],
  dedupeKey = 'trip_id',
  orderBy = 'booked_at',
  direction: 'asc' | 'desc' = 'desc'
) {
  const taggedLive = live.map((r) => ({ ...r, _source: 'live' as const }));
  const taggedArch = archive.map((r) => ({ ...r, _source: 'archive' as const }));
  const merged = [...taggedLive, ...taggedArch];
  const deduped = dedupeByKey(merged, dedupeKey);
  const sorted = sortBy(deduped, orderBy, direction);
  return {
    rows: sorted,
    merged: merged.length,
    deduped: deduped.length,
    dropped: merged.length - deduped.length,
  };
}

/** Weekly ranges mirroring DateRangeChunker::getWeeklyRanges */
export function getWeeklyRanges(startDate: string, endDate: string) {
  const out: { start: string; end: string }[] = [];
  const cur = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  while (cur <= end) {
    const weekStart = new Date(cur);
    const weekEnd = new Date(cur);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    if (weekEnd > end) weekEnd.setTime(end.getTime());
    out.push({
      start: weekStart.toISOString().slice(0, 10),
      end: weekEnd.toISOString().slice(0, 10),
    });
    cur.setUTCDate(cur.getUTCDate() + 7);
  }
  return out;
}
