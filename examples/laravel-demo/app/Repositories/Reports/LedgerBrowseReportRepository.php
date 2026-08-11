<?php

namespace App\Repositories\Reports;

/**
 * Maps fictional demo_records into ledger-shaped rows with running balance.
 */
class LedgerBrowseReportRepository
{
    public function fetchRows(array $filters)
    {
        $raw = $this->fetchDemoRecords($filters);

        return $this->mapToLedgerRows($raw);
    }

    public function summarize(array $rows)
    {
        $credit = 0;
        $debit = 0;
        $balance = 0;

        foreach ($rows as $row) {
            $credit += isset($row['credit_amount']) ? (float) $row['credit_amount'] : 0;
            $debit += isset($row['debit_amount']) ? (float) $row['debit_amount'] : 0;
            if (isset($row['balance'])) {
                $balance = (float) $row['balance'];
            }
        }

        return array(
            'row_count' => count($rows),
            'total_credit' => round($credit, 2),
            'total_debit' => round($debit, 2),
            'current_balance' => round($balance, 2),
            'ticket_count' => count($rows),
            'pnr_count' => count($rows),
        );
    }

    protected function fetchDemoRecords(array $filters)
    {
        $start = isset($filters['start_date']) ? $filters['start_date'] : '2026-01-01';
        $end = isset($filters['end_date']) ? $filters['end_date'] : '2026-01-31';
        $week = isset($filters['week']) ? $filters['week'] : null;

        if ($week && strpos($week, '_') !== false) {
            list($start, $end) = explode('_', $week, 2);
        }

        $dbPath = database_path('demo.sqlite');
        if (!file_exists($dbPath)) {
            return $this->fallbackRawRows();
        }

        $pdo = new \PDO('sqlite:'.$dbPath);
        $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $stmt = $pdo->prepare(
            'SELECT id AS record_id, record_date, category, amount, status, operator_code
             FROM demo_records
             WHERE record_date >= :start AND record_date <= :end
             ORDER BY record_date ASC, id ASC'
        );
        $stmt->execute(array('start' => $start, 'end' => $end));

        return $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: array();
    }

    protected function mapToLedgerRows(array $raw)
    {
        $rows = array();
        $balance = 0.0;

        foreach ($raw as $row) {
            $amount = isset($row['amount']) ? (float) $row['amount'] : 0.0;
            $category = isset($row['category']) ? $row['category'] : 'unknown';
            $credit = 0.0;
            $debit = 0.0;

            if (in_array($category, array('recharge', 'ticket_sell'), true)) {
                $credit = $amount;
                $balance += $amount;
            } elseif ($category === 'balance_reset') {
                $balance = 0.0;
            } else {
                $debit = $amount;
                $balance -= $amount;
            }

            $rows[] = array(
                'transaction_date' => $row['record_date'],
                'transaction_type' => $category,
                'pnr' => 'PNR-DEMO-'.str_pad((string) $row['record_id'], 4, '0', STR_PAD_LEFT),
                'credit_amount' => $credit > 0 ? number_format($credit, 2, '.', '') : '',
                'debit_amount' => $debit > 0 ? number_format($debit, 2, '.', '') : '',
                'balance' => number_format($balance, 2, '.', ''),
            );
        }

        return $rows;
    }

    protected function fallbackRawRows()
    {
        return array(
            array('record_id' => 1, 'record_date' => '2026-01-02', 'category' => 'recharge', 'amount' => 1500.0),
            array('record_id' => 2, 'record_date' => '2026-01-03', 'category' => 'ticket_sell', 'amount' => 420.5),
            array('record_id' => 3, 'record_date' => '2026-01-04', 'category' => 'ticket_cancel', 'amount' => 80.0),
        );
    }
}
