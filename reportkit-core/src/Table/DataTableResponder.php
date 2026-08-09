<?php

namespace ReportKit\Core\Table;

/**
 * Build a DataTables serverSide JSON payload.
 */
class DataTableResponder
{
    /**
     * @param array $request typically Input::all() / $_GET
     * @param array $rows already-sliced page rows (list of assoc arrays)
     * @param int $recordsTotal
     * @param int|null $recordsFiltered
     * @param array $summary optional KPI / footer payload
     * @return array
     */
    public function respond(array $request, array $rows, $recordsTotal, $recordsFiltered = null, array $summary = [])
    {
        $draw = isset($request['draw']) ? (int) $request['draw'] : 0;

        if ($recordsFiltered === null) {
            $recordsFiltered = $recordsTotal;
        }

        $payload = [
            'draw' => $draw,
            'recordsTotal' => (int) $recordsTotal,
            'recordsFiltered' => (int) $recordsFiltered,
            'data' => array_values($rows),
        ];

        if (!empty($summary)) {
            $payload['summary'] = $summary;
        }

        return $payload;
    }
}
