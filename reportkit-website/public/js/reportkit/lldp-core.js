/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * lldp-core.js — ReportKit browser module.
 */

/**
 * @lorapok-labs/reportkit-ui — LLDP browser core (prepare runner + secure store).
 * Load after jQuery; before or after reportkit.js (reportkit.js merges on init).
 */
(function (window) {
    'use strict';

    function $() {
        return window.jQuery;
    }

    function formatReportError(value, fallback) {
        if (fallback === undefined || fallback === null) {
            fallback = 'Failed to prepare export data.';
        }
        if (value == null || value === '') {
            return fallback;
        }
        if (typeof value === 'string') {
            return value === 'error' ? fallback : value;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        if (typeof value !== 'object') {
            return fallback;
        }

        var jq = $();
        if (value.responseJSON) {
            return formatReportError(value.responseJSON, fallback);
        }
        if (typeof value.responseText === 'string' && value.responseText && jq) {
            try {
                return formatReportError(jq.parseJSON(value.responseText), fallback);
            } catch (e) {
                // continue
            }
        }
        if (typeof value.error === 'string' && value.error) {
            return value.error;
        }
        if (value.error != null && value.error !== value) {
            return formatReportError(value.error, fallback);
        }
        if (typeof value.message === 'string' && value.message) {
            return value.message;
        }

        try {
            var keys = Object.keys(value);
            for (var i = 0; i < keys.length; i++) {
                var entry = value[keys[i]];
                if (typeof entry === 'string' && entry) {
                    return entry;
                }
                if (jq && jq.isArray(entry) && entry.length && typeof entry[0] === 'string') {
                    return entry[0];
                }
            }
        } catch (e2) {}

        try {
            var encoded = JSON.stringify(value);
            if (encoded && encoded !== '{}' && encoded !== '[]') {
                return encoded;
            }
        } catch (e3) {}

        return fallback;
    }

    /**
     * Normalize week data endpoint: bare array or { rows, count } wrapper.
     */
    function normalizeWeekRows(payload) {
        if (payload == null) {
            return [];
        }
        if (Object.prototype.toString.call(payload) === '[object Array]') {
            return payload;
        }
        if (typeof payload === 'object') {
            if (Object.prototype.toString.call(payload.rows) === '[object Array]') {
                return payload.rows;
            }
            if (Object.prototype.toString.call(payload.data) === '[object Array]') {
                return payload.data;
            }
        }
        return [];
    }

    function formatDurationSeconds(sec) {
        if (sec == null || !isFinite(sec) || sec < 0) {
            return 'estimating…';
        }
        if (sec < 3) {
            return 'a few seconds';
        }
        if (sec < 60) {
            return Math.ceil(sec) + 's';
        }
        var mins = Math.floor(sec / 60);
        var rem = Math.ceil(sec % 60);
        if (mins < 60) {
            return rem > 0 ? (mins + 'm ' + rem + 's') : (mins + 'm');
        }
        var hours = Math.floor(mins / 60);
        var minsLeft = mins % 60;
        return minsLeft > 0 ? (hours + 'h ' + minsLeft + 'm') : (hours + 'h');
    }

    function createEtaTracker(totalUnits) {
        var total = Math.max(0, parseInt(totalUnits, 10) || 0);
        var startedAt = Date.now();

        return {
            total: total,
            reset: function (nextTotal) {
                total = Math.max(0, parseInt(nextTotal, 10) || 0);
                this.total = total;
                startedAt = Date.now();
            },
            update: function (doneCount, prefix) {
                var done = Math.max(0, Math.min(total, parseInt(doneCount, 10) || 0));
                var elapsed = (Date.now() - startedAt) / 1000;
                var pct = total ? Math.round((done / total) * 100) : 100;
                var rate = done / Math.max(elapsed, 0.35);
                var etaSec = (done > 0 && rate > 0) ? ((total - done) / rate) : null;
                if (done <= 0) {
                    etaSec = null;
                }
                var etaText = (done >= total)
                    ? 'finishing…'
                    : (etaSec == null ? 'estimating…' : ('~' + formatDurationSeconds(etaSec) + ' left'));
                var head = prefix ? (String(prefix) + ' ') : '';
                return {
                    pct: pct,
                    etaSec: etaSec,
                    elapsedSec: elapsed,
                    done: done,
                    total: total,
                    etaText: etaText,
                    label: head + pct + '% · ' + etaText,
                    buttonLabel: head + pct + '% · ' + etaText
                };
            }
        };
    }

    function getInclusiveDayCount(start, end) {
        var startParts = start.split('-').map(function (v) { return parseInt(v, 10); });
        var endParts = end.split('-').map(function (v) { return parseInt(v, 10); });
        var startDateObj = new Date(startParts[0], startParts[1] - 1, startParts[2]);
        var endDateObj = new Date(endParts[0], endParts[1] - 1, endParts[2]);
        return Math.floor((endDateObj - startDateObj) / 86400000) + 1;
    }

    function createPrepareRunner(options) {
        options = options || {};
        var jq = $();
        if (!jq) {
            throw new Error('ReportKit LLDP prepare runner requires jQuery');
        }

        var concurrency = parseInt(options.concurrency, 10);
        if (!concurrency || concurrency < 1) {
            concurrency = 3;
        }

        var state = { xhrs: [], aborted: false, running: false, finished: null };

        function trackXhr(xhr) {
            state.xhrs.push(xhr);
        }

        function abortTrackedXhrs() {
            jq.each(state.xhrs, function (_, xhr) {
                if (xhr && xhr.readyState !== 4) {
                    xhr.abort();
                }
            });
            state.xhrs = [];
        }

        function setProgress(percent, label, etaText) {
            percent = Math.max(0, Math.min(100, percent));
            if (typeof options.onProgress === 'function') {
                options.onProgress(percent, label, etaText);
            }
        }

        function start(baseParams) {
            abortTrackedXhrs();
            state.aborted = false;
            state.running = true;
            state.finished = null;
            baseParams = baseParams || {};

            if (typeof options.onStart === 'function') {
                options.onStart(baseParams);
            }
            setProgress(0, options.initialLabel || 'Initializing', 'estimating…');

            var master = jq.Deferred();
            var ajaxTimeout = typeof options.timeoutMs === 'number' ? options.timeoutMs : 120000;

            jq.ajax({
                url: options.weeksUrl,
                type: 'GET',
                dataType: 'json',
                timeout: ajaxTimeout,
                data: {
                    start_date: baseParams.start_date,
                    end_date: baseParams.end_date
                },
                beforeSend: function (xhr) {
                    trackXhr(xhr);
                }
            }).done(function (response) {
                if (state.aborted) {
                    master.reject('aborted');
                    return;
                }
                if (response && response.error) {
                    master.reject(formatReportError(response.error));
                    return;
                }
                var weeks = (response && response.weeks) ? response.weeks : [];
                if (!weeks.length) {
                    master.reject('No weeks found for the selected date range.');
                    return;
                }
                prepareByWeeks(baseParams, weeks)
                    .done(function () { master.resolve(); })
                    .fail(function (err) { master.reject(err); });
            }).fail(function (xhr, status, errorThrown) {
                if (status === 'abort' || errorThrown === 'aborted') {
                    master.reject('aborted');
                    return;
                }
                master.reject(formatReportError(xhr, formatReportError(errorThrown)));
            });

            master.done(function () {
                if (state.aborted || state.finished === 'error' || state.finished === 'cancel') {
                    return;
                }
                state.finished = 'success';
                state.running = false;
                if (typeof options.onComplete === 'function') {
                    options.onComplete();
                }
            }).fail(function (err, status, errorThrown) {
                state.running = false;
                var normalized = formatReportError(err, formatReportError(errorThrown));
                if (
                    state.finished === 'success'
                    || state.aborted
                    || status === 'abort'
                    || errorThrown === 'aborted'
                    || normalized === 'aborted'
                ) {
                    return;
                }
                state.finished = 'error';
                if (typeof options.onError === 'function') {
                    options.onError(normalized);
                }
            });

            return master.promise();
        }

        function cancel() {
            state.aborted = true;
            state.finished = 'cancel';
            abortTrackedXhrs();
            state.running = false;
            if (typeof options.onCancel === 'function') {
                options.onCancel();
            }
        }

        function fetchWeek(params) {
            var ajaxTimeout = typeof options.timeoutMs === 'number' ? options.timeoutMs : 120000;
            return jq.ajax({
                url: options.dataUrl,
                type: 'GET',
                dataType: 'json',
                timeout: ajaxTimeout,
                data: params,
                beforeSend: function (xhr) {
                    trackXhr(xhr);
                }
            });
        }

        function prepareByWeeks(baseParams, weeks) {
            var total = weeks.length;
            var completed = 0;
            var nextIndex = 0;
            var dayCount = getInclusiveDayCount(baseParams.start_date, baseParams.end_date);
            var dayThreshold = typeof options.dayLabelUnderDays === 'number' ? options.dayLabelUnderDays : 7;
            var useDayLabel = dayCount < dayThreshold;
            var deferred = jq.Deferred();
            var active = 0;
            var weekEta = createEtaTracker(total);

            function failWith(err) {
                if (deferred.state() !== 'pending') {
                    return;
                }
                state.aborted = true;
                abortTrackedXhrs();
                deferred.reject(formatReportError(err));
            }

            function refreshProgress() {
                var eta = weekEta.update(completed);
                setProgress(eta.pct, 'Week ' + Math.min(completed + 1, total) + ' of ' + total, eta.etaText);
            }

            function pump() {
                if (state.aborted) {
                    failWith('aborted');
                    return;
                }
                if (completed >= total) {
                    setProgress(100, 'Complete', 'done');
                    deferred.resolve();
                    return;
                }

                while (active < concurrency && nextIndex < total && !state.aborted) {
                    (function (week, weekNumber) {
                        active += 1;
                        var weekParams = jq.extend({}, baseParams, {
                            week_start: week.start,
                            week_end: week.end
                        });
                        refreshProgress();

                        fetchWeek(weekParams).done(function (payload) {
                            active -= 1;
                            if (state.aborted || deferred.state() !== 'pending') {
                                return;
                            }
                            if (payload && payload.error) {
                                failWith(payload.error);
                                return;
                            }
                            var rows = normalizeWeekRows(payload);
                            if (typeof options.onWeekRows === 'function') {
                                options.onWeekRows(rows, week, weekNumber - 1);
                            }
                            completed += 1;
                            refreshProgress();
                            pump();
                        }).fail(function (xhr, status, error) {
                            active -= 1;
                            if (state.aborted || deferred.state() !== 'pending') {
                                return;
                            }
                            if (status === 'abort' || error === 'aborted') {
                                failWith('aborted');
                                return;
                            }
                            failWith(formatReportError(xhr, formatReportError(error)));
                        });
                    }(weeks[nextIndex], nextIndex + 1));
                    nextIndex += 1;
                }
            }

            pump();
            return deferred.promise();
        }

        if (options.cancelBtnSelector) {
            jq(document).off('click.reportkitPrepareCancel', options.cancelBtnSelector)
                .on('click.reportkitPrepareCancel', options.cancelBtnSelector, function () {
                    cancel();
                });
        }

        return {
            start: start,
            cancel: cancel,
            isRunning: function () { return state.running; },
            setProgress: setProgress
        };
    }

    var PREPARED_DEFAULT_TTL_MS = 60 * 60 * 1000;

    function bytesToBase64(bytes) {
        var binary = '';
        var chunk = 0x8000;
        for (var i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        return btoa(binary);
    }

    function base64ToBytes(b64) {
        var binary = atob(b64);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    function canUseWebCrypto() {
        try {
            return !!(window.crypto && window.crypto.subtle && window.isSecureContext);
        } catch (e) {
            return false;
        }
    }

    function parsePreparedAtMs(iso) {
        if (!iso) {
            return NaN;
        }
        var parsed = Date.parse(String(iso));
        return isNaN(parsed) ? NaN : parsed;
    }

    function isPreparedPayloadExpired(payload, ttlMs) {
        var preparedAtMs = parsePreparedAtMs(payload && payload.preparedAt);
        if (isNaN(preparedAtMs)) {
            return false;
        }
        return (Date.now() - preparedAtMs) >= ttlMs;
    }

    function createSecurePreparedStore(options) {
        options = options || {};
        var jq = $();
        var storageKey = options.storageKey || 'reportkit_prepared_v1';
        var ttlMs = typeof options.ttlMs === 'number' ? options.ttlMs : PREPARED_DEFAULT_TTL_MS;
        var canPurgeFn = typeof options.canPurge === 'function' ? options.canPurge : function () { return true; };
        var onExpiredFn = typeof options.onExpired === 'function' ? options.onExpired : null;
        var dedupeKey = options.dedupeKey || null;
        var useCrypto = canUseWebCrypto();
        var aesKey = null;
        var fallbackKeyBytes = null;
        var workingByKey = {};
        var workingMeta = {};
        var memoryCipher = null;
        var cleared = true;
        var bound = false;
        var ttlTimerId = null;
        var unlockedPayload = null;
        var rowSeq = 0;

        function storageAvailable() {
            try {
                var k = '__reportkit_probe__';
                sessionStorage.setItem(k, '1');
                sessionStorage.removeItem(k);
                return true;
            } catch (e) {
                return false;
            }
        }

        function writeCipherPayload(payloadObj) {
            var encoded = JSON.stringify(payloadObj);
            memoryCipher = encoded;
            try {
                if (storageAvailable()) {
                    sessionStorage.setItem(storageKey, encoded);
                }
            } catch (e) {
                try {
                    sessionStorage.removeItem(storageKey);
                } catch (e2) {}
            }
        }

        function readCipherPayload() {
            if (memoryCipher) {
                return memoryCipher;
            }
            if (storageAvailable()) {
                return sessionStorage.getItem(storageKey);
            }
            return null;
        }

        function removeCipherPayload() {
            memoryCipher = null;
            try {
                sessionStorage.removeItem(storageKey);
            } catch (e) {}
        }

        function clearWorking() {
            workingByKey = {};
            workingMeta = {};
            rowSeq = 0;
        }

        function wipeKeys() {
            aesKey = null;
            fallbackKeyBytes = null;
        }

        function cancelTtlPurge() {
            if (ttlTimerId) {
                window.clearTimeout(ttlTimerId);
                ttlTimerId = null;
            }
        }

        function expirePreparedData() {
            clear();
            if (onExpiredFn) {
                onExpiredFn();
            }
        }

        function purgeIfExpired() {
            if (unlockedPayload && isPreparedPayloadExpired(unlockedPayload, ttlMs)) {
                expirePreparedData();
                return true;
            }
            return false;
        }

        function scheduleTtlPurge(preparedAtIso) {
            cancelTtlPurge();
            var preparedAtMs = parsePreparedAtMs(preparedAtIso);
            if (isNaN(preparedAtMs)) {
                return;
            }
            var delay = (preparedAtMs + ttlMs) - Date.now();
            if (delay <= 0) {
                if (canPurgeFn()) {
                    expirePreparedData();
                } else {
                    ttlTimerId = window.setTimeout(function () {
                        scheduleTtlPurge(preparedAtIso);
                    }, 30000);
                }
                return;
            }
            ttlTimerId = window.setTimeout(function () {
                ttlTimerId = null;
                if (purgeIfExpired()) {
                    return;
                }
                if (canPurgeFn()) {
                    expirePreparedData();
                } else {
                    scheduleTtlPurge(preparedAtIso);
                }
            }, delay);
        }

        function assertPayloadFresh(payload) {
            if (payload && isPreparedPayloadExpired(payload, ttlMs)) {
                expirePreparedData();
                return false;
            }
            return true;
        }

        function clear() {
            cancelTtlPurge();
            clearWorking();
            wipeKeys();
            removeCipherPayload();
            unlockedPayload = null;
            cleared = true;
        }

        function bindLifecycle() {
            if (bound) {
                return;
            }
            bound = true;
            clear();
            if (jq) {
                jq(window).on('beforeunload.reportkitPreparedStore', function () {
                    clear();
                });
            }
        }

        function ensureFallbackKey() {
            if (fallbackKeyBytes) {
                return fallbackKeyBytes;
            }
            var bytes = new Uint8Array(32);
            if (window.crypto && window.crypto.getRandomValues) {
                window.crypto.getRandomValues(bytes);
            } else {
                for (var i = 0; i < bytes.length; i++) {
                    bytes[i] = Math.floor(Math.random() * 256);
                }
            }
            fallbackKeyBytes = bytes;
            return fallbackKeyBytes;
        }

        function xorObfuscate(bytes, keyBytes) {
            var out = new Uint8Array(bytes.length);
            for (var i = 0; i < bytes.length; i++) {
                out[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
            }
            return out;
        }

        function encodeUtf8(str) {
            if (window.TextEncoder) {
                return new TextEncoder().encode(str);
            }
            var utf8 = unescape(encodeURIComponent(str));
            var bytes = new Uint8Array(utf8.length);
            for (var i = 0; i < utf8.length; i++) {
                bytes[i] = utf8.charCodeAt(i);
            }
            return bytes;
        }

        function decodeUtf8(bytes) {
            if (window.TextDecoder) {
                return new TextDecoder().decode(bytes);
            }
            var binary = '';
            for (var i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return decodeURIComponent(escape(binary));
        }

        function asJqueryPromise(maybePromise) {
            if (!jq) {
                return maybePromise;
            }
            if (maybePromise && typeof maybePromise.then === 'function' && typeof maybePromise.done !== 'function') {
                var d = jq.Deferred();
                maybePromise.then(function (value) {
                    d.resolve(value);
                }, function (err) {
                    d.reject(err);
                });
                return d.promise();
            }
            return maybePromise;
        }

        function encryptPayload(plainObject) {
            var deferred = jq ? jq.Deferred() : { promise: function () { return plainObject; } };
            var json;
            try {
                json = JSON.stringify(plainObject);
            } catch (e) {
                cleared = false;
                if (jq) {
                    deferred.resolve(true);
                    return deferred.promise();
                }
                return Promise.resolve(true);
            }

            var persistEncrypted = json.length < 1500000;
            if (!persistEncrypted) {
                memoryCipher = null;
                try {
                    sessionStorage.removeItem(storageKey);
                } catch (eSkip) {}
                cleared = false;
                if (jq) {
                    deferred.resolve(true);
                    return deferred.promise();
                }
                return Promise.resolve(true);
            }

            var encoded = encodeUtf8(json);

            if (useCrypto) {
                var iv = window.crypto.getRandomValues(new Uint8Array(12));
                var keyReady = aesKey
                    ? (jq ? jq.Deferred().resolve(aesKey).promise() : Promise.resolve(aesKey))
                    : asJqueryPromise(window.crypto.subtle.generateKey(
                        { name: 'AES-GCM', length: 256 },
                        false,
                        ['encrypt', 'decrypt']
                    ));

                asJqueryPromise(keyReady).done(function (key) {
                    aesKey = key;
                    asJqueryPromise(window.crypto.subtle.encrypt(
                        { name: 'AES-GCM', iv: iv },
                        key,
                        encoded
                    )).done(function (cipherBuf) {
                        writeCipherPayload({
                            v: 1,
                            alg: 'AES-GCM',
                            iv: bytesToBase64(iv),
                            data: bytesToBase64(new Uint8Array(cipherBuf))
                        });
                        cleared = false;
                        deferred.resolve(true);
                    }).fail(function () {
                        cleared = false;
                        deferred.resolve(true);
                    });
                }).fail(function () {
                    cleared = false;
                    deferred.resolve(true);
                });
                return deferred.promise();
            }

            try {
                var keyBytes = ensureFallbackKey();
                var mixed = xorObfuscate(encoded, keyBytes);
                writeCipherPayload({
                    v: 1,
                    alg: 'XOR-B64',
                    data: bytesToBase64(mixed)
                });
                cleared = false;
                deferred.resolve(true);
            } catch (e) {
                cleared = false;
                deferred.resolve(true);
            }
            return deferred.promise();
        }

        function decryptPayload() {
            var deferred = jq ? jq.Deferred() : null;
            if (unlockedPayload) {
                if (!assertPayloadFresh(unlockedPayload)) {
                    var expiredMsg = 'Prepared report data expired (1 hour). Please Fetch & Prepare again.';
                    if (deferred) {
                        deferred.reject(expiredMsg);
                        return deferred.promise();
                    }
                    return Promise.reject(new Error(expiredMsg));
                }
                if (deferred) {
                    deferred.resolve(unlockedPayload);
                    return deferred.promise();
                }
                return Promise.resolve(unlockedPayload);
            }

            var raw = readCipherPayload();
            if (!raw) {
                var missingMsg = 'No prepared report data found. Please Fetch & Prepare again.';
                if (deferred) {
                    deferred.reject(missingMsg);
                    return deferred.promise();
                }
                return Promise.reject(new Error(missingMsg));
            }

            var envelope;
            try {
                envelope = JSON.parse(raw);
            } catch (e) {
                var corruptMsg = 'Prepared report data is corrupted. Please Fetch & Prepare again.';
                if (deferred) {
                    deferred.reject(corruptMsg);
                    return deferred.promise();
                }
                return Promise.reject(new Error(corruptMsg));
            }

            if (envelope.alg === 'AES-GCM') {
                if (!aesKey || !useCrypto) {
                    var sessionMsg = 'Prepared report session expired. Please Fetch & Prepare again.';
                    if (deferred) {
                        deferred.reject(sessionMsg);
                        return deferred.promise();
                    }
                    return Promise.reject(new Error(sessionMsg));
                }
                var iv = base64ToBytes(envelope.iv);
                var data = base64ToBytes(envelope.data);
                asJqueryPromise(window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, aesKey, data))
                    .done(function (plainBuf) {
                        try {
                            unlockedPayload = JSON.parse(decodeUtf8(new Uint8Array(plainBuf)));
                            if (!assertPayloadFresh(unlockedPayload)) {
                                deferred.reject('Prepared report data expired (1 hour). Please Fetch & Prepare again.');
                                return;
                            }
                            deferred.resolve(unlockedPayload);
                        } catch (e2) {
                            deferred.reject('Failed to read prepared report data.');
                        }
                    })
                    .fail(function () {
                        deferred.reject('Failed to decrypt prepared report data. Please Fetch & Prepare again.');
                    });
                return deferred.promise();
            }

            if (envelope.alg === 'XOR-B64') {
                if (!fallbackKeyBytes) {
                    deferred.reject('Prepared report session expired. Please Fetch & Prepare again.');
                    return deferred.promise();
                }
                try {
                    unlockedPayload = JSON.parse(decodeUtf8(xorObfuscate(base64ToBytes(envelope.data), fallbackKeyBytes)));
                    if (!assertPayloadFresh(unlockedPayload)) {
                        deferred.reject('Prepared report data expired (1 hour). Please Fetch & Prepare again.');
                        return deferred.promise();
                    }
                    deferred.resolve(unlockedPayload);
                } catch (e3) {
                    deferred.reject('Failed to read prepared report data.');
                }
                return deferred.promise();
            }

            deferred.reject('Unsupported prepared report format. Please Fetch & Prepare again.');
            return deferred.promise();
        }

        function defaultRowMerge(row, map) {
            row = jq ? jq.extend({}, row) : Object.assign({}, row);
            var key;
            if (dedupeKey && row[dedupeKey] != null && row[dedupeKey] !== '') {
                key = String(row[dedupeKey]);
            } else {
                rowSeq += 1;
                key = '__row_' + rowSeq;
            }
            map[key] = row;
        }

        bindLifecycle();

        return {
            clear: clear,
            isEmpty: function () {
                return !unlockedPayload && (cleared || !readCipherPayload());
            },
            beginPrepare: function (meta) {
                clear();
                cleared = false;
                workingMeta = jq ? jq.extend({}, meta || {}) : (meta || {});
                workingByKey = {};
                rowSeq = 0;
            },
            setMeta: function (meta) {
                workingMeta = jq ? jq.extend({}, workingMeta, meta || {}) : Object.assign({}, workingMeta, meta || {});
            },
            mergeRows: function (rows, mergeFn) {
                mergeFn = typeof mergeFn === 'function' ? mergeFn : defaultRowMerge;
                jq.each(rows || [], function (_, row) {
                    mergeFn(row, workingByKey);
                });
            },
            commit: function () {
                var rows = [];
                jq.each(workingByKey, function (_, row) {
                    rows.push(row);
                });
                var payload = {
                    meta: jq ? jq.extend({}, workingMeta) : Object.assign({}, workingMeta),
                    rows: rows,
                    preparedAt: (new Date()).toISOString()
                };
                unlockedPayload = payload;
                clearWorking();
                cleared = false;
                scheduleTtlPurge(payload.preparedAt);
                return encryptPayload(payload);
            },
            getPayload: function () {
                return decryptPayload();
            },
            getRows: function () {
                return decryptPayload().then(function (payload) {
                    return (payload && payload.rows) ? payload.rows : [];
                });
            },
            rowsSync: function () {
                return unlockedPayload && unlockedPayload.rows ? unlockedPayload.rows.slice(0) : [];
            },
            purgeIfExpired: purgeIfExpired,
            getPreparedTtlMs: function () {
                return ttlMs;
            }
        };
    }

    window.ReportKitLLDP = {
        formatReportError: formatReportError,
        normalizeWeekRows: normalizeWeekRows,
        createEtaTracker: createEtaTracker,
        createPrepareRunner: createPrepareRunner,
        createSecurePreparedStore: createSecurePreparedStore,
        canUseWebCrypto: canUseWebCrypto
    };
}(window));
