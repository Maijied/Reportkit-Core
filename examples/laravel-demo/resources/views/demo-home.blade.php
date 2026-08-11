@extends('layouts.master')

@section('content')
<div class="panel panel-default">
    <div class="panel-heading">
        <h1 style="margin:0;font-size:24px;">ReportKit Laravel demo</h1>
        <p class="text-muted" style="margin:8px 0 0;">Fictional SQLite fixtures — two LLDP presets in one host app.</p>
    </div>
    <div class="panel-body">
        <div class="list-group">
            <a href="{{ url('admin/operator-export') }}" class="list-group-item">
                <h4 class="list-group-item-heading">Operator Export <span class="label label-primary">hybrid-export</span></h4>
                <p class="list-group-item-text">Week-chunked prepare, KPI row, CSV / Excel / PDF / email ZIP — no re-query on export.</p>
            </a>
            <a href="{{ url('admin/ledger-browse') }}" class="list-group-item">
                <h4 class="list-group-item-heading">Ledger Browse <span class="label label-success">hybrid-browse</span></h4>
                <p class="list-group-item-text">Prepare once, upload to session, page the ledger via JSON browse (SQL count stays 0).</p>
            </a>
        </div>
        <p class="text-muted small" style="margin-top:16px;">
            Part of the <a href="https://github.com/Maijied/Reportkit-Core">Reportkit-Core monorepo</a> —
            public simulation at <a href="https://reportkit.lorapok.tech/simulation">reportkit.lorapok.tech/simulation</a>.
        </p>
    </div>
</div>
@endsection
