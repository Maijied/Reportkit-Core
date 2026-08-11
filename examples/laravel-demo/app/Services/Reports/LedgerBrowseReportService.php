<?php

namespace App\Services\Reports;

use App\Repositories\Reports\LedgerBrowseReportRepository;
use ReportKit\Core\Date\DateRangeChunker;
use ReportKit\Core\Contracts\RowSource;

class LedgerBrowseReportService implements RowSource
{
    private $repository;
    private $chunker;

    public function __construct($repository = null, $chunker = null)
    {
        $this->repository = $repository instanceof LedgerBrowseReportRepository
            ? $repository
            : new LedgerBrowseReportRepository();
        $this->chunker = $chunker instanceof DateRangeChunker
            ? $chunker
            : new DateRangeChunker();
    }

    public function getWeeks(array $filters)
    {
        $start = isset($filters['start_date']) ? $filters['start_date'] : null;
        $end = isset($filters['end_date']) ? $filters['end_date'] : null;

        return $this->chunker->getWeeklyRanges($start, $end);
    }

    public function getRows(array $filters)
    {
        return $this->repository->fetchRows($filters);
    }

    public function getSummary(array $rows)
    {
        return $this->repository->summarize($rows);
    }
}
