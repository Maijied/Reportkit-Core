(function (window) {
    'use strict';

    if (!window.ReportKit || !window.jQuery) {
        return;
    }

    var $ = window.jQuery;
    var cfg = window.ReportKitPageConfig || {};
    var slug = cfg.slug || 'ledger-browse';
    var route = cfg.route || '/admin/ledger-browse';

    ReportKit.fonts.ensure();
    ReportKit.log.renderPanel('.rk-activity-log');

    function filterParams() {
        var params = {};
        $('#search-pan').serializeArray().forEach(function (item) {
            if (item.name && item.value !== '') {
                params[item.name] = item.value;
            }
        });
        delete params._token;
        delete params._method;
        return params;
    }

    function fingerprint() {
        var p = filterParams();
        return (p.start_date || '') + '_' + (p.end_date || '');
    }

    function ledgerColumns() {
        return [
            { key: 'transaction_date', label: 'Date' },
            { key: 'transaction_type', label: 'Type' },
            { key: 'pnr', label: 'PNR' },
            { key: 'credit_amount', label: 'Credit' },
            { key: 'debit_amount', label: 'Debit' },
            { key: 'balance', label: 'Balance' }
        ];
    }

    function ledgerColumnDefs() {
        return [
            { data: 'transaction_date', title: 'Date' },
            { data: 'transaction_type', title: 'Type', render: ReportKit.table.renderTxnPill('transaction_type') },
            { data: 'pnr', title: 'PNR' },
            { data: 'credit_amount', title: 'Credit', className: 'rk-money' },
            { data: 'debit_amount', title: 'Debit', className: 'rk-money' },
            { data: 'balance', title: 'Balance', className: 'rk-money' }
        ];
    }

    function syncExportActionLock(enabled) {
        ReportKit.ui.setActionsEnabled('#rkActionBar', !!enabled);
    }

    function updateKpiFromSummary(summary) {
        summary = summary || {};
        ReportKit.ui.renderKpiRow('#rkKpiRow', [
            { label: 'Rows', value: summary.row_count != null ? summary.row_count : ReportKit.store.rows().length },
            { label: 'Balance', value: summary.current_balance != null ? summary.current_balance : '—' }
        ]);
    }

    syncExportActionLock(false);

    $('#search-pan').on('change input', 'input, select', function () {
        ReportKit.store.clear();
        syncExportActionLock(false);
    });

    var prepareRunner = ReportKit.createPrepareRunner ? ReportKit.createPrepareRunner({
        weeksUrl: cfg.weeksUrl || ('/reportkit/' + slug + '/weeks'),
        dataUrl: cfg.dataUrl || ('/reportkit/' + slug + '/rows'),
        concurrency: Number(ReportKit.util.setting('prepare.concurrency', 3)),
        timeoutMs: Number(ReportKit.util.setting('prepare.ajax_timeout_ms', 120000)),
        dayLabelUnderDays: Number(ReportKit.util.setting('prepare.day_label_under_days', 7)),
        onWeekRows: function (rows) {
            ReportKit.store.mergeRows(rows);
        },
        onProgress: function (pct, label) {
            ReportKit.asyncLoader.setProgress(pct);
            if (label) {
                ReportKit.asyncLoader.show('#rkAsyncLoading', label);
            }
        },
        onComplete: function () {
            ReportKit.store.commit({ reportKey: slug, fingerprint: fingerprint() });
            var rows = ReportKit.store.rows();
            syncExportActionLock(rows.length > 0);
            ReportKit.ui.toast('Prepare complete (' + rows.length + ' rows).', 'info');

            ReportKit.table.fromPreparedStore({
                selector: '#ledger-browseTable',
                preparedUrl: cfg.preparedUrl || ('/reportkit/' + slug + '/prepared'),
                browseUrl: cfg.browseUrl || ('/reportkit/' + slug + '/browse'),
                columns: ledgerColumnDefs(),
                loaderSelector: '#rkTableLoader',
                actionBarSelector: '#rkActionBar',
                onDataLoaded: function (json) {
                    if (json && json.summary) {
                        updateKpiFromSummary(json.summary);
                    } else {
                        updateKpiFromSummary({ row_count: rows.length });
                    }
                    syncExportActionLock(true);
                }
            });
        },
        onError: function (msg) {
            ReportKit.ui.toast(msg || 'Prepare failed', 'warn');
        }
    }) : null;

    $('#rkPrepareBtn').on('click', function () {
        var params = filterParams();
        ReportKit.store.beginPrepare();
        syncExportActionLock(false);

        if (prepareRunner) {
            prepareRunner.start(params);
            return;
        }

        ReportKit.prepare.run({
            weeksUrl: cfg.weeksUrl || (route + '/weeks'),
            dataUrl: cfg.dataUrl || (route + '/rows'),
            reportKey: slug,
            fingerprint: fingerprint(),
            params: params,
            onComplete: function () {
                ReportKit.table.fromPreparedStore({
                    selector: '#ledger-browseTable',
                    preparedUrl: cfg.preparedUrl || ('/reportkit/' + slug + '/prepared'),
                    browseUrl: cfg.browseUrl || ('/reportkit/' + slug + '/browse'),
                    columns: ledgerColumnDefs(),
                    loaderSelector: '#rkTableLoader',
                    actionBarSelector: '#rkActionBar',
                    onDataLoaded: function () {
                        syncExportActionLock(true);
                    }
                });
            },
            onError: function (msg) {
                ReportKit.ui.toast(msg || 'Prepare failed', 'warn');
            }
        });
    });

    $('#rkCsvBtn').on('click', function () {
        var p = filterParams();
        ReportKit.export.fromStore('csv', {
            prefix: cfg.filenamePrefix || slug,
            start_date: p.start_date,
            end_date: p.end_date,
            columns: ledgerColumns()
        });
    });

    $('#rkExcelBtn').on('click', function () {
        var p = filterParams();
        ReportKit.export.fromStore('excel', {
            prefix: cfg.filenamePrefix || slug,
            start_date: p.start_date,
            end_date: p.end_date,
            columns: ledgerColumns()
        });
    });

    $('#rkPdfBtn').on('click', function () {
        ReportKit.export.fromStore('pdf', {
            prefix: cfg.filenamePrefix || slug,
            columns: ledgerColumns(),
            pdfBtnSelector: '#rkPdfBtn',
            statusSelector: '#rkDownloadStatus'
        });
    });
}(window));
