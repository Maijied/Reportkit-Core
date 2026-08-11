<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * DateRangeChunker — Framework-agnostic date validation and week chunking for prepare-once reports.
 */

namespace ReportKit\Core\Date;

/**
 * Framework-agnostic date validation and week chunking for prepare-once reports.
 *
 * PHP >= 5.6 — uses DateTime only (no Carbon / Laravel).
 */
class DateRangeChunker
{
    const DEFAULT_MAX_MONTHS = 6;

    /**
     * @param mixed $date
     * @return bool
     */
    public function isValidYmdDate($date)
    {
        if (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return false;
        }

        $dt = \DateTime::createFromFormat('Y-m-d', $date);

        return $dt && $dt->format('Y-m-d') === $date;
    }

    /**
     * @param string $startDate
     * @param string $endDate
     * @param int $maxMonths
     * @return string|null error message or null when valid
     */
    public function validateDateRange($startDate, $endDate, $maxMonths = self::DEFAULT_MAX_MONTHS)
    {
        if (!$this->isValidYmdDate($startDate) || !$this->isValidYmdDate($endDate)) {
            return 'Dates must be valid and in Y-m-d format.';
        }

        if ($startDate > $endDate) {
            return 'Start Date must be earlier than or equal to End Date.';
        }

        $maxMonths = (int) $maxMonths;

        if ($maxMonths < 1) {
            return 'Invalid maximum month range configuration.';
        }

        $start = new \DateTime($startDate);
        $maxEnd = clone $start;
        $maxEnd->modify('+' . $maxMonths . ' months');
        $maxEndDate = $maxEnd->format('Y-m-d');

        if ($endDate > $maxEndDate) {
            return 'Date range cannot exceed ' . $maxMonths . ' months from the start date.';
        }

        return null;
    }

    /**
     * Split inclusive Y-m-d range into 7-day chunks (last chunk may be shorter).
     *
     * @param string $startDate
     * @param string $endDate
     * @return array list of ['start' => Y-m-d, 'end' => Y-m-d]
     */
    public function getWeeklyRanges($startDate, $endDate)
    {
        $weeklyRanges = [];
        $current = new \DateTime($startDate);
        $rangeEnd = new \DateTime($endDate);

        while ($current <= $rangeEnd) {
            $weekStart = clone $current;
            $weekEnd = clone $current;
            $weekEnd->modify('+6 days');

            if ($weekEnd > $rangeEnd) {
                $weekEnd = clone $rangeEnd;
            }

            $weeklyRanges[] = [
                'start' => $weekStart->format('Y-m-d'),
                'end' => $weekEnd->format('Y-m-d'),
            ];
            $current->modify('+7 days');
        }

        return $weeklyRanges;
    }

    /**
     * @param string $startDate
     * @param string $endDate
     * @param string|null $weekStart
     * @param string|null $weekEnd
     * @return string|null
     */
    public function validateWeekWithinRange($startDate, $endDate, $weekStart, $weekEnd)
    {
        $hasWeekStart = !empty($weekStart);
        $hasWeekEnd = !empty($weekEnd);

        if (!$hasWeekStart && !$hasWeekEnd) {
            return null;
        }

        if (!$hasWeekStart || !$hasWeekEnd) {
            return 'Both Week Start and Week End are required.';
        }

        if (!$this->isValidYmdDate($weekStart) || !$this->isValidYmdDate($weekEnd)) {
            return 'Week dates must be valid and in Y-m-d format.';
        }

        if ($weekStart > $weekEnd) {
            return 'Week Start must be earlier than or equal to Week End.';
        }

        if ($weekStart < $startDate || $weekEnd > $endDate) {
            return 'Week range must be within the selected start and end dates.';
        }

        return null;
    }

    /**
     * @param string $startDate
     * @param string $endDate
     * @return int
     */
    public function getInclusiveDayCount($startDate, $endDate)
    {
        $start = new \DateTime($startDate);
        $end = new \DateTime($endDate);

        return (int) $start->diff($end)->days + 1;
    }
}
