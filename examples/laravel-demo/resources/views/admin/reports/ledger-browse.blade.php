@extends('layouts.master')

@section('content')
@include('reportkit::layouts.report', ['reportFlags' => [
    'async_prepare' => true,
    'browse_prepared' => true,
    'datatables' => true,
    'ledger' => true,
    'kpi' => true,
    'excel' => true,
    'csv' => true,
    'pdf' => true,
    'howto' => true,
    'activity_log' => true,
]])
@endsection

@section('reportkit.filters')
    <div class="rk-field-row">
        <label for="start_date">Start</label>
        <input type="date" name="start_date" id="start_date" class="rk-field-input" value="2026-01-01">
        <label for="end_date">End</label>
        <input type="date" name="end_date" id="end_date" class="rk-field-input" value="2026-01-31">
    </div>
@endsection

@section('reportkit.results')
@include('reportkit::ui.ledger-panel', [
    'tableId' => 'ledger-browseTable',
    'title' => 'Prepared ledger',
    'reportFlags' => ['ledger' => true, 'datatables' => true],
])
@include('reportkit::ui.download-status', ['id' => 'rkDownloadStatus'])
@endsection

@section('reportkit.howto')
<ol>
    <li>Set filters and click <strong>Fetch &amp; Prepare</strong>.</li>
    <li>After prepare completes, browse the ledger table (no SQL on paging).</li>
    <li>Export CSV, Excel, or PDF from the prepared store.</li>
</ol>
@endsection

@push('scripts')
<link rel="stylesheet" href="{{ asset('css/reportkit/reportkit.css') }}">
<link rel="stylesheet" href="{{ asset('css/reportkit/reportkit-compat.css') }}">
<link rel="stylesheet" href="https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css">
<script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
<script src="{{ asset('js/reportkit/lldp-core.js') }}"></script>
<script src="{{ asset('js/reportkit/lldp-download.js') }}"></script>
<script src="{{ asset('js/reportkit/reportkit.js') }}"></script>
<script>
window.ReportKitPageConfig = {
    slug: 'ledger-browse',
    route: '/admin/ledger-browse',
    weeksUrl: '/reportkit/ledger-browse/weeks',
    dataUrl: '/reportkit/ledger-browse/rows',
    browseUrl: '/reportkit/ledger-browse/browse',
    preparedUrl: '/reportkit/ledger-browse/prepared',
    filenamePrefix: 'ledger-browse'
};
</script>
<script src="{{ asset('js/reports/ledger-browse.js') }}"></script>
@endpush
