<?php

namespace ReportKit\Core\Filter;

use ReportKit\Core\Date\DateRangeChunker;

/**
 * Shared filter validation for report endpoints.
 */
class FilterValidator
{
    /** @var DateRangeChunker */
    private $dateRangeChunker;

    public function __construct($dateRangeChunker = null)
    {
        $this->dateRangeChunker = $dateRangeChunker instanceof DateRangeChunker
            ? $dateRangeChunker
            : new DateRangeChunker();
    }

    /**
     * @return DateRangeChunker
     */
    public function getDateRangeChunker()
    {
        return $this->dateRangeChunker;
    }

    /**
     * @param array $inputs
     * @param array $keys
     * @param string $message
     * @return string|null
     */
    public function requireKeys(array $inputs, array $keys, $message = 'Required filters are missing.')
    {
        foreach ($keys as $key) {
            if (!isset($inputs[$key]) || $inputs[$key] === '' || $inputs[$key] === null) {
                return $message;
            }
        }

        return null;
    }

    /**
     * @param mixed $value
     * @param array $allowed
     * @param string $message
     * @param bool $allowEmpty
     * @return string|null
     */
    public function requireEnum($value, array $allowed, $message, $allowEmpty = true)
    {
        if ($value === null || $value === '') {
            return $allowEmpty ? null : $message;
        }

        if (!in_array($value, $allowed, true)) {
            return $message;
        }

        return null;
    }

    /**
     * @param mixed $value
     * @param string $message
     * @return string|null
     */
    public function requirePositiveIntId($value, $message = 'Please select a valid company.')
    {
        if ($value === null || $value === '' || (int) $value < 1) {
            return $message;
        }

        return null;
    }

    /**
     * @param array $inputs
     * @param int $maxMonths
     * @param string $startKey
     * @param string $endKey
     * @param string $weekStartKey
     * @param string $weekEndKey
     * @return string|null
     */
    public function validateDateAndOptionalWeek(
        array $inputs,
        $maxMonths = DateRangeChunker::DEFAULT_MAX_MONTHS,
        $startKey = 'start_date',
        $endKey = 'end_date',
        $weekStartKey = 'week_start',
        $weekEndKey = 'week_end'
    ) {
        $start = isset($inputs[$startKey]) ? $inputs[$startKey] : null;
        $end = isset($inputs[$endKey]) ? $inputs[$endKey] : null;
        $rangeError = $this->dateRangeChunker->validateDateRange($start, $end, $maxMonths);

        if ($rangeError) {
            return $rangeError;
        }

        $weekStart = isset($inputs[$weekStartKey]) ? $inputs[$weekStartKey] : null;
        $weekEnd = isset($inputs[$weekEndKey]) ? $inputs[$weekEndKey] : null;

        return $this->dateRangeChunker->validateWeekWithinRange($start, $end, $weekStart, $weekEnd);
    }
}
