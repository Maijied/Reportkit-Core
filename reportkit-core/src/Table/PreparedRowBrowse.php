<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * PreparedRowBrowse — Browse prepared rows with PseudoPaginator — zero domain SQL post-prepare.
 */

namespace ReportKit\Core\Table;

/**
 * Browse prepared rows with PseudoPaginator — zero domain SQL post-prepare.
 */
class PreparedRowBrowse
{
    /** @var PseudoPaginator */
    protected $paginator;

    /** @var DataTableResponder */
    protected $responder;

    /** @var SummaryBuilder */
    protected $summaryBuilder;

    public function __construct(
        PseudoPaginator $paginator = null,
        DataTableResponder $responder = null,
        SummaryBuilder $summaryBuilder = null
    ) {
        $this->paginator = $paginator ?: new PseudoPaginator();
        $this->responder = $responder ?: new DataTableResponder();
        $this->summaryBuilder = $summaryBuilder ?: new SummaryBuilder();
    }

    /**
     * @param array $request DataTables request params
     * @param array $rows Full prepared row set
     * @param array $searchColumns Column keys for global search
     * @param int $pageLimitMax Cap when length = -1
     * @param array $summaryOptions Passed to SummaryBuilder
     * @return array
     */
    public function respond(array $request, array $rows, array $searchColumns = array(), $pageLimitMax = 10000, array $summaryOptions = array())
    {
        $total = count($rows);
        $working = $rows;

        $search = '';

        if (isset($request['search']['value'])) {
            $search = $request['search']['value'];
        } elseif (isset($request['search']) && is_string($request['search'])) {
            $search = $request['search'];
        }

        if ($search !== '' && !empty($searchColumns)) {
            $working = $this->paginator->searchBy($working, $search, $searchColumns);
        }

        if (!empty($request['order'][0]) && is_array($request['order'][0]) && !empty($searchColumns)) {
            $colIndex = isset($request['order'][0]['column']) ? (int) $request['order'][0]['column'] : 0;
            $dir = isset($request['order'][0]['dir']) ? $request['order'][0]['dir'] : 'asc';

            if (isset($searchColumns[$colIndex])) {
                $working = $this->paginator->sortBy($working, $searchColumns[$colIndex], $dir);
            }
        }

        $filtered = count($working);
        $start = isset($request['start']) ? (int) $request['start'] : 0;
        $length = isset($request['length']) ? (int) $request['length'] : 25;

        if ($length < 0) {
            $length = (int) $pageLimitMax;
        }

        if ($length > (int) $pageLimitMax) {
            $length = (int) $pageLimitMax;
        }

        $page = $this->paginator->slice($working, $start, $length);
        $summary = $this->summaryBuilder->build($working, $summaryOptions);

        return $this->responder->respond($request, $page, $total, $filtered, $summary);
    }
}
