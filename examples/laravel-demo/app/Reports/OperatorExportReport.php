<?php

namespace App\Reports;

use ReportKit\Core\Report\ReportDefinition;

class OperatorExportReport extends ReportDefinition
{
    public function slug()
    {
        return 'operator-export';
    }

    public function title()
    {
        return 'Operator Export (Demo)';
    }

    public function flags()
    {
        return array(
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
        );
    }

    public function serviceClass()
    {
        return 'App\\Services\\Reports\\OperatorExportReportService';
    }
}
