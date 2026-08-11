<?php

namespace App\Repositories\Reports;

/**
 * Fictional demo data from SQLite — no production identifiers.
 */
class OperatorExportReportRepository
{
    public function fetchRows(array $filters)
    {
        $start = isset($filters['start_date']) ? $filters['start_date'] : '2026-01-01';
        $end = isset($filters['end_date']) ? $filters['end_date'] : '2026-01-31';
        $week = isset($filters['week']) ? $filters['week'] : null;

        if ($week && strpos($week, '_') !== false) {
            list($start, $end) = explode('_', $week, 2);
        }

        $dbPath = database_path('demo.sqlite');
        if (!file_exists($dbPath)) {
            return $this->fallbackRows();
        }

        $pdo = new \PDO('sqlite:'.$dbPath);
        $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $stmt = $pdo->prepare(
            'SELECT id AS record_id, record_date, category, amount, status, operator_code
             FROM demo_records
             WHERE record_date >= :start AND record_date <= :end
             ORDER BY record_date ASC'
        );
        $stmt->execute(array('start' => $start, 'end' => $end));
        $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return array_map(function ($row) {
            return array(
                'record_id' => (int) $row['record_id'],
                'record_date' => $row['record_date'],
                'category' => $row['category'],
                'amount' => (float) $row['amount'],
                'status' => $row['status'],
                'operator_code' => $row['operator_code'],
            );
        }, $rows ?: array());
    }

    public function summarize(array $rows)
    {
        $total = 0;
        foreach ($rows as $row) {
            $total += isset($row['amount']) ? (float) $row['amount'] : 0;
        }

        return array(
            'row_count' => count($rows),
            'total_amount' => round($total, 2),
            'ticket_count' => count($rows),
            'pnr_count' => count($rows),
        );
    }

    protected function fallbackRows()
    {
        return array(
            array('record_id' => 1, 'record_date' => '2026-01-02', 'category' => 'recharge', 'amount' => 1500.0, 'status' => 'posted', 'operator_code' => 'NORTHSTAR'),
            array('record_id' => 2, 'record_date' => '2026-01-03', 'category' => 'ticket_sell', 'amount' => 420.5, 'status' => 'posted', 'operator_code' => 'NORTHSTAR'),
        );
    }
}
