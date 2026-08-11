<?php

/**
 * Fictional operator export — hybrid-export preset (LLDP).
 */
use ReportKit\Core\Report\Report;
use ReportKit\Core\Table\Column;
use ReportKit\Core\Table\ReportTable;

Report::define('operator-export', function ($r) {
    $r->title('Operator Export (Demo)')
        ->kicker('LLDP DEMO')
        ->subtitle('Fictional SQLite fixtures — hybrid-export preset')
        ->route('admin/operator-export')
        ->service('App\\Services\\Reports\\OperatorExportReportService')
        ->flags(array(
            'datatables' => false,
            'sync' => false,
            'async_prepare' => true,
            'browse_prepared' => false,
            'kpi' => true,
            'ledger' => false,
            'excel' => true,
            'csv' => true,
            'pdf' => true,
            'email' => true,
            'print' => false,
            'howto' => true,
            'activity_log' => true,
        ))
        ->table(
            ReportTable::make('main')
                ->title('Results')
                ->pageLength(25)
                ->columns(array(
                    Column::make('record_id', 'ID')->sortable(),
                    Column::make('record_date', 'Date')->sortable(),
                    Column::make('category', 'Category'),
                    Column::make('amount', 'Amount')->sortable(),
                    Column::make('status', 'Status'),
                    Column::make('operator_code', 'Operator'),
                ))
        );
});
