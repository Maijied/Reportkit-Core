@extends('layouts.master')

@section('content')
@include('reportkit::layouts.report', ['reportFlags' => [
    'async_prepare' => true,
    'browse_prepared' => false,
    'datatables' => false,
    'kpi' => true,
    'excel' => true,
    'csv' => true,
    'pdf' => true,
    'email' => true,
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
@include('reportkit::ui.download-status', ['id' => 'rkDownloadStatus'])
@endsection

@section('reportkit.howto')
<ol>
    <li>Set filters and click <strong>Fetch &amp; Prepare</strong>.</li>
    <li>Wait for the progress overlay to reach 100%.</li>
    <li>Export CSV, Excel, or PDF from the action bar — no re-query.</li>
    <li>Optional: email the prepared ZIP from the send panel.</li>
</ol>
@endsection

@push('scripts')
<link rel="stylesheet" href="{{ asset('css/reportkit/reportkit.css') }}">
<link rel="stylesheet" href="{{ asset('css/reportkit/reportkit-compat.css') }}">
<script src="{{ asset('js/reportkit/lldp-core.js') }}"></script>
<script src="{{ asset('js/reportkit/lldp-download.js') }}"></script>
<script src="{{ asset('js/reportkit/reportkit.js') }}"></script>
<script>
window.ReportKitPageConfig = {
    slug: 'operator-export',
    route: '/admin/operator-export',
    weeksUrl: '/reportkit/operator-export/weeks',
    dataUrl: '/reportkit/operator-export/rows',
    sendUrl: '/reportkit/operator-export/send',
    maxUploadBytes: {{ (int) config('reportkit.mail.hard_attach_max_bytes', 26214400) }},
    filenamePrefix: 'operator-export'
};
</script>
<script src="{{ asset('js/reports/operator-export.js') }}"></script>
@endpush
