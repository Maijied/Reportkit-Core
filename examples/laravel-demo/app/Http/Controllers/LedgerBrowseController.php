<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;

class LedgerBrowseController extends Controller
{
    public function index()
    {
        return view('admin.reports.ledger-browse', array(
            'reportTitle' => 'Ledger Browse (Demo)',
            'reportKicker' => 'HYBRID BROWSE',
            'reportSubtitle' => 'Prepare once — browse ledger pages without re-querying SQL',
            'title' => 'Ledger Browse',
        ));
    }
}
