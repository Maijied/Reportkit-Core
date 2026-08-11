import { describe, expect, it } from 'vitest';
import {
  browsePreparedRows,
  buildSummary,
  ledgerRowsForRange,
  syntheticLedgerRow,
} from '../src/ledger';

describe('ledger browse (hybrid-browse demo)', () => {
  it('builds summary from prepared rows', () => {
    const rows = [syntheticLedgerRow(1), syntheticLedgerRow(2)];
    const summary = buildSummary(rows);
    expect(summary.row_count).toBe(2);
    expect(summary.warning_level).toBeDefined();
  });

  it('browse returns zero sql meta and pages rows', () => {
    const prepared = ledgerRowsForRange('2012-01-01', '2012-03-01', 50);
    const payload = browsePreparedRows(
      { draw: 1, start: 0, length: 10, search: { value: '' } },
      prepared,
      ['transaction_date', 'transaction_type', 'pnr', 'credit_amount', 'debit_amount', 'balance']
    );
    expect(payload.meta.sql_queries).toBe(0);
    expect(payload.data.length).toBeLessThanOrEqual(10);
    expect(payload.summary.total_credit).toBeDefined();
  });

  it('caps length -1 at page limit max', () => {
    const prepared = ledgerRowsForRange('2012-01-01', '2012-06-01', 200);
    const payload = browsePreparedRows(
      { draw: 1, start: 0, length: -1 },
      prepared,
      ['transaction_date']
    );
    expect(payload.data.length).toBeLessThanOrEqual(200);
  });
});
