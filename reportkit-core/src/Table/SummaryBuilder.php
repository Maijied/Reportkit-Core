<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * SummaryBuilder — Single-pass KPI aggregates for ledger-style prepared rows.
 */

namespace ReportKit\Core\Table;

/**
 * Single-pass KPI aggregates for ledger-style prepared rows.
 */
class SummaryBuilder
{
    /**
     * @param array $rows
     * @param array $options creditKey, debitKey, balanceKey
     * @return array
     */
    public function build(array $rows, array $options = array())
    {
        $creditKey = isset($options['creditKey']) ? $options['creditKey'] : 'credit_amount';
        $debitKey = isset($options['debitKey']) ? $options['debitKey'] : 'debit_amount';

        $credit = 0.0;
        $debit = 0.0;

        foreach ($rows as $row) {
            $row = (array) $row;
            $credit += $this->toFloat(isset($row[$creditKey]) ? $row[$creditKey] : 0);
            $debit += $this->toFloat(isset($row[$debitKey]) ? $row[$debitKey] : 0);
        }

        $balance = $credit - $debit;
        $warning = 'ok';

        if ($balance < 0) {
            $warning = 'warn';
        }

        return array(
            'current_balance' => $this->formatMoney($balance),
            'total_credit' => $this->formatMoney($credit),
            'total_debit' => $this->formatMoney($debit),
            'warning_level' => $warning,
            'row_count' => count($rows),
        );
    }

    /**
     * @param mixed $value
     * @return float
     */
    protected function toFloat($value)
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        $normalized = preg_replace('/[^0-9.\-]/', '', (string) $value);

        return is_numeric($normalized) ? (float) $normalized : 0.0;
    }

    /**
     * @param float $value
     * @return string
     */
    protected function formatMoney($value)
    {
        return number_format((float) $value, 2, '.', ',');
    }
}
