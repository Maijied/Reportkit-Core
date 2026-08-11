<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;

class OperatorExportController extends Controller
{
    public function index()
    {
        return view('admin.reports.operator-export', array(
            'reportTitle' => 'Operator Export (Demo)',
            'reportKicker' => 'LLDP DEMO',
            'reportSubtitle' => 'Fictional SQLite fixtures — hybrid-export preset',
            'title' => 'Operator Export',
        ));
    }
}
