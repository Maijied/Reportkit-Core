import { sortBy, sliceRows, getWeeklyRanges } from './merge';

export type LedgerRow = {
  entry_id: string;
  transaction_date: string;
  transaction_type: string;
  pnr: string;
  credit_amount: string;
  debit_amount: string;
  balance: string;
  comments: string;
};

export const SYNTHETIC_LEDGER_TOTAL = 50_000_000;
const TXN_TYPES = ['recharge', 'ticket_sell', 'ticket_cancel', 'adjustment'];
const PAGE_LIMIT_MAX = 10_000;

/** Deterministic fictional ledger row — no real client data. */
export function syntheticLedgerRow(index: number): LedgerRow {
  let x = (index + 7) * 2246822519 >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const dayOffset = x % 5000;
  const d = new Date(Date.UTC(2012, 0, 1) + dayOffset * 86400000);
  const type = TXN_TYPES[x % TXN_TYPES.length];
  const credit = type === 'recharge' || type === 'ticket_cancel' ? (500 + (x % 200)).toFixed(2) : '0.00';
  const debit = type === 'ticket_sell' || type === 'adjustment' ? (300 + (x % 150)).toFixed(2) : '0.00';
  const bal = (10000 + (index % 5000) * 0.5).toFixed(2);
  return {
    entry_id: `LED-${index.toString(16).padStart(8, '0')}`,
    transaction_date: d.toISOString().slice(0, 10),
    transaction_type: type,
    pnr: `PNR-${(x % 999999).toString().padStart(6, '0')}`,
    credit_amount: credit,
    debit_amount: debit,
    balance: bal,
    comments: 'Synthetic demo entry',
  };
}

/** Rows whose transaction_date falls in [start, end] — capped for demo prepare. */
export function ledgerRowsForRange(start: string, end: string, cap = 400): LedgerRow[] {
  const out: LedgerRow[] = [];
  const startMs = Date.parse(start + 'T00:00:00Z');
  const endMs = Date.parse(end + 'T00:00:00Z');
  for (let i = 0; i < SYNTHETIC_LEDGER_TOTAL && out.length < cap; i += 97) {
    const row = syntheticLedgerRow(i);
    const ts = Date.parse(row.transaction_date + 'T00:00:00Z');
    if (ts >= startMs && ts <= endMs) {
      out.push(row);
    }
  }
  return out;
}

export function tripsToLedgerRows(
  trips: { trip_id: string; booked_at: string; fare_cents: number; status: string }[]
): LedgerRow[] {
  let balance = 10000;
  return trips.map((trip, i) => {
    const isCancel = trip.status === 'cancelled';
    const type = isCancel ? 'ticket_cancel' : 'ticket_sell';
    const amount = (trip.fare_cents / 100).toFixed(2);
    const credit = isCancel ? amount : '0.00';
    const debit = isCancel ? '0.00' : amount;
    balance += parseFloat(credit) - parseFloat(debit);
    return {
      entry_id: `LED-L-${i + 1}`,
      transaction_date: trip.booked_at,
      transaction_type: type,
      pnr: trip.trip_id.replace(/^DMY-/, 'PNR-'),
      credit_amount: credit,
      debit_amount: debit,
      balance: balance.toFixed(2),
      comments: 'Converted from dummy trip row',
    };
  });
}

export function searchBy<T extends Record<string, unknown>>(
  rows: T[],
  term: string,
  columns: string[]
): T[] {
  const needle = term.trim().toLowerCase();
  if (!needle || !columns.length) return rows;
  return rows.filter((row) => {
    let hay = '';
    for (const col of columns) {
      if (row[col] != null) hay += ' ' + row[col];
    }
    return hay.toLowerCase().includes(needle);
  });
}

export function buildSummary(rows: LedgerRow[]) {
  let credit = 0;
  let debit = 0;
  for (const row of rows) {
    credit += parseFloat(row.credit_amount) || 0;
    debit += parseFloat(row.debit_amount) || 0;
  }
  const balance = credit - debit;
  return {
    current_balance: balance.toFixed(2),
    total_credit: credit.toFixed(2),
    total_debit: debit.toFixed(2),
    warning_level: balance < 0 ? 'warn' : 'ok',
    row_count: rows.length,
  };
}

export type BrowseRequest = {
  draw?: number;
  start?: number;
  length?: number;
  search?: { value?: string } | string;
  order?: { column?: number; dir?: string }[];
};

export function browsePreparedRows(
  request: BrowseRequest,
  rows: LedgerRow[],
  columnKeys: string[],
  pageLimitMax = PAGE_LIMIT_MAX
) {
  let working = rows.slice();
  const search =
    typeof request.search === 'string'
      ? request.search
      : request.search?.value || '';

  if (search && columnKeys.length) {
    working = searchBy(working, search, columnKeys);
  }

  if (request.order?.[0] && columnKeys.length) {
    const colIndex = Number(request.order[0].column) || 0;
    const dir = request.order[0].dir === 'asc' ? 'asc' : 'desc';
    const key = columnKeys[colIndex];
    if (key) working = sortBy(working, key, dir);
  }

  const filtered = working.length;
  const start = Number(request.start) || 0;
  let length = typeof request.length === 'number' ? request.length : 25;
  if (length < 0) length = pageLimitMax;
  if (length > pageLimitMax) length = pageLimitMax;

  const page = sliceRows(working, start, length);
  const summary = buildSummary(working);

  return {
    draw: Number(request.draw) || 0,
    recordsTotal: rows.length,
    recordsFiltered: filtered,
    data: page,
    summary,
    meta: { sql_queries: 0, source: 'prepared_json' },
  };
}

export { getWeeklyRanges, PAGE_LIMIT_MAX };
