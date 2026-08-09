<?php

namespace ReportKit\Core\Table;

/**
 * Slice a full in-memory row set for DataTables (pseudo server-side).
 *
 * Useful when live+archive rows are merged in PHP before paging.
 */
class PseudoPaginator
{
    /**
     * @param array $rows
     * @param int $start
     * @param int $length -1 means all remaining
     * @return array
     */
    public function slice(array $rows, $start, $length)
    {
        $start = max(0, (int) $start);
        $length = (int) $length;

        if ($length < 0) {
            return array_slice($rows, $start);
        }

        return array_slice($rows, $start, $length);
    }

    /**
     * Dedupe by key keeping first occurrence.
     *
     * @param array $rows
     * @param string $key
     * @return array
     */
    public function dedupeByKey(array $rows, $key)
    {
        $unique = [];

        foreach ($rows as $row) {
            $row = (array) $row;

            if (!isset($row[$key])) {
                $unique[] = $row;
                continue;
            }

            $id = $row[$key];

            if (!isset($unique[$id])) {
                $unique[$id] = $row;
            }
        }

        return array_values($unique);
    }
}
