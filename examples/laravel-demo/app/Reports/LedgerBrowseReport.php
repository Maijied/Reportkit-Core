<?php

/**
 * Fictional ledger browse — hybrid-browse preset (prepare once, page without SQL).
 */
use ReportKit\Core\Report\Report;
use ReportKit\Core\Table\Column;
use ReportKit\Core\Table\ReportTable;

Report::define('ledger-browse', function ($r) {
    $r->title('Ledger Browse (Demo)')
        ->kicker('LEDGER')
        ->subtitle('Hybrid browse — prepare once, page from JSON without re-query.')
        ->route('admin/ledger-browse')
        ->service('App\\Services\\Reports\\LedgerBrowseReportService')
        ->flags(array(
            'datatables' => true,
            'sync' => false,
            'async_prepare' => true,
            'browse_prepared' => true,
            'kpi' => true,
            'ledger' => true,
            'excel' => true,
            'csv' => true,
            'pdf' => true,
            'email' => false,
            'print' => false,
            'howto' => true,
            'activity_log' => true,
        ))
        ->table(
            ReportTable::make('main')
                ->title('Ledger')
                ->serverSide()
                ->pageLength(25)
                ->columns(array(
                    Column::make('transaction_date', 'Date')->sortable(),
                    Column::make('transaction_type', 'Type'),
                    Column::make('pnr', 'PNR'),
                    Column::make('credit_amount', 'Credit')->sortable(),
                    Column::make('debit_amount', 'Debit')->sortable(),
                    Column::make('balance', 'Balance')->sortable(),
                ))
        );
});
