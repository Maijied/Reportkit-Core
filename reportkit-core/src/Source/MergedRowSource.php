<?php

namespace ReportKit\Core\Source;

use ReportKit\Core\Contracts\RowSource;
use ReportKit\Core\Table\PseudoPaginator;

/**
 * Merge N RowSources: fetch → concat → dedupe → sort.
 *
 * First source wins on dedupe collisions (typically live over archive).
 */
class MergedRowSource implements RowSource
{
    /** @var RowSource[] */
    private $sources;

    /** @var string|null */
    private $dedupeKey;

    /** @var string|null */
    private $orderBy;

    /** @var string */
    private $direction;

    /** @var PseudoPaginator */
    private $paginator;

    /** @var array */
    private $lastTrace = array();

    /**
     * @param RowSource[] $sources
     * @param string|null $dedupeKey
     * @param string|null $orderBy
     * @param string $direction
     * @param PseudoPaginator|null $paginator
     */
    public function __construct(
        array $sources,
        $dedupeKey = null,
        $orderBy = null,
        $direction = 'asc',
        $paginator = null
    ) {
        $this->sources = array_values($sources);
        $this->dedupeKey = $dedupeKey !== null && $dedupeKey !== '' ? (string) $dedupeKey : null;
        $this->orderBy = $orderBy !== null && $orderBy !== '' ? (string) $orderBy : null;
        $this->direction = strtolower((string) $direction) === 'desc' ? 'desc' : 'asc';
        $this->paginator = $paginator instanceof PseudoPaginator ? $paginator : new PseudoPaginator();
    }

    /**
     * @param string $key
     * @return $this
     */
    public function dedupeBy($key)
    {
        $this->dedupeKey = (string) $key;

        return $this;
    }

    /**
     * @param string $column
     * @param string $direction
     * @return $this
     */
    public function orderBy($column, $direction = 'asc')
    {
        $this->orderBy = (string) $column;
        $this->direction = strtolower((string) $direction) === 'desc' ? 'desc' : 'asc';

        return $this;
    }

    /**
     * @param array $filters
     * @return array
     */
    public function getWeeks(array $filters)
    {
        $all = array();
        $seen = array();

        foreach ($this->sources as $source) {
            if (!$source instanceof RowSource) {
                continue;
            }

            foreach ($source->getWeeks($filters) as $week) {
                $week = (array) $week;
                $k = (isset($week['start']) ? $week['start'] : '') . '|' . (isset($week['end']) ? $week['end'] : '');

                if (isset($seen[$k])) {
                    continue;
                }

                $seen[$k] = true;
                $all[] = $week;
            }
        }

        return $all;
    }

    /**
     * @param array $filters
     * @return array
     */
    public function getRows(array $filters)
    {
        $merged = array();
        $sourceStats = array();
        $t0 = microtime(true);

        foreach ($this->sources as $i => $source) {
            if (!$source instanceof RowSource) {
                continue;
            }

            $ts = microtime(true);
            $rows = $source->getRows($filters);
            $ms = (microtime(true) - $ts) * 1000;
            $count = is_array($rows) ? count($rows) : 0;
            $sourceStats[] = array(
                'index' => $i,
                'rows' => $count,
                'ms' => round($ms, 3),
            );

            if (!is_array($rows)) {
                continue;
            }

            foreach ($rows as $row) {
                $merged[] = (array) $row;
            }
        }

        $beforeDedupe = count($merged);

        if ($this->dedupeKey !== null) {
            $merged = $this->paginator->dedupeByKey($merged, $this->dedupeKey);
        }

        $afterDedupe = count($merged);

        if ($this->orderBy !== null) {
            $merged = $this->paginator->sortBy($merged, $this->orderBy, $this->direction);
        }

        $this->lastTrace = array(
            'sources' => $sourceStats,
            'merged' => $beforeDedupe,
            'deduped' => $afterDedupe,
            'dropped' => max(0, $beforeDedupe - $afterDedupe),
            'order_by' => $this->orderBy,
            'direction' => $this->direction,
            'dedupe_key' => $this->dedupeKey,
            'total_ms' => round((microtime(true) - $t0) * 1000, 3),
        );

        return $merged;
    }

    /**
     * @param array $rows
     * @return array
     */
    public function getSummary(array $rows)
    {
        $summary = array('total_rows' => count($rows));

        foreach ($this->sources as $source) {
            if ($source instanceof RowSource && method_exists($source, 'getSummary')) {
                $part = $source->getSummary($rows);

                if (is_array($part)) {
                    $summary = array_merge($summary, $part);
                }

                break;
            }
        }

        return $summary;
    }

    /**
     * Last getRows() stage timings (for demos / debugging).
     *
     * @return array
     */
    public function getTrace()
    {
        return $this->lastTrace;
    }
}
