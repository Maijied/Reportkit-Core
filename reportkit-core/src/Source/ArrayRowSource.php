<?php

namespace ReportKit\Core\Source;

use ReportKit\Core\Contracts\RowSource;
use ReportKit\Core\Date\DateRangeChunker;

/**
 * In-memory RowSource for tests and fixtures.
 */
class ArrayRowSource implements RowSource
{
    /** @var array */
    private $rows;

    /** @var callable|null */
    private $summaryFn;

    /** @var DateRangeChunker */
    private $chunker;

    /**
     * @param array $rows
     * @param callable|null $summaryFn
     * @param DateRangeChunker|null $chunker
     */
    public function __construct(array $rows = array(), $summaryFn = null, $chunker = null)
    {
        $this->rows = $rows;
        $this->summaryFn = is_callable($summaryFn) ? $summaryFn : null;
        $this->chunker = $chunker instanceof DateRangeChunker ? $chunker : new DateRangeChunker();
    }

    /**
     * @param array $filters
     * @return array
     */
    public function getWeeks(array $filters)
    {
        $start = isset($filters['start_date']) ? $filters['start_date'] : null;
        $end = isset($filters['end_date']) ? $filters['end_date'] : null;

        if (!$start || !$end) {
            return array();
        }

        return $this->chunker->getWeeklyRanges($start, $end);
    }

    /**
     * @param array $filters
     * @return array
     */
    public function getRows(array $filters)
    {
        $rows = $this->rows;
        $weekStart = isset($filters['week_start']) ? $filters['week_start'] : null;
        $weekEnd = isset($filters['week_end']) ? $filters['week_end'] : null;
        $start = isset($filters['start_date']) ? $filters['start_date'] : null;
        $end = isset($filters['end_date']) ? $filters['end_date'] : null;
        $dateKey = isset($filters['date_key']) ? $filters['date_key'] : 'booked_at';

        if ($weekStart && $weekEnd) {
            $start = $weekStart;
            $end = $weekEnd;
        }

        if (!$start || !$end) {
            return array_values($rows);
        }

        $out = array();

        foreach ($rows as $row) {
            $row = (array) $row;
            $d = isset($row[$dateKey]) ? $row[$dateKey] : null;

            if ($d === null || ($d >= $start && $d <= $end)) {
                $out[] = $row;
            }
        }

        return $out;
    }

    /**
     * @param array $rows
     * @return array
     */
    public function getSummary(array $rows)
    {
        if ($this->summaryFn) {
            return call_user_func($this->summaryFn, $rows);
        }

        return array('total_rows' => count($rows));
    }
}
