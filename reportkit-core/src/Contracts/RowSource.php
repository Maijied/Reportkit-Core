<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * RowSource — ReportKit contract interface.
 */

namespace ReportKit\Core\Contracts;

/**
 * App-owned data source for a report (SQL lives in the host app).
 */
interface RowSource
{
    /**
     * @param array $filters
     * @return array list of week maps ['start'=>Y-m-d,'end'=>Y-m-d] when async_prepare
     */
    public function getWeeks(array $filters);

    /**
     * @param array $filters may include week_start / week_end
     * @return array list of associative rows
     */
    public function getRows(array $filters);

    /**
     * @param array $rows
     * @return array KPI / summary map
     */
    public function getSummary(array $rows);
}
