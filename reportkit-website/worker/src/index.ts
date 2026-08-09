import { corsHeaders, jsonResponse } from './cors';
import { getWeeklyRanges, mergeSources, sliceRows, type TripRow } from './merge';
import { SYNTHETIC_TOTAL, syntheticPage } from './generate';

export interface Env {
  DB_LIVE: D1Database;
  DB_ARCHIVE: D1Database;
  ALLOWED_ORIGIN: string;
}

const FIXTURE_ROWS: TripRow[] = [
  { trip_id: 'T-10001', booked_at: '2026-01-02', operator: 'Hanif', route: 'DHK-CTG', channel: 'online', seats: 2, fare_cents: 85000, status: 'confirmed', _source: 'live' },
  { trip_id: 'T-10002', booked_at: '2026-01-02', operator: 'Green Line', route: 'DHK-SYL', channel: 'offline', seats: 1, fare_cents: 72000, status: 'confirmed', _source: 'live' },
  { trip_id: 'T-90001', booked_at: '2025-11-18', operator: 'Shyamoli', route: 'DHK-RAJ', channel: 'online', seats: 1, fare_cents: 65000, status: 'confirmed', _source: 'archive' },
  { trip_id: 'T-10003', booked_at: '2026-01-03', operator: 'Hanif', route: 'DHK-CTG', channel: 'online', seats: 3, fare_cents: 85000, status: 'confirmed', _source: 'live' },
  { trip_id: 'T-90002', booked_at: '2025-10-05', operator: 'Ena', route: 'DHK-KHL', channel: 'offline', seats: 2, fare_cents: 58000, status: 'confirmed', _source: 'archive' },
];

async function queryTrips(db: D1Database, start: string, end: string, limit = 500): Promise<TripRow[]> {
  const res = await db
    .prepare(
      `SELECT trip_id, booked_at, operator, route, channel, seats, fare_cents, status
       FROM trips WHERE booked_at >= ? AND booked_at <= ?
       ORDER BY booked_at DESC LIMIT ?`
    )
    .bind(start, end, limit)
    .all<TripRow>();
  return res.results || [];
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
            note: 'Free-tier D1 cannot store billions of rows — synthetic mode is labeled.',
          },
          { mode: 'live', origin, allowed }
        );
      }

      if (url.pathname === '/v1/weeks') {
        const start = url.searchParams.get('start_date') || '2026-01-01';
        const end = url.searchParams.get('end_date') || '2026-01-31';
        return jsonResponse({ weeks: getWeeklyRanges(start, end) }, { mode: 'live', origin, allowed });
      }

      const mode = url.searchParams.get('mode') || 'live';
      const startDate = url.searchParams.get('start_date') || '2026-01-01';
      const endDate = url.searchParams.get('end_date') || '2026-01-31';
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
          summary: { total_rows: SYNTHETIC_TOTAL, provenance: 'synthetic' },
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
              note: 'Virtual address space — rows materialized on demand',
            },
            { mode: 'synthetic', origin, allowed }
          );
        }
        if (url.pathname === '/v1/stats') {
          return jsonResponse(
            { live_rows: 0, archive_rows: 0, virtual_rows: SYNTHETIC_TOTAL, provenance: 'synthetic' },
            { mode: 'synthetic', origin, allowed }
          );
        }
        return jsonResponse(payload, { mode: 'synthetic', origin, allowed });
      }

      // live dual-D1 path with fixture fallback
      let live: TripRow[] = [];
      let archive: TripRow[] = [];
      let liveMs = 0;
      let archMs = 0;
      let provenance: 'live' | 'cached' = 'live';

      try {
        const t0 = performance.now();
        live = await queryTrips(env.DB_LIVE, startDate, endDate);
        liveMs = performance.now() - t0;
        const t1 = performance.now();
        archive = await queryTrips(env.DB_ARCHIVE, startDate, endDate);
        archMs = performance.now() - t1;
        if (live.length === 0 && archive.length === 0) {
          throw new Error('empty');
        }
      } catch {
        provenance = 'cached';
        live = FIXTURE_ROWS.filter((r) => r._source === 'live');
        archive = FIXTURE_ROWS.filter((r) => r._source === 'archive');
        liveMs = 0.1;
        archMs = 0.1;
      }

      const merged = mergeSources(live, archive);
      const page = sliceRows(merged.rows, start, length);

      if (url.pathname === '/v1/trace') {
        return jsonResponse(
          {
            mode: provenance,
            live: { rows: live.length, ms: Math.round(liveMs * 1000) / 1000 },
            archive: { rows: archive.length, ms: Math.round(archMs * 1000) / 1000 },
            merged: merged.merged,
            deduped: merged.deduped,
            dropped: merged.dropped,
            sliced: page.length,
            total_ms: Math.round((liveMs + archMs) * 1000) / 1000,
          },
          { mode: provenance, origin, allowed }
        );
      }

      if (url.pathname === '/v1/stats') {
        return jsonResponse(
          {
            live_rows: live.length,
            archive_rows: archive.length,
            merged: merged.deduped,
            provenance,
          },
          { mode: provenance, origin, allowed }
        );
      }

      if (url.pathname === '/v1/rows') {
        return jsonResponse(
          { rows: page, count: merged.deduped },
          { mode: provenance, origin, allowed }
        );
      }

      if (url.pathname === '/v1/data') {
        return jsonResponse(
          {
            draw,
            recordsTotal: merged.deduped,
            recordsFiltered: merged.deduped,
            data: page,
            summary: {
              total_rows: merged.deduped,
              dropped_duplicates: merged.dropped,
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
      await env.DB_LIVE.prepare(
        `INSERT INTO report_stats (key, value, updated_at) VALUES ('live_rows', ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      )
        .bind(liveCount?.c || 0)
        .run();
    } catch {
      // ignore cron failures on empty DBs
    }
  },
};
