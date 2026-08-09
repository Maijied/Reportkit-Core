import { corsHeaders, jsonResponse } from './cors';
import { getWeeklyRanges, mergeSources, sliceRows, type TripRow } from './merge';
import { SYNTHETIC_TOTAL, syntheticPage } from './generate';

export interface Env {
  DB_LIVE: D1Database;
  DB_ARCHIVE: D1Database;
  ALLOWED_ORIGIN: string;
}

const FIXTURE_ROWS: TripRow[] = [
  { trip_id: 'DMY-L-10001', booked_at: '2026-01-02', operator: 'Northline Transit', route: 'HUB-A-HUB-B', channel: 'online', seats: 2, fare_cents: 85000, status: 'confirmed', _source: 'live' },
  { trip_id: 'DMY-L-10002', booked_at: '2026-01-02', operator: 'Riverway Coaches', route: 'HUB-A-HUB-C', channel: 'offline', seats: 1, fare_cents: 72000, status: 'confirmed', _source: 'live' },
  { trip_id: 'DMY-A-90001', booked_at: '2015-11-18', operator: 'Summit Express', route: 'HUB-A-HUB-D', channel: 'online', seats: 1, fare_cents: 65000, status: 'confirmed', _source: 'archive' },
  { trip_id: 'DMY-L-10003', booked_at: '2026-01-03', operator: 'Northline Transit', route: 'HUB-A-HUB-B', channel: 'online', seats: 3, fare_cents: 85000, status: 'confirmed', _source: 'live' },
  { trip_id: 'DMY-A-90002', booked_at: '2014-10-05', operator: 'Harbor Link', route: 'HUB-E-HUB-A', channel: 'offline', seats: 2, fare_cents: 58000, status: 'confirmed', _source: 'archive' },
];

async function queryTrips(db: D1Database, start: string, end: string, source: 'live' | 'archive', limit = 500): Promise<TripRow[]> {
  if (source === 'live') {
    const res = await db
      .prepare(
        `SELECT t.trip_id, t.booked_at, o.name AS operator, t.route, t.channel, t.seats, t.fare_cents, t.status
         FROM trips t
         INNER JOIN operators o ON o.id = t.operator_id
         WHERE t.booked_at >= ? AND t.booked_at <= ?
         ORDER BY t.booked_at DESC LIMIT ?`
      )
      .bind(start, end, limit)
      .all<TripRow>();
    return res.results || [];
  }
  const res = await db
    .prepare(
      `SELECT trip_id, booked_at, operator_code AS operator, route, channel, seats, fare_cents, status
       FROM trips
       WHERE booked_at >= ? AND booked_at <= ?
       ORDER BY booked_at DESC LIMIT ?`
    )
    .bind(start, end, limit)
    .all<TripRow>();
  return res.results || [];
}

async function countTrips(db: D1Database, start: string, end: string, source: 'live' | 'archive'): Promise<number> {
  if (source === 'live') {
    const row = await db
      .prepare(`SELECT COUNT(*) AS c FROM trips WHERE booked_at >= ? AND booked_at <= ?`)
      .bind(start, end)
      .first<{ c: number }>();
    return row?.c || 0;
  }
  const row = await db
    .prepare(`SELECT COUNT(*) AS c FROM trips WHERE booked_at >= ? AND booked_at <= ?`)
    .bind(start, end)
    .first<{ c: number }>();
  return row?.c || 0;
}

async function countOverlap(db: D1Database, start: string, end: string): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS c FROM trips WHERE trip_id LIKE 'X-%' AND booked_at >= ? AND booked_at <= ?`
    )
    .bind(start, end)
    .first<{ c: number }>();
  return row?.c || 0;
}

async function readReportStats(db: D1Database): Promise<Record<string, number>> {
  try {
    const res = await db.prepare(`SELECT key, value FROM report_stats`).all<{ key: string; value: number }>();
    const out: Record<string, number> = {};
    for (const row of res.results || []) out[row.key] = row.value;
    return out;
  } catch {
    return {};
  }
}

async function readReportMeta(db: D1Database): Promise<Record<string, string>> {
  try {
    const res = await db.prepare(`SELECT key, value FROM report_meta`).all<{ key: string; value: string }>();
    const out: Record<string, string> = {};
    for (const row of res.results || []) out[row.key] = row.value;
    return out;
  } catch {
    return {};
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGIN || 'https://reportkit.lorapok.tech';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) });
    }

    try {
      if (url.pathname === '/v1/health') {
        return jsonResponse(
          {
            ok: true,
            service: 'reportkit-demo-api',
            modes: ['live', 'synthetic', 'cached'],
            research: {
              virtual_logical_total: SYNTHETIC_TOTAL,
              data_kind: 'dummy_synthetic',
              date_range: { min: '2012-01-01', max: '2026-08-10' },
              live_db: '2018 → present (operator_id FK)',
              archive_db: '2012 → 2017 (operator_code cross-ref)',
            },
            note: 'All demo rows are fictional. Free-tier D1 stores a sample; synthetic mode exposes 50M virtual rows.',
          },
          { mode: 'live', origin, allowed }
        );
      }

      if (url.pathname === '/v1/weeks') {
        const start = url.searchParams.get('start_date') || '2012-01-01';
        const end = url.searchParams.get('end_date') || '2026-08-10';
        return jsonResponse({ weeks: getWeeklyRanges(start, end) }, { mode: 'live', origin, allowed });
      }

      const mode = url.searchParams.get('mode') || 'live';
      const startDate = url.searchParams.get('start_date') || '2012-01-01';
      const endDate = url.searchParams.get('end_date') || '2026-08-10';
      const start = parseInt(url.searchParams.get('start') || '0', 10);
      const length = parseInt(url.searchParams.get('length') || '25', 10);
      const draw = parseInt(url.searchParams.get('draw') || '1', 10);

      if (mode === 'synthetic') {
        const data = syntheticPage(start, length);
        const payload = {
          draw,
          recordsTotal: SYNTHETIC_TOTAL,
          recordsFiltered: SYNTHETIC_TOTAL,
          data,
          summary: {
            total_rows: SYNTHETIC_TOTAL,
            provenance: 'synthetic',
            date_range: { min: '2012-01-01', max: '2026-08-10' },
          },
        };
        if (url.pathname === '/v1/trace') {
          return jsonResponse(
            {
              mode: 'synthetic',
              live: { rows: 0, ms: 0 },
              archive: { rows: 0, ms: 0 },
              merged: SYNTHETIC_TOTAL,
              deduped: SYNTHETIC_TOTAL,
              dropped: 0,
              sliced: data.length,
              total_ms: 0.2,
              note: 'Virtual 50M address space — rows materialized on demand (2012 → now)',
            },
            { mode: 'synthetic', origin, allowed }
          );
        }
        if (url.pathname === '/v1/stats') {
          return jsonResponse(
            {
              live_rows: 0,
              archive_rows: 0,
              virtual_rows: SYNTHETIC_TOTAL,
              data_kind: 'dummy_synthetic',
              provenance: 'synthetic',
            },
            { mode: 'synthetic', origin, allowed }
          );
        }
        return jsonResponse(payload, { mode: 'synthetic', origin, allowed });
      }

      let live: TripRow[] = [];
      let archive: TripRow[] = [];
      let liveCount = 0;
      let archCount = 0;
      let overlapCount = 0;
      let liveMs = 0;
      let archMs = 0;
      let provenance: 'live' | 'cached' = 'live';
      let dbStats: Record<string, number> = {};
      let dbMeta: Record<string, string> = {};

      try {
        const t0 = performance.now();
        live = await queryTrips(env.DB_LIVE, startDate, endDate, 'live');
        liveMs = performance.now() - t0;
        const t1 = performance.now();
        archive = await queryTrips(env.DB_ARCHIVE, startDate, endDate, 'archive');
        archMs = performance.now() - t1;
        liveCount = await countTrips(env.DB_LIVE, startDate, endDate, 'live');
        archCount = await countTrips(env.DB_ARCHIVE, startDate, endDate, 'archive');
        overlapCount = await countOverlap(env.DB_LIVE, startDate, endDate);
        dbStats = await readReportStats(env.DB_LIVE);
        dbMeta = await readReportMeta(env.DB_LIVE);
        if (live.length === 0 && archive.length === 0 && liveCount === 0 && archCount === 0) {
          throw new Error('empty');
        }
      } catch {
        provenance = 'cached';
        live = FIXTURE_ROWS.filter((r) => r._source === 'live');
        archive = FIXTURE_ROWS.filter((r) => r._source === 'archive');
        liveMs = 0.1;
        archMs = 0.1;
        liveCount = live.length;
        archCount = archive.length;
        overlapCount = 0;
      }

      const merged = mergeSources(live, archive);
      const dedupedTotal = Math.max(0, liveCount + archCount - overlapCount);
      const page = sliceRows(merged.rows, start, length);

      if (url.pathname === '/v1/trace') {
        return jsonResponse(
          {
            mode: provenance,
            live: { rows: liveCount, ms: Math.round(liveMs * 1000) / 1000 },
            archive: { rows: archCount, ms: Math.round(archMs * 1000) / 1000 },
            merged: liveCount + archCount,
            deduped: dedupedTotal,
            dropped: overlapCount,
            sliced: page.length,
            total_ms: Math.round((liveMs + archMs) * 1000) / 1000,
            date_range: { start: startDate, end: endDate },
          },
          { mode: provenance, origin, allowed }
        );
      }

      if (url.pathname === '/v1/stats') {
        return jsonResponse(
          {
            live_rows: dbStats.live_rows ?? liveCount,
            archive_rows: dbStats.archive_rows ?? archCount,
            merged_in_range: dedupedTotal,
            virtual_logical_total: dbStats.virtual_logical_total ?? SYNTHETIC_TOTAL,
            data_kind: dbMeta.data_kind || 'dummy_synthetic',
            date_ranges: {
              live: [dbMeta.live_date_min || '2018-01-01', dbMeta.live_date_max || '2026-08-10'],
              archive: [dbMeta.archive_date_min || '2012-01-01', dbMeta.archive_date_max || '2017-12-31'],
            },
            provenance,
          },
          { mode: provenance, origin, allowed }
        );
      }

      if (url.pathname === '/v1/rows') {
        return jsonResponse({ rows: page, count: dedupedTotal }, { mode: provenance, origin, allowed });
      }

      if (url.pathname === '/v1/data') {
        return jsonResponse(
          {
            draw,
            recordsTotal: dedupedTotal,
            recordsFiltered: dedupedTotal,
            data: page,
            summary: {
              total_rows: dedupedTotal,
              dropped_duplicates: overlapCount,
              live_in_range: liveCount,
              archive_in_range: archCount,
              provenance,
            },
          },
          { mode: provenance, origin, allowed }
        );
      }

      return jsonResponse({ error: 'Not found' }, { status: 404, origin, allowed });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'error';
      if (message.includes('limit') || message.includes('Quota')) {
        return jsonResponse(
          { error: 'quota_exceeded', note: 'Free-tier daily limit — use fixtures' },
          { status: 429, mode: 'cached', origin, allowed }
        );
      }
      return jsonResponse({ error: message }, { status: 500, origin, allowed });
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env) {
    try {
      const liveCount = await env.DB_LIVE.prepare('SELECT COUNT(*) AS c FROM trips').first<{ c: number }>();
      const archCount = await env.DB_ARCHIVE.prepare('SELECT COUNT(*) AS c FROM trips').first<{ c: number }>();
      await env.DB_LIVE.prepare(
        `INSERT INTO report_stats (key, value, updated_at) VALUES ('live_rows', ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
        .bind(liveCount?.c || 0)
        .run();
      await env.DB_ARCHIVE.prepare(
        `INSERT INTO report_stats (key, value, updated_at) VALUES ('archive_rows', ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
        .bind(archCount?.c || 0)
        .run();
    } catch {
      // ignore cron failures on empty DBs
    }
  },
};
