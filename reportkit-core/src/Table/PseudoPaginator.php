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
     * Dedupe by key keeping first occurrence. Stable list order.
     *
     * @param array $rows
     * @param string $key
     * @return array
     */
    public function dedupeByKey(array $rows, $key)
    {
        $seen = array();
        $unique = array();

        foreach ($rows as $row) {
            $row = (array) $row;

            if (!array_key_exists($key, $row) || $row[$key] === null || $row[$key] === '') {
                $unique[] = $row;
                continue;
            }

            $id = (string) $row[$key];

            if (isset($seen[$id])) {
                continue;
            }

            $seen[$id] = true;
            $unique[] = $row;
        }

        return $unique;
    }

    /**
     * Stable sort by column. Direction: asc|desc.
     *
     * @param array $rows
     * @param string $key
     * @param string $direction
     * @return array
     */
    public function sortBy(array $rows, $key, $direction = 'asc')
    {
        $dir = strtolower((string) $direction) === 'desc' ? -1 : 1;
        $indexed = array();

        foreach ($rows as $i => $row) {
            $indexed[] = array('i' => $i, 'row' => (array) $row);
        }

        usort($indexed, function ($a, $b) use ($key, $dir) {
            $av = isset($a['row'][$key]) ? $a['row'][$key] : null;
            $bv = isset($b['row'][$key]) ? $b['row'][$key] : null;

            if ($av === $bv) {
                return $a['i'] - $b['i'];
            }

            if ($av === null) {
                return -1 * $dir;
            }

            if ($bv === null) {
                return 1 * $dir;
            }

            if (is_numeric($av) && is_numeric($bv)) {
                if ((float) $av == (float) $bv) {
                    return $a['i'] - $b['i'];
                }

                return ((float) $av < (float) $bv ? -1 : 1) * $dir;
            }

            $cmp = strcmp((string) $av, (string) $bv);

            if ($cmp === 0) {
                return $a['i'] - $b['i'];
            }

            return ($cmp < 0 ? -1 : 1) * $dir;
        });

        $out = array();

        foreach ($indexed as $item) {
            $out[] = $item['row'];
        }

        return $out;
    }

    /**
     * Case-insensitive substring search across columns.
     *
     * @param array $rows
     * @param string $term
     * @param array $columns
     * @return array
     */
    public function searchBy(array $rows, $term, array $columns)
    {
        $term = trim((string) $term);

        if ($term === '' || empty($columns)) {
            return $rows;
        }

        $needle = function_exists('mb_strtolower')
            ? mb_strtolower($term, 'UTF-8')
            : strtolower($term);
        $out = array();

        foreach ($rows as $row) {
            $row = (array) $row;
            $hay = '';

            foreach ($columns as $col) {
                if (isset($row[$col])) {
                    $hay .= ' ' . $row[$col];
                }
            }

            $hay = function_exists('mb_strtolower')
                ? mb_strtolower($hay, 'UTF-8')
                : strtolower($hay);

            if (strpos($hay, $needle) !== false) {
                $out[] = $row;
            }
        }

        return $out;
    }
}
