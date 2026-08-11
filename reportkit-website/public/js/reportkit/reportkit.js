/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * reportkit.js — ReportKit browser module.
 */

/**
 * @lorapok-labs/reportkit-ui — browser helpers (ES5 / jQuery).
 *
 * Peers: jQuery >= 1.10. DataTables optional for ReportKit.table.mount.
 */
(function (window) {
    'use strict';

    var ReportKit = window.ReportKit || {};

    ReportKit.brand = ReportKit.brand || {
        pdf_disclaimer: 'This document was generated for authorized use only.',
        accent: '#0b7a4b'
    };

    ReportKit.settings = ReportKit.settings || {};

    ReportKit.version = '0.1.0';

    /**
     * Merge server-provided settings (window.__REPORTKIT_SETTINGS__ or AJAX).
     */
    ReportKit.applySettings = function (settings) {
        if (!settings || typeof settings !== 'object') {
            return;
        }

        ReportKit.settings = settings;

        if (settings.brand && typeof settings.brand === 'object') {
            ReportKit.brand = ReportKit.brand || {};
            Object.keys(settings.brand).forEach(function (key) {
                if (Object.prototype.hasOwnProperty.call(settings.brand, key)) {
                    ReportKit.brand[key] = settings.brand[key];
                }
            });
        }
    };

    if (window.__REPORTKIT_SETTINGS__) {
        ReportKit.applySettings(window.__REPORTKIT_SETTINGS__);
    }

    function jq() {
        return window.jQuery || null;
    }

    /**
     * Optional Google Fonts inject for Manrope + Sora (CAS standard).
     */
    ReportKit.fonts = {
        ensure: function () {
            if (typeof document === 'undefined') {
                return;
            }
            if (document.getElementById('rk-fonts')) {
                return;
            }
            var link = document.createElement('link');
            link.id = 'rk-fonts';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Sora:wght@600;700&display=swap';
            document.head.appendChild(link);
        }
    };

    /**
     * Sync generate overlay (classic form submit).
     */
    ReportKit.syncLoader = {
        show: function (selector) {
            var $ = jq();
            if (!$) {
                return;
            }
            $(selector || '#rkSyncLoading').addClass('is-visible').show();
        },
        hide: function (selector) {
            var $ = jq();
            if (!$) {
                return;
            }
            $(selector || '#rkSyncLoading').removeClass('is-visible').hide();
        },
        bindForm: function (formSelector, loaderSelector) {
            var $ = jq();
            if (!$) {
                return;
            }
            $(formSelector || '#search-pan').on('submit', function () {
                ReportKit.syncLoader.show(loaderSelector);
            });
        }
    };

    /**
     * Async prepare overlay + progress bar.
     */
    ReportKit.asyncLoader = {
        show: function (selector, message) {
            var $ = jq();
            if (!$) {
                return;
            }
            var $el = $(selector || '#rkAsyncLoading');
            if (message) {
                $el.find('.rk-async-loading-msg').text(message);
            }
            $el.addClass('is-visible').show();
        },
        hide: function (selector) {
            var $ = jq();
            if (!$) {
                return;
            }
            $(selector || '#rkAsyncLoading').removeClass('is-visible').hide();
        },
        setProgress: function (pct, selector, etaText) {
            var $ = jq();
            if (!$) {
                return;
            }
            var n = Math.max(0, Math.min(100, Number(pct) || 0));
            var $el = $(selector || '#rkAsyncLoading');
            $el.find('.rk-progress-bar').css('width', n + '%');
            $el.find('.rk-async-loading-percent').text(n + '%');
            if (typeof etaText === 'string' && etaText) {
                $el.find('.rk-async-loading-eta').text(etaText);
            }
        }
    };

    /**
     * DataTables mount + export helpers.
     * definition: { ajax, columns, pageLength, lengthMenu, serverSide, order, ... }
     */
    ReportKit.table = {
        mount: function (selector, definition) {
            var $ = jq();
            definition = definition || {};
            if (!$ || !$.fn || !$.fn.dataTable) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('ReportKit.table.mount requires jQuery DataTables');
                }
                return null;
            }
            var options = {
                serverSide: definition.serverSide !== false,
                processing: definition.processing !== false,
                pageLength: definition.pageLength || 25,
                lengthMenu: definition.lengthMenu || [10, 25, 50, 100],
                ajax: definition.ajax,
                columns: definition.columns || [],
                order: definition.order || [],
                searching: definition.searching !== false,
                deferLoading: typeof definition.deferLoading === 'number' ? definition.deferLoading : 0,
                dom: definition.dom || 'lfrtip'
            };
            if (definition.createdRow) {
                options.createdRow = definition.createdRow;
            }
            if (definition.drawCallback) {
                options.drawCallback = definition.drawCallback;
            }
            if (definition.loaderSelector) {
                var loaderSel = definition.loaderSelector;
                options.preDrawCallback = function () {
                    ReportKit.table._toggleLoader(loaderSel, true);
                };
                var userDraw = options.drawCallback;
                options.drawCallback = function () {
                    ReportKit.table._toggleLoader(loaderSel, false);
                    if (typeof userDraw === 'function') {
                        userDraw.apply(this, arguments);
                    }
                };
            }
            var api = $(selector).DataTable(options);
            $(selector).trigger('rk:table:mounted', [api]);
            return api;
        },

        /**
         * Flatten current DataTables view into plain row objects/arrays for client compose.
         * Does not re-query the server.
         */
        toPreparedRows: function (tableApi) {
            if (!tableApi || typeof tableApi.rows !== 'function') {
                return [];
            }
            return tableApi.rows({ search: 'applied' }).data().toArray();
        },

        /**
         * Reload with optional reset of paging.
         */
        reload: function (tableApi, resetPaging) {
            if (!tableApi || !tableApi.ajax || typeof tableApi.ajax.reload !== 'function') {
                return;
            }
            tableApi.ajax.reload(null, resetPaging !== false);
        },

        _toggleLoader: function (selector, visible) {
            if (!selector) {
                return;
            }
            var node = typeof selector === 'string' ? document.querySelector(selector) : selector;
            if (!node) {
                return;
            }
            if (visible) {
                node.classList.add('is-visible');
                node.setAttribute('aria-hidden', 'false');
            } else {
                node.classList.remove('is-visible');
                node.setAttribute('aria-hidden', 'true');
            }
        },

        renderTxnPill: function (fieldKey) {
            var classMap = ReportKit.util.setting('table.txn_type_classes', {}) || {};
            return function (value) {
                var type = value == null ? '' : String(value);
                var pillClass = classMap[type] || 'rk-txn-pill--default';
                var label = type.replace(/_/g, ' ');
                return '<span class="rk-txn-pill ' + pillClass + '" data-txn-type="' + type.replace(/"/g, '') + '">' +
                    label.replace(/</g, '&lt;') + '</span>';
            };
        },

        /**
         * Wire DataTables to session browse endpoint or local prepared rows (Phase K6).
         */
        fromPreparedStore: function (options) {
            options = options || {};
            var $ = jq();
            var rows = ReportKit.store.rows();

            if (!rows.length) {
                ReportKit.ui.toast('Prepare data first.', 'warn');
                return null;
            }

            var columns = options.columns || ReportKit.export.inferColumns(rows);
            var columnKeys = columns.map(function (col) {
                return col.key || col;
            });
            var columnDefs = columns.map(function (col) {
                return {
                    data: col.key || col,
                    title: col.label || col.key || col,
                    orderable: true
                };
            });
            var tableOptions = {
                serverSide: true,
                processing: true,
                pageLength: options.pageLength || Number(ReportKit.util.setting('table.default_page_length', 25)),
                lengthMenu: ReportKit.util.setting('table.length_menu', [10, 25, 50, 100]),
                columns: columnDefs,
                dom: options.dom || 'lfrtip',
                loaderSelector: options.loaderSelector,
                drawCallback: function () {
                    if (typeof options.onDraw === 'function') {
                        options.onDraw();
                    }
                }
            };

            function enableExports() {
                if (options.actionBarSelector) {
                    ReportKit.ui.setActionsEnabled(options.actionBarSelector, true);
                }
                if (typeof options.onDataLoaded === 'function') {
                    options.onDataLoaded();
                }
            }

            function mountWithAjax(ajaxConfig) {
                tableOptions.ajax = ajaxConfig;
                var api = ReportKit.table.mount(options.selector, tableOptions);
                if (api && typeof options.onReady === 'function') {
                    options.onReady(api);
                }
                ReportKit.log.add('browse', 'Ledger table mounted (' + rows.length + ' prepared rows)');
                return api;
            }

            if (options.browseUrl && options.preparedUrl && !options.localOnly) {
                ReportKit.store.uploadPrepared({
                    url: options.preparedUrl,
                    rows: rows,
                    headers: options.headers
                }).done(function () {
                    mountWithAjax({
                        url: options.browseUrl,
                        type: 'GET',
                        data: function (data) {
                            return data;
                        },
                        dataSrc: function (json) {
                            if (json && json.summary) {
                                ReportKit.table._applyBrowseSummary(json.summary, options);
                            }
                            enableExports();
                            if (typeof options.onDataLoaded === 'function') {
                                options.onDataLoaded(json);
                            }
                            return (json && json.data) ? json.data : [];
                        }
                    });
                }).fail(function () {
                    ReportKit.ui.toast('Server browse unavailable — using local prepared rows.', 'warn');
                    mountWithAjax(function (data, callback) {
                        var result = ReportKit.table._browseLocalRows(rows, data, columnKeys);
                        ReportKit.table._applyBrowseSummary(result.summary, options);
                        callback(result.payload);
                    });
                });
                return null;
            }

            return mountWithAjax(function (data, callback) {
                var result = ReportKit.table._browseLocalRows(rows, data, columnKeys);
                ReportKit.table._applyBrowseSummary(result.summary, options);
                enableExports();
                callback(result.payload);
            });
        },

        _browseLocalRows: function (rows, request, columnKeys) {
            request = request || {};
            columnKeys = columnKeys || [];
            var pageLimitMax = Number(ReportKit.util.setting('table.page_limit_max', 10000));
            var working = rows.slice(0);
            var search = '';

            if (request.search && request.search.value) {
                search = String(request.search.value).trim();
            } else if (typeof request.search === 'string') {
                search = request.search.trim();
            }

            if (search !== '' && columnKeys.length) {
                var needle = search.toLowerCase();
                working = working.filter(function (row) {
                    row = row || {};
                    var hay = '';
                    columnKeys.forEach(function (key) {
                        if (typeof row[key] !== 'undefined' && row[key] !== null) {
                            hay += ' ' + row[key];
                        }
                    });
                    return hay.toLowerCase().indexOf(needle) !== -1;
                });
            }

            if (request.order && request.order[0] && columnKeys.length) {
                var colIndex = Number(request.order[0].column) || 0;
                var dir = request.order[0].dir === 'desc' ? -1 : 1;
                var sortKey = columnKeys[colIndex];

                if (sortKey) {
                    working.sort(function (a, b) {
                        var av = a ? a[sortKey] : null;
                        var bv = b ? b[sortKey] : null;
                        if (av === bv) {
                            return 0;
                        }
                        if (av === null || typeof av === 'undefined') {
                            return -1 * dir;
                        }
                        if (bv === null || typeof bv === 'undefined') {
                            return 1 * dir;
                        }
                        if (!isNaN(av) && !isNaN(bv) && av !== '' && bv !== '') {
                            return (Number(av) - Number(bv)) * dir;
                        }
                        return String(av).localeCompare(String(bv)) * dir;
                    });
                }
            }

            var filtered = working.length;
            var start = Number(request.start) || 0;
            var length = typeof request.length === 'number' ? Number(request.length) : 25;

            if (length < 0) {
                length = pageLimitMax;
            }
            if (length > pageLimitMax) {
                length = pageLimitMax;
            }

            var page = working.slice(start, start + length);
            var summary = ReportKit.table._buildSummary(working);

            return {
                summary: summary,
                payload: {
                    draw: Number(request.draw) || 0,
                    recordsTotal: rows.length,
                    recordsFiltered: filtered,
                    data: page,
                    summary: summary
                }
            };
        },

        _buildSummary: function (rows) {
            rows = rows || [];
            var credit = 0;
            var debit = 0;

            rows.forEach(function (row) {
                row = row || {};
                credit += ReportKit.table._moneyToFloat(row.credit_amount != null ? row.credit_amount : row.credit);
                debit += ReportKit.table._moneyToFloat(row.debit_amount != null ? row.debit_amount : row.debit);
            });

            var balance = credit - debit;

            return {
                current_balance: ReportKit.table._formatMoney(balance),
                total_credit: ReportKit.table._formatMoney(credit),
                total_debit: ReportKit.table._formatMoney(debit),
                warning_level: balance < 0 ? 'warn' : 'ok',
                row_count: rows.length
            };
        },

        _moneyToFloat: function (value) {
            if (value === null || typeof value === 'undefined' || value === '') {
                return 0;
            }
            if (!isNaN(value)) {
                return Number(value);
            }
            var normalized = String(value).replace(/[^0-9.\-]/g, '');
            return isNaN(normalized) ? 0 : Number(normalized);
        },

        _formatMoney: function (value) {
            var n = Number(value) || 0;
            return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },

        _applyBrowseSummary: function (summary, options) {
            options = options || {};
            if (typeof options.onSummary === 'function') {
                options.onSummary(summary);
            }
            if (options.kpiSelector === false) {
                return;
            }
            ReportKit.kpi.apply(options.kpiSelector || '.rk-kpi-row', {
                current_balance: {
                    value: summary.current_balance,
                    tone: summary.warning_level === 'warn' ? 'warn' : 'good'
                },
                total_credit: { value: summary.total_credit },
                total_debit: { value: summary.total_debit }
            });
        }
    };

    /**
     * Optional trace inspector helper for demo / debug UIs.
     * el: element or selector; trace: object from /trace or MergedRowSource::getTrace()
     */
    ReportKit.trace = {
        render: function (el, trace) {
            var node = typeof el === 'string' ? document.querySelector(el) : el;
            if (!node) {
                return;
            }
            try {
                node.textContent = JSON.stringify(trace || {}, null, 2);
            } catch (e) {
                node.textContent = String(trace);
            }
        }
    };

    /**
     * Set KPI card values from a summary map { key: { value, hint, tone } }.
     */
    ReportKit.kpi = {
        apply: function (rootSelector, summary) {
            var $ = jq();
            if (!$ || !summary) {
                return;
            }
            var $root = $(rootSelector || '.rk-kpi-row');
            Object.keys(summary).forEach(function (key) {
                var item = summary[key] || {};
                var $card = $root.find('[data-rk-kpi="' + key + '"]');
                if (!$card.length) {
                    return;
                }
                if (typeof item.value !== 'undefined') {
                    $card.find('.rk-kpi-value').text(item.value);
                }
                if (typeof item.hint !== 'undefined') {
                    $card.find('.rk-kpi-hint').text(item.hint);
                }
                $card.removeClass('is-good is-bad is-warn');
                if (item.tone) {
                    $card.addClass('is-' + item.tone);
                }
            });
        }
    };

    /**
     * Deferred UI work — keeps prepare/export loops off the main thread (Phase C).
     */
    ReportKit.util = ReportKit.util || {
        runDeferredUiWork: function (work, done) {
            var run = window.requestAnimationFrame
                ? window.requestAnimationFrame.bind(window)
                : function (fn) { return setTimeout(fn, 0); };
            run(function () {
                try {
                    if (typeof work === 'function') {
                        work();
                    }
                } finally {
                    if (typeof done === 'function') {
                        done();
                    }
                }
            });
        },
        setting: function (path, fallback) {
            var parts = String(path || '').split('.');
            var node = ReportKit.settings || {};
            for (var i = 0; i < parts.length; i += 1) {
                if (!node || typeof node !== 'object' || !Object.prototype.hasOwnProperty.call(node, parts[i])) {
                    return fallback;
                }
                node = node[parts[i]];
            }
            return typeof node === 'undefined' ? fallback : node;
        },
        processInChunks: function (items, chunkSize, worker, done) {
            items = items || [];
            chunkSize = chunkSize || 400;
            var index = 0;
            var self = this;

            function step() {
                if (index >= items.length) {
                    if (typeof done === 'function') {
                        done();
                    }
                    return;
                }
                var slice = items.slice(index, index + chunkSize);
                index += chunkSize;
                self.runDeferredUiWork(function () {
                    worker(slice, index, items.length);
                }, step);
            }

            step();
        },
        sanitizeFilenamePart: function (value) {
            var safe = String(value == null ? '' : value).replace(/[^A-Za-z0-9]+/g, '_').replace(/_+/g, '_');
            return safe.replace(/^_+|_+$/g, '');
        },
        buildFilename: function (parts) {
            parts = parts || {};
            var chunks = [];
            if (parts.prefix) {
                chunks.push(ReportKit.util.sanitizeFilenamePart(parts.prefix));
            }
            if (parts.start_date && parts.end_date) {
                chunks.push(parts.start_date + '_to_' + parts.end_date);
            }
            var ext = parts.extension ? String(parts.extension).replace(/^\./, '') : 'csv';
            return chunks.filter(Boolean).join('_') + '.' + ext;
        },
        downloadBlob: function (filename, mimeType, content) {
            var blob;
            try {
                blob = new Blob([content], { type: mimeType || 'application/octet-stream' });
            } catch (e) {
                blob = new Blob([content]);
            }
            var url = window.URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.download = filename || 'report.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
        escapeCsvCell: function (value) {
            var text = value == null ? '' : String(value);
            if (/[",\n\r]/.test(text)) {
                return '"' + text.replace(/"/g, '""') + '"';
            }
            return text;
        },
        encodePersistPayload: function (raw) {
            try {
                return 'rk1:' + btoa(unescape(encodeURIComponent(raw)));
            } catch (e) {
                return null;
            }
        },
        decodePersistPayload: function (encoded) {
            if (!encoded || String(encoded).indexOf('rk1:') !== 0) {
                return null;
            }
            try {
                return decodeURIComponent(escape(atob(String(encoded).slice(4))));
            } catch (e) {
                return null;
            }
        },
        storageAvailable: function (type) {
            try {
                var storage = window[type];
                var probe = '__rk_probe__';
                storage.setItem(probe, '1');
                storage.removeItem(probe);
                return true;
            } catch (e) {
                return false;
            }
        },
        getCsrfToken: function () {
            var $ = jq();
            if ($) {
                var $tokenInput = $('input[name="_token"]').first();
                if ($tokenInput.length && $tokenInput.val()) {
                    return $tokenInput.val();
                }
            }
            var meta = typeof document !== 'undefined'
                ? document.querySelector('meta[name="csrf-token"]')
                : null;
            return meta ? meta.getAttribute('content') : '';
        },
        /**
         * C9 — reject HTML login/500 pages masquerading as JSON AJAX responses.
         */
        isHtmlAjaxBody: function (text) {
            if (typeof text !== 'string' || text === '') {
                return false;
            }
            var trimmed = text.replace(/^\s+/, '');
            return trimmed.charAt(0) === '<' || trimmed.indexOf('<!DOCTYPE') === 0 || trimmed.indexOf('<html') === 0;
        },
        parseAjaxJson: function (xhr, fallbackMessage) {
            fallbackMessage = fallbackMessage || 'Unexpected server response.';
            if (!xhr) {
                return { ok: false, error: fallbackMessage };
            }
            if (xhr.responseJSON && typeof xhr.responseJSON === 'object') {
                return { ok: true, data: xhr.responseJSON };
            }
            var text = typeof xhr.responseText === 'string' ? xhr.responseText : '';
            if (this.isHtmlAjaxBody(text)) {
                return { ok: false, error: 'Session expired or server error — please reload and sign in again.' };
            }
            if (text) {
                try {
                    return { ok: true, data: JSON.parse(text) };
                } catch (e) {
                    return { ok: false, error: fallbackMessage };
                }
            }
            return { ok: false, error: fallbackMessage };
        },
        ajaxTimeoutMs: function () {
            return Number(ReportKit.util.setting('prepare.ajax_timeout_ms', 120000));
        }
    };

    /**
     * In-browser row store for prepare-once flows (Phase C2).
     */
    ReportKit.store = ReportKit.store || {
        _rows: [],
        _reportKey: null,
        _fingerprint: null,
        _persisted: false,
        _memoryOnly: false,
        _version: 0,
        beginPrepare: function () {
            this._rows = [];
            this._persisted = false;
            this._memoryOnly = false;
            this._version += 1;
            return this;
        },
        mergeRows: function (rows) {
            if (!rows || !rows.length) {
                return this;
            }
            this._rows = this._rows.concat(rows);
            return this;
        },
        rows: function () {
            return this._rows.slice(0);
        },
        count: function () {
            return this._rows.length;
        },
        clear: function () {
            this._rows = [];
            this._persisted = false;
            this._memoryOnly = false;
            this._version += 1;
            return this;
        },
        payloadJson: function () {
            try {
                return JSON.stringify({ v: this._version, rows: this._rows });
            } catch (e) {
                return null;
            }
        },
        payloadSize: function () {
            var json = this.payloadJson();
            return json ? json.length : 0;
        },
        storageKey: function (reportKey, fingerprint) {
            var prefix = ReportKit.util.setting('store.storage_key_prefix', 'reportkit_');
            var key = prefix + (reportKey || this._reportKey || 'default');
            if (fingerprint) {
                key += '_' + fingerprint;
            }
            return key;
        },
        commit: function (options) {
            options = options || {};
            this._reportKey = options.reportKey || this._reportKey || (ReportKit.settings.report && ReportKit.settings.report.id) || null;
            this._fingerprint = options.fingerprint || this._fingerprint || null;
            this._persisted = false;
            this._memoryOnly = false;

            var maxBytes = Number(ReportKit.util.setting('store.session_persist_max_bytes', 1500000));
            var json = this.payloadJson();

            if (!json) {
                this._memoryOnly = true;
                return { ok: true, persisted: false, memoryOnly: true, reason: 'serialize_failed' };
            }

            if (json.length > maxBytes) {
                this._memoryOnly = true;
                ReportKit.ui.toast('Prepared data kept in memory only (over persist limit).', 'warn');
                ReportKit.log.add('store', 'Memory-only store (' + this._rows.length + ' rows, over persist limit)');
                return { ok: true, persisted: false, memoryOnly: true, reason: 'over_limit', bytes: json.length };
            }

            if (!ReportKit.util.storageAvailable('sessionStorage')) {
                this._memoryOnly = true;
                return { ok: true, persisted: false, memoryOnly: true, reason: 'storage_unavailable' };
            }

            var encoded = ReportKit.util.encodePersistPayload(json);
            if (!encoded) {
                this._memoryOnly = true;
                return { ok: true, persisted: false, memoryOnly: true, reason: 'encode_failed' };
            }

            try {
                sessionStorage.setItem(this.storageKey(this._reportKey, this._fingerprint), encoded);
                this._persisted = true;
                ReportKit.log.add('store', 'Prepared rows committed (' + this._rows.length + ' rows)');
                return { ok: true, persisted: true, memoryOnly: false, bytes: json.length };
            } catch (e) {
                this._memoryOnly = true;
                return { ok: true, persisted: false, memoryOnly: true, reason: 'quota_exceeded' };
            }
        },
        restore: function (options) {
            options = options || {};
            var reportKey = options.reportKey || this._reportKey || (ReportKit.settings.report && ReportKit.settings.report.id);
            var fingerprint = options.fingerprint || this._fingerprint;
            var key = this.storageKey(reportKey, fingerprint);

            if (!ReportKit.util.storageAvailable('sessionStorage')) {
                return false;
            }

            var encoded = sessionStorage.getItem(key);
            var raw = ReportKit.util.decodePersistPayload(encoded);
            if (!raw) {
                return false;
            }

            try {
                var payload = JSON.parse(raw);
                this._rows = payload && payload.rows ? payload.rows : [];
                this._version = payload && payload.v ? payload.v : 0;
                this._reportKey = reportKey;
                this._fingerprint = fingerprint;
                this._persisted = true;
                this._memoryOnly = false;
                return true;
            } catch (e) {
                return false;
            }
        },
        isPersisted: function () {
            return !!this._persisted;
        },
        isMemoryOnly: function () {
            return !!this._memoryOnly;
        },
        uploadPrepared: function (options) {
            options = options || {};
            var $ = jq();
            var url = options.url || options.preparedUrl;
            var rows = options.rows || this.rows();

            if (!$ || !url) {
                var deferred = $.Deferred ? $.Deferred() : null;
                if (deferred) {
                    deferred.reject('Missing preparedUrl');
                    return deferred.promise();
                }
                return null;
            }

            var payload = { rows: rows };
            var headers = options.headers || {};

            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            return $.ajax({
                url: url,
                method: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                headers: headers
            });
        }
    };

    /**
     * Compose exports from prepared rows — ceilings from settings (Phase C3).
     */
    ReportKit.export = ReportKit.export || {
        assess: function (rowCount, format) {
            rowCount = Number(rowCount) || 0;
            format = format || 'csv';
            var ceilings = {
                csv: Number.MAX_SAFE_INTEGER,
                excel: Number(ReportKit.util.setting('export.excel_soft_max_rows', 25000)),
                pdf: Number(ReportKit.util.setting('export.pdf_single_pass_max_rows', 105303))
            };
            var ceiling = ceilings[format] || ceilings.csv;
            var result = {
                format: format,
                rowCount: rowCount,
                ceiling: ceiling,
                allowed: rowCount <= ceiling,
                fallback: null,
                warn: null
            };

            if (!result.allowed && format === 'excel') {
                result.fallback = 'csv';
                result.warn = 'Excel row count exceeds soft limit — falling back to CSV.';
            } else if (!result.allowed && format === 'pdf') {
                result.fallback = 'csv';
                result.warn = 'PDF row count exceeds single-pass limit — falling back to CSV.';
            }

            return result;
        },
        fromStore: function (format, options) {
            return this.compose(format, ReportKit.store.rows(), options);
        },
        compose: function (format, rows, options) {
            options = options || {};
            rows = rows || [];
            var assessment = this.assess(rows.length, format);

            if (assessment.warn) {
                ReportKit.ui.toast(assessment.warn, 'warn');
            }

            if (assessment.fallback) {
                return this.csv(rows, options);
            }

            if (format === 'excel') {
                return this.excel(rows, options);
            }
            if (format === 'pdf') {
                return ReportKit.pdf.compose(rows, options);
            }
            return this.csv(rows, options);
        },
        csv: function (rows, options) {
            options = options || {};
            rows = rows || [];
            var columns = options.columns || this.inferColumns(rows);
            var chunkSize = Number(ReportKit.util.setting('export.csv_chunk_rows', options.chunkSize || 400));
            var lines = [];
            var header = columns.map(function (col) {
                return ReportKit.util.escapeCsvCell(col.label || col.key || col);
            }).join(',');
            lines.push(header);
            var self = this;

            ReportKit.util.processInChunks(rows, chunkSize, function (slice) {
                slice.forEach(function (row) {
                    var cells = columns.map(function (col) {
                        var key = col.key || col;
                        var val = typeof row === 'object' && row !== null ? row[key] : row;
                        return ReportKit.util.escapeCsvCell(val);
                    });
                    lines.push(cells.join(','));
                });
            }, function () {
                var filename = options.filename || ReportKit.util.buildFilename({
                    prefix: options.prefix || 'report',
                    start_date: options.start_date,
                    end_date: options.end_date,
                    extension: 'csv'
                });
                ReportKit.util.downloadBlob(filename, 'text/csv;charset=utf-8', lines.join('\r\n'));
                ReportKit.log.add('export', 'CSV download (' + rows.length + ' rows)');
                if (typeof options.onComplete === 'function') {
                    options.onComplete({ format: 'csv', rows: rows.length, filename: filename });
                }
            });

            return { ok: true, format: 'csv', rows: rows.length };
        },
        excel: function (rows, options) {
            options = options || {};
            var assessment = this.assess(rows.length, 'excel');
            if (!assessment.allowed) {
                return this.csv(rows, options);
            }

            rows = rows || [];
            var columns = options.columns || this.inferColumns(rows);
            var html = ['<html><head><meta charset="utf-8"></head><body><table border="1"><thead><tr>'];
            columns.forEach(function (col) {
                html.push('<th>' + String(col.label || col.key || col).replace(/</g, '&lt;') + '</th>');
            });
            html.push('</tr></thead><tbody>');

            var chunkSize = Number(ReportKit.util.setting('export.excel_chunk_rows', options.chunkSize || 400));

            ReportKit.util.processInChunks(rows, chunkSize, function (slice) {
                slice.forEach(function (row) {
                    html.push('<tr>');
                    columns.forEach(function (col) {
                        var key = col.key || col;
                        var val = typeof row === 'object' && row !== null ? row[key] : row;
                        html.push('<td>' + String(val == null ? '' : val).replace(/</g, '&lt;') + '</td>');
                    });
                    html.push('</tr>');
                });
            }, function () {
                html.push('</tbody></table></body></html>');
                var filename = options.filename || ReportKit.util.buildFilename({
                    prefix: options.prefix || 'report',
                    start_date: options.start_date,
                    end_date: options.end_date,
                    extension: 'xls'
                });
                ReportKit.util.downloadBlob(filename, 'application/vnd.ms-excel', html.join(''));
                ReportKit.log.add('export', 'Excel download (' + rows.length + ' rows)');
                if (typeof options.onComplete === 'function') {
                    options.onComplete({ format: 'excel', rows: rows.length, filename: filename });
                }
            });

            return { ok: true, format: 'excel', rows: rows.length };
        },
        inferColumns: function (rows) {
            if (!rows || !rows.length || typeof rows[0] !== 'object') {
                return [{ key: 'value', label: 'Value' }];
            }
            return Object.keys(rows[0]).map(function (key) {
                return { key: key, label: key };
            });
        }
    };

    /**
     * PDF compose helpers (Phase C4 skeleton).
     */
    ReportKit.pdf = ReportKit.pdf || {
        compose: function (rows, options) {
            options = options || {};
            var assessment = ReportKit.export.assess(rows.length, 'pdf');
            if (!assessment.allowed) {
                return ReportKit.export.csv(rows, options);
            }

            ReportKit.ui.toast('PDF export opens print dialog for this build; full merge volumes ship in C4.', 'info');
            var html = ['<html><head><title>Report</title></head><body>'];
            html.push('<p>' + String(ReportKit.brand.pdf_disclaimer || '').replace(/</g, '&lt;') + '</p>');
            html.push('<p>Rows: ' + rows.length + '</p>');
            html.push('</body></html>');
            var win = window.open('', '_blank');
            if (!win) {
                ReportKit.ui.toast('Pop-up blocked — allow pop-ups to print PDF.', 'warn');
                return ReportKit.export.csv(rows, options);
            }
            win.document.write(html.join(''));
            win.document.close();
            win.focus();
            win.print();
            return { ok: true, format: 'pdf', rows: rows.length };
        }
    };

    /**
     * Lightweight UX helpers (Phase C6 skeleton).
     */
    ReportKit.ui = ReportKit.ui || {
        toast: function (message, tone) {
            tone = tone || 'info';
            if (typeof window.Swal !== 'undefined' && window.Swal.fire) {
                window.Swal.fire({ text: message, icon: tone === 'warn' ? 'warning' : tone, timer: 3200, showConfirmButton: false });
                return;
            }
            var $ = jq();
            if ($) {
                var $host = $('#rkToastHost');
                if (!$host.length) {
                    $host = $('<div id="rkToastHost" class="rk-toast-host"></div>').appendTo('body');
                }
                var $toast = $('<div class="rk-toast rk-toast--' + tone + '"></div>').text(message);
                $host.append($toast);
                setTimeout(function () { $toast.fadeOut(200, function () { $toast.remove(); }); }, 3200);
                return;
            }
            if (typeof console !== 'undefined' && console.log) {
                console.log('[ReportKit][' + tone + ']', message);
            }
        },
        setActionsEnabled: function (selector, enabled) {
            var $ = jq();
            if (!$) {
                return;
            }
            var $bar = $(selector || '#rkActionBar');
            $bar.toggleClass('is-disabled', !enabled);
            $bar.find('button, a.rk-btn').prop('disabled', !enabled);
        },
        renderKpiRow: function (selector, metrics) {
            var $ = jq();
            if (!$ || !metrics || !metrics.length) {
                return;
            }
            var $row = $(selector || '.rk-kpi-row');
            if (!$row.length) {
                return;
            }
            var html = metrics.map(function (m) {
                var tone = m.tone ? ' is-' + m.tone : '';
                var key = m.key ? ' data-rk-kpi="' + String(m.key).replace(/"/g, '') + '"' : '';
                return '<div class="rk-kpi-card' + tone + '"' + key + '>' +
                    '<div class="rk-kpi-label">' + String(m.label || '').replace(/</g, '&lt;') + '</div>' +
                    '<div class="rk-kpi-value">' + String(m.value != null ? m.value : '—').replace(/</g, '&lt;') + '</div>' +
                    '</div>';
            }).join('');
            $row.html(html);
        },
        sendStep: function (step) {
            var $ = jq();
            if (!$) {
                return;
            }
            step = Number(step) || 1;
            $('.rk-send-step').each(function () {
                var $el = $(this);
                var n = Number($el.data('step')) || 0;
                $el.removeClass('is-active is-done');
                if (n < step) {
                    $el.addClass('is-done');
                }
                if (n === step) {
                    $el.addClass('is-active');
                }
            });
        },
        setSendUploadProgress: function (pct, label) {
            var $ = jq();
            if (!$) {
                return;
            }
            var n = Math.max(0, Math.min(100, Number(pct) || 0));
            var $wrap = $('#rkSendUploadProgress');
            $wrap.removeClass('is-hidden');
            $wrap.find('.rk-send-progress-fill').css('width', n + '%');
            if (label) {
                $wrap.find('.rk-send-progress-label').text(label);
            }
        },
        hideSendUploadProgress: function () {
            var $ = jq();
            if ($) {
                $('#rkSendUploadProgress').addClass('is-hidden');
            }
        },
        setDownloadStatus: function (options) {
            options = options || {};
            var $ = jq();
            if (!$) {
                return;
            }
            var $el = $(options.selector || '#rkDownloadStatus');
            if (options.hidden) {
                $el.addClass('is-hidden');
                return;
            }
            $el.removeClass('is-hidden');
            if (options.label) {
                $el.find('.rk-download-status-label').text(options.label);
            }
            if (typeof options.pct === 'number') {
                $el.find('.rk-download-status-fill').css('width', options.pct + '%');
            }
            if (options.eta) {
                $el.find('.rk-download-status-eta').text(options.eta);
            }
        },
        bindSendPanel: function (options) {
            options = options || {};
            var $ = jq();
            if (!$) {
                return;
            }
            $('#rkSendForm').off('submit.reportkitSend').on('submit.reportkitSend', function (evt) {
                evt.preventDefault();
                var email = $('#rkSendEmail').val();
                ReportKit.ui.sendStep(1);
                ReportKit.mail.send($.extend({}, options, {
                    email: email,
                    onBuildStart: function () { ReportKit.ui.sendStep(2); },
                    onUploadStart: function () { ReportKit.ui.sendStep(3); },
                    onComplete: function () {
                        ReportKit.ui.sendStep(4);
                        ReportKit.ui.hideSendUploadProgress();
                        ReportKit.notify.setBell('success');
                        if (typeof options.onComplete === 'function') {
                            options.onComplete();
                        }
                    },
                    onError: function (msg) {
                        ReportKit.ui.hideSendUploadProgress();
                        ReportKit.notify.setBell('error');
                        if (typeof options.onError === 'function') {
                            options.onError(msg);
                        }
                    }
                }));
            });
        }
    };

    /**
     * Ping / mute / bell notifications (Phase C6).
     */
    ReportKit.notify = ReportKit.notify || {
        _muted: false,
        isMuted: function () {
            var key = ReportKit.util.setting('notifications.sound_muted_key', 'reportkit_sound_muted');
            if (typeof window.localStorage !== 'undefined' && localStorage.getItem(key) === '1') {
                return true;
            }
            return !!this._muted;
        },
        setMuted: function (muted) {
            this._muted = !!muted;
            var key = ReportKit.util.setting('notifications.sound_muted_key', 'reportkit_sound_muted');
            if (typeof window.localStorage !== 'undefined') {
                localStorage.setItem(key, muted ? '1' : '0');
            }
            var $ = jq();
            if ($) {
                $('#rkNotifyMuteBtn').toggleClass('is-active', muted).text(muted ? 'Unmute' : 'Mute');
            }
        },
        ping: function () {
            if (!ReportKit.util.setting('notifications.ping_enabled', true)) {
                return;
            }
            if (!this.isMuted() && typeof Audio !== 'undefined') {
                try {
                    var ctx = window.reportkitPingAudio || new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQQAAAAAAA==');
                    window.reportkitPingAudio = ctx;
                    ctx.play();
                } catch (e) {}
            }
            this.setBell('ping');
        },
        setBell: function (state) {
            var $ = jq();
            if (!$) {
                return;
            }
            var $bell = $('#rkNotifyBell');
            $bell.removeClass('rk-notify-bell--idle rk-notify-bell--ping rk-notify-bell--success rk-notify-bell--error');
            $bell.addClass('rk-notify-bell--' + (state || 'idle'));
        },
        bindControls: function () {
            var $ = jq();
            if (!$) {
                return;
            }
            var self = this;
            self.setMuted(self.isMuted());
            $('#rkNotifyPingBtn').off('click.reportkitNotify').on('click.reportkitNotify', function () {
                self.ping();
            });
            $('#rkNotifyMuteBtn').off('click.reportkitNotify').on('click.reportkitNotify', function () {
                self.setMuted(!self.isMuted());
            });
            $('#rkDownloadCancelBtn').off('click.reportkitNotify').on('click.reportkitNotify', function () {
                if (ReportKit.export && typeof ReportKit.export.cancel === 'function') {
                    ReportKit.export.cancel();
                }
                ReportKit.ui.setDownloadStatus({ selector: '#rkDownloadStatus', hidden: true });
            });
            $('#rkPrepareCancelBtn').off('click.reportkitNotify').on('click.reportkitNotify', function () {
                if (ReportKit.prepare && typeof ReportKit.prepare.cancel === 'function') {
                    ReportKit.prepare.cancel();
                }
                ReportKit.asyncLoader.hide('#rkAsyncLoading');
            });
        }
    };

    /**
     * Activity log ring buffer (Phase C7).
     */
    ReportKit.log = ReportKit.log || {
        _buffer: [],
        _panelSelector: null,
        enabled: function () {
            return !!ReportKit.util.setting('logging.enabled', false);
        },
        _shouldSample: function () {
            var rate = Number(ReportKit.util.setting('logging.sample_rate', 1));
            if (rate >= 1) {
                return true;
            }
            if (rate <= 0) {
                return false;
            }
            return Math.random() <= rate;
        },
        add: function (category, message, meta) {
            if (!this.enabled() || !this._shouldSample()) {
                return;
            }
            var max = Number(ReportKit.util.setting('logging.buffer_max', 200));
            this._buffer.push({
                ts: new Date().toISOString(),
                category: category || 'general',
                message: message || '',
                meta: meta || null
            });
            if (this._buffer.length > max) {
                this._buffer.splice(0, this._buffer.length - max);
            }
            this._renderPanel();
        },
        entries: function () {
            return this._buffer.slice(0);
        },
        clear: function () {
            this._buffer = [];
            this._renderPanel();
        },
        renderPanel: function (selector) {
            this._panelSelector = selector || this._panelSelector || '.rk-activity-log';
            this._renderPanel();
        },
        _renderPanel: function () {
            if (ReportKit.util.setting('logging.panel', 'local') === 'none') {
                return;
            }
            var $ = jq();
            if (!$ || !this._panelSelector) {
                return;
            }
            var $el = $(this._panelSelector);
            if (!$el.length) {
                return;
            }
            if (!this._buffer.length) {
                $el.html('<div class="rk-log-empty">No activity yet.</div>');
                return;
            }
            var html = this._buffer.map(function (entry) {
                return '<div class="rk-log-entry rk-log-entry--' + entry.category + '">' +
                    '<span class="rk-log-ts">' + entry.ts + '</span> ' +
                    String(entry.message).replace(/</g, '&lt;') +
                    '</div>';
            }).join('');
            $el.html(html);
        }
    };

    /**
     * Email prepared export (Phase C5).
     */
    ReportKit.mail = ReportKit.mail || {
        enabled: function () {
            return ReportKit.util.setting('mail.enabled', true) !== false;
        },
        assessEmail: function (email) {
            var maxLen = Number(ReportKit.util.setting('mail.email_max_length', 254));
            email = String(email || '').trim();
            if (!email) {
                return { ok: false, error: 'Email is required.' };
            }
            if (email.length > maxLen) {
                return { ok: false, error: 'Email is too long.' };
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return { ok: false, error: 'Invalid email format.' };
            }
            return { ok: true, email: email };
        },
        buildAttachment: function (format, options) {
            options = options || {};
            format = format || 'csv';
            var rows = options.rows || ReportKit.store.rows();
            var columns = options.columns || ReportKit.export.inferColumns(rows);
            var maxBytes = Number(ReportKit.util.setting('mail.hard_attach_max_bytes', 26214400));
            var lines = [];
            var header = columns.map(function (col) {
                return ReportKit.util.escapeCsvCell(col.label || col.key || col);
            }).join(',');
            lines.push(header);
            rows.forEach(function (row) {
                var cells = columns.map(function (col) {
                    var key = col.key || col;
                    var val = typeof row === 'object' && row !== null ? row[key] : row;
                    return ReportKit.util.escapeCsvCell(val);
                });
                lines.push(cells.join(','));
            });
            var content = lines.join('\r\n');
            if (content.length > maxBytes) {
                return { ok: false, tooLarge: true, error: 'Attachment too large for email — use download instead.' };
            }
            var filename = options.filename || ReportKit.util.buildFilename({
                prefix: options.prefix || 'report',
                start_date: options.start_date,
                end_date: options.end_date,
                extension: format === 'excel' ? 'xls' : 'csv'
            });
            return {
                ok: true,
                content: content,
                filename: filename,
                mime: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8'
            };
        },
        send: function (options) {
            options = options || {};
            var $ = jq();
            if (!$) {
                return null;
            }
            if (!this.enabled()) {
                ReportKit.ui.toast('Email export is disabled.', 'warn');
                return null;
            }
            if (!options.sendUrl) {
                ReportKit.ui.toast('Missing sendUrl for mail export.', 'warn');
                return null;
            }
            var assessment = this.assessEmail(options.email);
            if (!assessment.ok) {
                ReportKit.ui.toast(assessment.error, 'warn');
                return null;
            }
            if (typeof options.onBuildStart === 'function') {
                options.onBuildStart();
            }
            var attach = this.buildAttachment(options.format || 'csv', options);
            if (!attach.ok) {
                ReportKit.ui.toast(attach.error, attach.tooLarge ? 'warn' : 'info');
                return null;
            }
            var formData = new FormData();
            formData.append('email', assessment.email);
            if (options.subject) {
                formData.append('subject', options.subject);
            }
            try {
                formData.append('file', new Blob([attach.content], { type: attach.mime }), attach.filename);
            } catch (e) {
                formData.append('file', attach.content, attach.filename);
            }
            if (options.extra && typeof options.extra === 'object') {
                Object.keys(options.extra).forEach(function (key) {
                    formData.append(key, options.extra[key]);
                });
            }
            var csrf = ReportKit.util.getCsrfToken ? ReportKit.util.getCsrfToken() : null;
            if (typeof options.onUploadStart === 'function') {
                options.onUploadStart();
            }
            var ajaxOptions = {
                url: options.sendUrl,
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();
                    if (xhr.upload && typeof options.onUploadProgress === 'function') {
                        xhr.upload.addEventListener('progress', options.onUploadProgress);
                    } else if (xhr.upload) {
                        xhr.upload.addEventListener('progress', function (evt) {
                            if (!evt.lengthComputable) {
                                return;
                            }
                            var pct = Math.round((evt.loaded / evt.total) * 100);
                            ReportKit.ui.setSendUploadProgress(pct, 'Uploading ' + pct + '%…');
                        });
                    }
                    return xhr;
                }
            };
            if (csrf) {
                ajaxOptions.headers = { 'X-CSRF-TOKEN': csrf };
            }
            return $.ajax(ajaxOptions).done(function () {
                ReportKit.log.add('mail', 'Report emailed to ' + assessment.email);
                ReportKit.ui.toast('Report sent.', 'info');
                if (typeof options.onComplete === 'function') {
                    options.onComplete();
                }
            }).fail(function (xhr) {
                var msg = ReportKit.formatReportError
                    ? ReportKit.formatReportError(xhr, 'Could not send report.')
                    : 'Could not send report.';
                ReportKit.ui.toast(msg, 'warn');
                if (typeof options.onError === 'function') {
                    options.onError(msg);
                }
            });
        }
    };

    /**
     * Week-chunk prepare runner (Phase C1 skeleton).
     */
    ReportKit.prepare = ReportKit.prepare || {
        _cancelled: false,
        cancel: function () {
            this._cancelled = true;
        },
        run: function (options) {
            options = options || {};
            var $ = jq();
            if (!$) {
                if (options.onError) {
                    options.onError('jQuery required');
                }
                return;
            }
            var self = this;
            self._cancelled = false;
            var concurrency = Number(ReportKit.util.setting('prepare.concurrency', options.concurrency || 3));
            var weeksUrl = options.weeksUrl;
            var dataUrl = options.dataUrl;
            var params = options.params || {};
            var onProgress = options.onProgress || function () {};
            var onComplete = options.onComplete || function () {};
            var onError = options.onError || function () {};

            if (!weeksUrl || !dataUrl) {
                onError('Missing weeksUrl or dataUrl');
                return;
            }

            ReportKit.store.beginPrepare();
            ReportKit.asyncLoader.show(options.loaderSelector, 'Fetching weeks…');

            $.ajax({
                url: weeksUrl,
                data: params,
                dataType: 'json',
                timeout: ReportKit.util.ajaxTimeoutMs()
            }).done(function (payload) {
                if (self._cancelled) {
                    ReportKit.asyncLoader.hide(options.loaderSelector);
                    return;
                }
                if (payload && payload.error) {
                    ReportKit.asyncLoader.hide(options.loaderSelector);
                    onError(ReportKit.formatReportError ? ReportKit.formatReportError(payload.error) : payload.error);
                    return;
                }
                var weeks = (payload && payload.weeks) ? payload.weeks : [];
                if (!weeks.length) {
                    ReportKit.asyncLoader.hide(options.loaderSelector);
                    ReportKit.store.commit({ reportKey: options.reportKey, fingerprint: options.fingerprint });
                    onComplete(ReportKit.store.rows());
                    return;
                }
                self._fetchPool(
                    weeks,
                    concurrency,
                    dataUrl,
                    params,
                    onProgress,
                    onComplete,
                    onError,
                    options.loaderSelector,
                    { reportKey: options.reportKey, fingerprint: options.fingerprint }
                );
            }).fail(function (xhr, status, errorThrown) {
                ReportKit.asyncLoader.hide(options.loaderSelector);
                if (status === 'timeout') {
                    onError('Prepare timed out — try a shorter date range.');
                    return;
                }
                var parsed = ReportKit.util.parseAjaxJson(xhr, 'Failed to fetch weeks');
                if (!parsed.ok) {
                    onError(parsed.error);
                    return;
                }
                onError(ReportKit.formatReportError ? ReportKit.formatReportError(xhr, errorThrown) : 'Failed to fetch weeks');
            });
        },
        _fetchPool: function (weeks, concurrency, dataUrl, params, onProgress, onComplete, onError, loaderSelector, commitMeta) {
            var $ = jq();
            var self = this;
            var active = 0;
            var cursor = 0;
            var completed = 0;
            commitMeta = commitMeta || {};

            function finish() {
                ReportKit.asyncLoader.hide(loaderSelector);
                var commitResult = ReportKit.store.commit(commitMeta);
                ReportKit.log.add('prepare', 'Prepare complete (' + ReportKit.store.count() + ' rows)', commitResult);
                onComplete(ReportKit.store.rows());
            }

            function next() {
                if (self._cancelled) {
                    ReportKit.asyncLoader.hide(loaderSelector);
                    return;
                }
                if (completed >= weeks.length) {
                    finish();
                    return;
                }
                while (active < concurrency && cursor < weeks.length) {
                    (function (week, pos) {
                        active += 1;
                        var weekParams = $.extend({}, params, week);
                        $.ajax({ url: dataUrl, data: weekParams, dataType: 'json', timeout: ReportKit.util.ajaxTimeoutMs() })
                            .done(function (rows) {
                                var normalized = ReportKit.normalizeWeekRows
                                    ? ReportKit.normalizeWeekRows(rows)
                                    : ($.isArray(rows) ? rows : ((rows && rows.rows) ? rows.rows : []));
                                ReportKit.util.runDeferredUiWork(function () {
                                    ReportKit.store.mergeRows(normalized);
                                    var pct = Math.round(((pos + 1) / weeks.length) * 100);
                                    ReportKit.asyncLoader.setProgress(pct, loaderSelector);
                                    onProgress(pct, ReportKit.store.count());
                                }, function () {
                                    active -= 1;
                                    completed += 1;
                                    if (completed >= weeks.length && active === 0) {
                                        finish();
                                    } else {
                                        next();
                                    }
                                });
                            })
                            .fail(function (xhr, status, errorThrown) {
                                active -= 1;
                                ReportKit.asyncLoader.hide(loaderSelector);
                                if (status === 'timeout') {
                                    onError('Prepare timed out — try a shorter date range.');
                                    return;
                                }
                                var parsed = ReportKit.util.parseAjaxJson(xhr, 'Failed to fetch week data');
                                if (!parsed.ok) {
                                    onError(parsed.error);
                                    return;
                                }
                                var msg = ReportKit.formatReportError
                                    ? ReportKit.formatReportError(xhr, errorThrown || 'Failed to fetch week data')
                                    : 'Failed to fetch week data';
                                onError(msg);
                            });
                    }(weeks[cursor], cursor));
                    cursor += 1;
                }
            }

            next();
        }
    };

    /** Bus migration alias (Phase C8). */
    window.ShohozCommonReport = ReportKit;

    /**
     * Wire LLDP core (lldp-core.js) — secure store, prepare runner factories.
     */
    (function mergeLldpCore() {
        var lldp = window.ReportKitLLDP;
        if (!lldp) {
            return;
        }

        ReportKit.formatReportError = lldp.formatReportError;
        ReportKit.normalizeWeekRows = lldp.normalizeWeekRows;
        ReportKit.createPrepareRunner = lldp.createPrepareRunner;
        ReportKit.createSecurePreparedStore = lldp.createSecurePreparedStore;
        ReportKit.createEtaTracker = lldp.createEtaTracker;
        ReportKit.canUseWebCrypto = lldp.canUseWebCrypto;

        ReportKit.initSecureStore = function (options) {
            options = options || {};
            if (!lldp.createSecurePreparedStore) {
                return null;
            }

            var prefix = ReportKit.util.setting('store.storage_key_prefix', 'reportkit_');
            var reportId = options.reportKey
                || (ReportKit.settings.report && ReportKit.settings.report.id)
                || 'default';
            var secure = lldp.createSecurePreparedStore({
                storageKey: prefix + reportId + '_secure_v1',
                ttlMs: Number(ReportKit.util.setting('store.ttl_ms', 3600000)),
                dedupeKey: ReportKit.util.setting('dedupe.key', null) || options.dedupeKey || null,
                onExpired: options.onExpired
            });
            ReportKit._secureStore = secure;

            var base = ReportKit.store;

            base.beginPrepare = function () {
                secure.beginPrepare({ reportKey: this._reportKey });
                this._rows = [];
                this._persisted = false;
                this._memoryOnly = false;
                this._version += 1;
                return this;
            };

            base.mergeRows = function (rows) {
                secure.mergeRows(rows);
                if (!rows || !rows.length) {
                    return this;
                }
                this._rows = this._rows.concat(rows);
                return this;
            };

            base.commit = function (commitOptions) {
                commitOptions = commitOptions || {};
                this._reportKey = commitOptions.reportKey || this._reportKey
                    || (ReportKit.settings.report && ReportKit.settings.report.id) || null;
                this._fingerprint = commitOptions.fingerprint || this._fingerprint || null;
                secure.setMeta(commitOptions);
                var commitPromise = secure.commit();
                this._persisted = true;
                this._memoryOnly = false;
                ReportKit.log.add('store', 'Secure store committed (' + this._rows.length + ' rows)');
                if (commitPromise && typeof commitPromise.then === 'function') {
                    commitPromise.then(function () {}, function () {});
                }
                return { ok: true, persisted: true, memoryOnly: false, secure: true };
            };

            base.clear = function () {
                secure.clear();
                this._rows = [];
                this._persisted = false;
                this._memoryOnly = false;
                this._version += 1;
                return this;
            };

            base.getPayload = function () {
                return secure.getPayload();
            };

            return secure;
        };

        if (ReportKit.util.setting('store.encryption_enabled', true)) {
            ReportKit.initSecureStore();
        }
        if (ReportKit.notify && typeof ReportKit.notify.bindControls === 'function') {
            ReportKit.notify.bindControls();
        }
    }());

    /**
     * C12 — reload clears prepared store and disables exports until next prepare.
     */
    (function resetOnReload() {
        if (typeof document === 'undefined') {
            return;
        }
        var boot = function () {
            if (ReportKit.store && typeof ReportKit.store.clear === 'function') {
                ReportKit.store.clear();
            }
            if (ReportKit._secureStore && typeof ReportKit._secureStore.clear === 'function') {
                ReportKit._secureStore.clear();
            }
            if (ReportKit.ui && typeof ReportKit.ui.setActionsEnabled === 'function') {
                ReportKit.ui.setActionsEnabled('#rkActionBar', false);
            }
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }());

    /**
     * Public demo simulation driver (Phase L5).
     */
    ReportKit.simulation = ReportKit.simulation || {
        _timer: null,
        run: function (playlist, options) {
            options = options || {};
            playlist = playlist || [];
            var index = 0;
            var speed = Number(options.speed) || 1;
            var self = this;

            function emit(step) {
                if (window.ReportKit && ReportKit.log) {
                    ReportKit.log.add('simulation', step.label || step.id || 'step');
                }
                if (typeof options.onStep === 'function') {
                    options.onStep(step, index);
                }
            }

            function next() {
                if (index >= playlist.length) {
                    if (typeof options.onComplete === 'function') {
                        options.onComplete();
                    }
                    return;
                }
                var step = playlist[index];
                index += 1;
                emit(step);
                var delay = Number(step.delayMs || 800) / speed;
                self._timer = setTimeout(next, delay);
            }

            if (typeof options.onStart === 'function') {
                options.onStart(playlist);
            }
            next();
        },
        pause: function () {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
        }
    };

    window.ReportKit = ReportKit;
}(window));
