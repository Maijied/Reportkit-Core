<?php

/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * HandlesReportBrowse — shared HTTP/controller behavior.
 */

namespace ReportKit\Core\Http;

use ReportKit\Core\Table\PreparedRowBrowse;

/**
 * Shared post-prepare browse handler for Laravel adapters (Phase K2).
 */
trait HandlesReportBrowse
{
    /**
     * @param array $request
     * @param array $rows
     * @param object $definition
     * @param int $pageLimitMax
     * @return array
     */
    protected function browsePreparedRows(array $request, array $rows, $definition, $pageLimitMax = 10000)
    {
        $browse = new PreparedRowBrowse();

        return $browse->respond($request, $rows, $this->browseColumnKeys($definition), $pageLimitMax);
    }

    /**
     * @param object $definition
     * @return array
     */
    protected function browseColumnKeys($definition)
    {
        $columns = array();

        if (!empty($definition->tables[0]) && is_object($definition->tables[0]) && !empty($definition->tables[0]->columns)) {
            foreach ($definition->tables[0]->columns as $col) {
                if (is_object($col) && isset($col->key)) {
                    $columns[] = $col->key;
                } elseif (is_array($col) && isset($col['key'])) {
                    $columns[] = $col['key'];
                }
            }
        }

        return $columns;
    }

    /**
     * @param string $slug
     * @return string
     */
    protected function preparedSessionKey($slug)
    {
        return 'reportkit_prepared_' . $slug;
    }
}
