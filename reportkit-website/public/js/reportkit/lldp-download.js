/**
 * Lorapok ReportKit
 * Copyright (c) 2026 Lorapok Labs (https://lorapok.tech)
 * Licensed under the Lorapok Non-Commercial License 1.0 (Lorapok-NCL-1.0)
 *
 * lldp-download.js — download runner, stream CSV, jsPDF compose, PDF merge.
 */
(function (window) {
    'use strict';

    function $() {
        return window.jQuery;
    }

    function formatReportError(value, fallback) {
        if (window.ReportKitLLDP && window.ReportKitLLDP.formatReportError) {
            return window.ReportKitLLDP.formatReportError(value, fallback);
        }
        return fallback || 'Download failed.';
    }

    function scheduleYield(fn) {
        window.setTimeout(fn, 0);
    }

    function resolveJsPdfConstructor() {
        if (window.jspdf && window.jspdf.jsPDF) {
            return window.jspdf.jsPDF;
        }
        if (typeof window.jsPDF === 'function') {
            return window.jsPDF;
        }
        return null;
    }

    function jsPdfHasAutoTable() {
        var JsPDF = resolveJsPdfConstructor();
        if (!JsPDF) {
            return false;
        }
        if (typeof JsPDF.prototype.autoTable === 'function') {
            return true;
        }
        try {
            var probe = new JsPDF();
            return typeof probe.autoTable === 'function';
        } catch (e) {
            return false;
        }
    }

    function ensureJsPdf(onReady) {
        if (jsPdfHasAutoTable()) {
            onReady(null, { jsPDF: resolveJsPdfConstructor() });
            return;
        }
        function waitAuto(done) {
            var tries = 0;
            var timer = window.setInterval(function () {
                tries += 1;
                if (jsPdfHasAutoTable()) {
                    window.clearInterval(timer);
                    done(null, { jsPDF: resolveJsPdfConstructor() });
                } else if (tries > 200) {
                    window.clearInterval(timer);
                    done(new Error('PDF library failed to load.'));
                }
            }, 50);
        }
        function loadAuto() {
            var id = 'reportkit-jspdf-autotable-cdn';
            if (document.getElementById(id)) {
                waitAuto(onReady);
                return;
            }
            var s = document.createElement('script');
            s.id = id;
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
            s.onload = function () { waitAuto(onReady); };
            s.onerror = function () { onReady(new Error('jspdf-autotable CDN failed.')); };
            document.head.appendChild(s);
        }
        function loadPdf() {
            var id = 'reportkit-jspdf-cdn';
            if (document.getElementById(id)) {
                if (resolveJsPdfConstructor()) {
                    loadAuto();
                } else {
                    waitAuto(onReady);
                }
                return;
            }
            var s = document.createElement('script');
            s.id = id;
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            s.onload = function () {
                if (!resolveJsPdfConstructor()) {
                    onReady(new Error('jsPDF global missing.'));
                    return;
                }
                if (jsPdfHasAutoTable()) {
                    onReady(null, { jsPDF: resolveJsPdfConstructor() });
                } else {
                    loadAuto();
                }
            };
            s.onerror = function () { onReady(new Error('jsPDF CDN failed.')); };
            document.head.appendChild(s);
        }
        loadPdf();
    }

    function ensurePdfLib(onReady) {
        if (window.PDFLib && window.PDFLib.PDFDocument) {
            onReady(null, window.PDFLib);
            return;
        }
        var id = 'reportkit-pdf-lib-cdn';
        if (document.getElementById(id)) {
            var tries = 0;
            var timer = window.setInterval(function () {
                tries += 1;
                if (window.PDFLib && window.PDFLib.PDFDocument) {
                    window.clearInterval(timer);
                    onReady(null, window.PDFLib);
                } else if (tries > 120) {
                    window.clearInterval(timer);
                    onReady(new Error('pdf-lib failed to load.'));
                }
            }, 50);
            return;
        }
        var s = document.createElement('script');
        s.id = id;
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        s.onload = function () {
            if (window.PDFLib && window.PDFLib.PDFDocument) {
                onReady(null, window.PDFLib);
            } else {
                onReady(new Error('PDFLib global missing.'));
            }
        };
        s.onerror = function () { onReady(new Error('pdf-lib CDN failed.')); };
        document.head.appendChild(s);
    }

    function pdfDocumentToBlob(doc) {
        try {
            var ab = doc.output('arraybuffer');
            if (ab && ab.byteLength > 0) {
                return new Blob([ab], { type: 'application/pdf' });
            }
        } catch (e) {}
        return doc.output('blob');
    }

    function mergePdfPartsToSingleBlob(parts, onDone, onProgress, isCancelled) {
        ensurePdfLib(function (err, PDFLib) {
            if (err) {
                onDone(err);
                return;
            }
            function cancelled() {
                return typeof isCancelled === 'function' && isCancelled();
            }
            function toAb(part) {
                if (part instanceof ArrayBuffer) {
                    return Promise.resolve(part);
                }
                if (part instanceof Blob && part.arrayBuffer) {
                    return part.arrayBuffer();
                }
                return Promise.reject(new Error('Unsupported PDF part.'));
            }
            PDFLib.PDFDocument.create().then(function (merged) {
                var idx = 0;
                function next() {
                    if (cancelled()) {
                        onDone(new Error('cancelled'));
                        return;
                    }
                    if (idx >= parts.length) {
                        return merged.save().then(function (bytes) {
                            onDone(null, new Blob([bytes], { type: 'application/pdf' }));
                        });
                    }
                    if (onProgress) {
                        onProgress(Math.round((idx / parts.length) * 90), 'Merging part ' + (idx + 1));
                    }
                    return toAb(parts[idx++]).then(function (ab) {
                        return PDFLib.PDFDocument.load(ab).then(function (src) {
                            return merged.copyPages(src, src.getPageIndices()).then(function (pages) {
                                pages.forEach(function (p) { merged.addPage(p); });
                                return scheduleYieldPromise(next);
                            });
                        });
                    });
                }
                next().catch(function (e) { onDone(e); });
            }).catch(function (e) { onDone(e); });
        });
    }

    function scheduleYieldPromise(fn) {
        return new Promise(function (resolve) {
            scheduleYield(function () { resolve(fn()); });
        });
    }

    function shouldStreamCsvDownload(rowCount, returnBlob) {
        if (returnBlob) {
            return false;
        }
        var threshold = 50000;
        if (window.ReportKit && ReportKit.util && ReportKit.util.setting) {
            threshold = Number(ReportKit.util.setting('export.stream_csv_row_threshold', threshold));
        }
        return supportsStreamSaver() && (Number(rowCount) || 0) >= threshold;
    }

    function supportsStreamSaver() {
        return !!(window.WritableStream && window.TextEncoder);
    }

    function ensureStreamSaver(onReady) {
        if (window.streamSaver && window.streamSaver.createWriteStream) {
            if (window.streamSaver.mitm) {
                onReady(null);
                return;
            }
        }
        var id = 'reportkit-streamsaver-cdn';
        if (document.getElementById(id)) {
            var tries = 0;
            var timer = window.setInterval(function () {
                tries += 1;
                if (window.streamSaver && window.streamSaver.createWriteStream) {
                    window.clearInterval(timer);
                    onReady(null);
                } else if (tries > 120) {
                    window.clearInterval(timer);
                    onReady(new Error('StreamSaver failed to load.'));
                }
            }, 50);
            return;
        }
        var s = document.createElement('script');
        s.id = id;
        s.src = 'https://cdn.jsdelivr.net/npm/streamsaver@2.0.6/StreamSaver.min.js';
        s.onload = function () {
            if (window.streamSaver) {
                window.streamSaver.mitm = 'https://jimmywarting.github.io/StreamSaver.js/mitm.html';
                onReady(null);
            } else {
                onReady(new Error('StreamSaver global missing.'));
            }
        };
        s.onerror = function () { onReady(new Error('StreamSaver CDN failed.')); };
        document.head.appendChild(s);
    }

    function processInChunksAsync(items, chunkSize, eachChunkAsync, onProgress, isCancelled) {
        return new Promise(function (resolve, reject) {
            var list = items || [];
            var total = list.length;
            var size = Number(chunkSize) || 400;
            var index = 0;

            function cancelled() {
                return typeof isCancelled === 'function' && isCancelled();
            }

            function step() {
                if (cancelled()) {
                    reject(new Error('cancelled'));
                    return;
                }
                if (index >= total) {
                    if (onProgress) {
                        onProgress(total, total);
                    }
                    resolve();
                    return;
                }
                var end = Math.min(index + size, total);
                Promise.resolve(eachChunkAsync(list, index, end)).then(function () {
                    index = end;
                    if (onProgress) {
                        onProgress(index, total);
                    }
                    scheduleYield(step);
                }).catch(reject);
            }

            scheduleYield(step);
        });
    }

    function buildStreamCsvDownload(rows, options) {
        options = options || {};
        rows = rows || [];
        var columns = inferColumns(rows, options.columns);
        var chunkSize = Number(options.chunkSize || 400);
        if (window.ReportKit && ReportKit.util && ReportKit.util.setting) {
            chunkSize = Number(ReportKit.util.setting('export.csv_chunk_rows', chunkSize));
        }
        var RK = window.ReportKit || {};
        var filename = options.filename || buildFilename(options, 'csv');
        var runner = { cancelled: false };

        if (RK.ui && RK.ui.setDownloadStatus) {
            RK.ui.setDownloadStatus({
                selector: options.statusSelector || '#rkDownloadStatus',
                hidden: false,
                label: 'Streaming CSV…',
                pct: 0
            });
        }

        function fail(msg) {
            if (RK.ui && RK.ui.toast) {
                RK.ui.toast(msg, 'warn');
            }
            if (RK.ui && RK.ui.setDownloadStatus) {
                RK.ui.setDownloadStatus({ selector: options.statusSelector || '#rkDownloadStatus', hidden: true });
            }
            if (options.onError) {
                options.onError(msg);
            }
        }

        if (!rows.length) {
            fail('No prepared rows for CSV.');
            return { ok: false };
        }

        ensureStreamSaver(function (err) {
            if (err) {
                fail(formatReportError(err));
                return;
            }
            try {
                var fileStream = window.streamSaver.createWriteStream(filename);
                var writer = fileStream.getWriter();
                var encoder = new TextEncoder();
                var header = columns.map(function (col) {
                    if (window.ReportKit && ReportKit.util && ReportKit.util.escapeCsvCell) {
                        return ReportKit.util.escapeCsvCell(col.label || col.key || col);
                    }
                    return String(col.label || col.key || col).replace(/"/g, '""');
                }).join(',');

                writer.write(encoder.encode(header + '\r\n')).then(function () {
                    return processInChunksAsync(rows, chunkSize, function (list, start, end) {
                        var slice = list.slice(start, end);
                        var lines = slice.map(function (row) {
                            return columns.map(function (col) {
                                var key = col.key || col;
                                var val = row && typeof row === 'object' ? row[key] : row;
                                if (window.ReportKit && ReportKit.util && ReportKit.util.escapeCsvCell) {
                                    return ReportKit.util.escapeCsvCell(val);
                                }
                                return String(val == null ? '' : val).replace(/"/g, '""');
                            }).join(',');
                        }).join('\r\n');
                        if (!lines.length) {
                            return Promise.resolve();
                        }
                        return writer.write(encoder.encode(lines + '\r\n'));
                    }, function (done, total) {
                        if (RK.ui && RK.ui.setDownloadStatus) {
                            RK.ui.setDownloadStatus({
                                selector: options.statusSelector || '#rkDownloadStatus',
                                label: 'Streaming CSV…',
                                pct: total ? Math.round((done / total) * 100) : 0
                            });
                        }
                    }, function () { return runner.cancelled; });
                }).then(function () {
                    return writer.close();
                }).then(function () {
                    if (RK.ui && RK.ui.setDownloadStatus) {
                        RK.ui.setDownloadStatus({ selector: options.statusSelector || '#rkDownloadStatus', hidden: true });
                    }
                    if (RK.notify && RK.notify.ping) {
                        RK.notify.ping();
                    }
                    if (RK.log && RK.log.add) {
                        RK.log.add('export', 'CSV stream download (' + rows.length + ' rows)');
                    }
                    if (options.onComplete) {
                        options.onComplete({ format: 'csv', rows: rows.length, filename: filename, streamed: true });
                    }
                }).catch(function (e) {
                    fail(formatReportError(e));
                });
            } catch (eSink) {
                fail(formatReportError(eSink));
            }
        });

        return { ok: true, format: 'csv', rows: rows.length, cancel: function () { runner.cancelled = true; } };
    }

    function ensureJsZip(onReady) {
        if (window.JSZip) {
            onReady(null, window.JSZip);
            return;
        }
        var id = 'reportkit-jszip-cdn';
        if (document.getElementById(id)) {
            var tries = 0;
            var timer = window.setInterval(function () {
                tries += 1;
                if (window.JSZip) {
                    window.clearInterval(timer);
                    onReady(null, window.JSZip);
                } else if (tries > 120) {
                    window.clearInterval(timer);
                    onReady(new Error('JSZip failed to load.'));
                }
            }, 50);
            return;
        }
        var s = document.createElement('script');
        s.id = id;
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = function () {
            if (window.JSZip) {
                onReady(null, window.JSZip);
            } else {
                onReady(new Error('JSZip global missing.'));
            }
        };
        s.onerror = function () { onReady(new Error('JSZip CDN failed.')); };
        document.head.appendChild(s);
    }

    function zipNamedBlobs(entries, onDone, onProgress, isCancelled) {
        ensureJsZip(function (err, JSZipCtor) {
            if (err) {
                onDone(err);
                return;
            }
            try {
                var zip = new JSZipCtor();
                (entries || []).forEach(function (entry) {
                    if (entry && entry.name && entry.blob) {
                        zip.file(entry.name, entry.blob);
                    }
                });
                zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                }, function (metadata) {
                    if (onProgress && metadata && metadata.percent) {
                        onProgress(Math.round(metadata.percent));
                    }
                    if (typeof isCancelled === 'function' && isCancelled()) {
                        throw new Error('cancelled');
                    }
                }).then(function (blob) {
                    onDone(null, blob);
                }).catch(function (e) {
                    onDone(e);
                });
            } catch (eZip) {
                onDone(eZip);
            }
        });
    }

    function inferColumns(rows, columns) {
        if (columns && columns.length) {
            return columns;
        }
        if (!rows.length || typeof rows[0] !== 'object') {
            return [{ key: 'value', label: 'Value' }];
        }
        return Object.keys(rows[0]).map(function (k) {
            return { key: k, label: k };
        });
    }

    function buildPdfPart(rows, columns, options, callbacks) {
        callbacks = callbacks || {};
        var chunkRows = Number(options.pdfChunkRows || 80);
        ensureJsPdf(function (err) {
            if (err) {
                if (callbacks.fail) {
                    callbacks.fail(formatReportError(err));
                }
                return;
            }
            var JsPDF = resolveJsPdfConstructor();
            var doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            var disclaimer = (window.ReportKit && ReportKit.brand && ReportKit.brand.pdf_disclaimer) || '';
            doc.setFontSize(10);
            doc.text(options.title || 'ReportKit Export', 14, 12);
            if (disclaimer) {
                doc.setFontSize(8);
                doc.text(disclaimer, 14, 18);
            }
            var head = columns.map(function (c) { return c.label || c.key || c; });
            var body = rows.map(function (row) {
                return columns.map(function (col) {
                    var key = col.key || col;
                    var val = row && typeof row === 'object' ? row[key] : row;
                    return val == null ? '' : String(val);
                });
            });
            doc.autoTable({
                head: [head],
                body: body,
                startY: 24,
                styles: { fontSize: 7, cellPadding: 1.5 },
                margin: { left: 10, right: 10 },
                rowPageBreak: 'avoid',
                pageBreak: 'auto'
            });
            try {
                var blob = pdfDocumentToBlob(doc);
                if (callbacks.done) {
                    callbacks.done(blob);
                }
            } catch (e2) {
                if (callbacks.fail) {
                    callbacks.fail(formatReportError(e2));
                }
            }
        });
    }

    function buildPdfDownload(rows, options) {
        options = options || {};
        rows = rows || [];
        var columns = inferColumns(rows, options.columns);
        var RK = window.ReportKit || {};
        var perVolume = Number(options.pdfRowsPerVolume || 25000);
        var singleMax = Number(options.pdfSingleFileMaxRows || 40000);
        var filename = options.filename || buildFilename(options, 'pdf');
        var runner = { cancelled: false };

        if (RK.ui && RK.ui.setDownloadStatus) {
            RK.ui.setDownloadStatus({
                selector: options.statusSelector || '#rkDownloadStatus',
                hidden: false,
                label: 'Building PDF…',
                pct: 0
            });
        }

        function fail(msg) {
            if (RK.ui && RK.ui.toast) {
                RK.ui.toast(msg, 'warn');
            }
            if (RK.ui && RK.ui.setDownloadStatus) {
                RK.ui.setDownloadStatus({ selector: options.statusSelector || '#rkDownloadStatus', hidden: true });
            }
            if (options.onError) {
                options.onError(msg);
            }
        }

        function finishDownload(name) {
            if (RK.ui && RK.ui.setDownloadStatus) {
                RK.ui.setDownloadStatus({ selector: options.statusSelector || '#rkDownloadStatus', hidden: true });
            }
            if (RK.notify && RK.notify.ping) {
                RK.notify.ping();
            }
            if (options.onComplete) {
                options.onComplete({ format: 'pdf', rows: rows.length, filename: name });
            }
        }

        if (!rows.length) {
            fail('No prepared rows for PDF.');
            return { ok: false };
        }

        if (rows.length <= singleMax) {
            buildPdfPart(rows, columns, options, {
                done: function (blob) {
                    downloadBlob(filename, blob);
                    finishDownload(filename);
                },
                fail: fail
            });
            return { ok: true, format: 'pdf', rows: rows.length };
        }

        var parts = [];
        var cursor = 0;
        function buildNextVolume() {
            if (runner.cancelled) {
                fail('PDF download cancelled.');
                return;
            }
            var slice = rows.slice(cursor, cursor + perVolume);
            if (!slice.length) {
                var deliverZip = rows.length > singleMax;
                if (deliverZip) {
                    var zipEntries = parts.map(function (ab, idx) {
                        var blob = ab instanceof Blob ? ab : new Blob([ab], { type: 'application/pdf' });
                        return {
                            name: 'part-' + String(idx + 1).padStart(2, '0') + '.pdf',
                            blob: blob
                        };
                    });
                    zipNamedBlobs(zipEntries, function (err, blob) {
                        if (err) {
                            fail(formatReportError(err));
                            return;
                        }
                        var zipName = filename.replace(/\.pdf$/i, '') + '.pdf.zip';
                        downloadBlob(zipName, blob);
                        finishDownload(zipName);
                    }, function (pct) {
                        if (RK.ui && RK.ui.setDownloadStatus) {
                            RK.ui.setDownloadStatus({
                                selector: options.statusSelector || '#rkDownloadStatus',
                                label: 'Zipping PDF volumes…',
                                pct: pct
                            });
                        }
                    }, function () { return runner.cancelled; });
                    return;
                }
                mergePdfPartsToSingleBlob(parts, function (err, blob) {
                    if (err) {
                        fail(formatReportError(err));
                        return;
                    }
                    downloadBlob(filename, blob);
                    finishDownload(filename);
                }, function (pct, label) {
                    if (RK.ui && RK.ui.setDownloadStatus) {
                        RK.ui.setDownloadStatus({
                            selector: options.statusSelector || '#rkDownloadStatus',
                            label: label,
                            pct: pct
                        });
                    }
                }, function () { return runner.cancelled; });
                return;
            }
            cursor += slice.length;
            buildPdfPart(slice, columns, options, {
                done: function (blob) {
                    if (blob.arrayBuffer) {
                        blob.arrayBuffer().then(function (ab) {
                            parts.push(ab);
                            buildNextVolume();
                        });
                    } else {
                        parts.push(blob);
                        buildNextVolume();
                    }
                },
                fail: fail
            });
        }
        buildNextVolume();
        return { ok: true, format: 'pdf', rows: rows.length, cancel: function () { runner.cancelled = true; } };
    }

    function buildFilename(options, ext) {
        if (window.ReportKit && ReportKit.util && ReportKit.util.buildFilename) {
            return ReportKit.util.buildFilename({
                prefix: options.prefix || 'report',
                start_date: options.start_date,
                end_date: options.end_date,
                extension: ext
            });
        }
        return (options.prefix || 'report') + '.' + ext;
    }

    function downloadBlob(filename, blob) {
        if (window.ReportKit && ReportKit.util && ReportKit.util.downloadBlob) {
            ReportKit.util.downloadBlob(filename, blob.type || 'application/octet-stream', blob);
            return;
        }
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function createDownloadRunner(config) {
        config = config || {};
        var state = { running: false, cancelToken: null };

        function guardMessage() {
            if (config.isPreparing && config.isPreparing()) {
                return 'Please wait — prepare is still running.';
            }
            if (state.running) {
                return 'A download is already in progress.';
            }
            if (config.hasPreparedData && !config.hasPreparedData()) {
                return 'No prepared data. Run Fetch & Prepare first.';
            }
            return '';
        }

        function endUi() {
            state.running = false;
            state.cancelToken = null;
            if (config.onDownloadEnd) {
                config.onDownloadEnd();
            }
        }

        return {
            run: function (format, buildFn) {
                var blocked = guardMessage();
                if (blocked) {
                    if (config.onError) {
                        config.onError(blocked);
                    }
                    return;
                }
                state.running = true;
                state.cancelToken = { cancelled: false };
                if (config.onDownloadStart) {
                    config.onDownloadStart(format);
                }
                scheduleYield(function () {
                    if (state.cancelToken && state.cancelToken.cancelled) {
                        endUi();
                        return;
                    }
                    try {
                        buildFn({
                            fail: function (msg) {
                                endUi();
                                if (config.onError) {
                                    config.onError(msg);
                                }
                            },
                            done: function () {
                                endUi();
                                if (config.onSuccess) {
                                    config.onSuccess(format);
                                }
                            },
                            isCancelled: function () {
                                return state.cancelToken && state.cancelToken.cancelled;
                            }
                        });
                    } catch (e) {
                        endUi();
                        if (config.onError) {
                            config.onError(formatReportError(e));
                        }
                    }
                });
            },
            cancel: function () {
                if (state.cancelToken) {
                    state.cancelToken.cancelled = true;
                }
                endUi();
            },
            isActive: function () {
                return state.running;
            }
        };
    }

    window.ReportKitLLDP = window.ReportKitLLDP || {};
    window.ReportKitLLDP.createDownloadRunner = createDownloadRunner;
    window.ReportKitLLDP.buildPdfDownload = buildPdfDownload;
    window.ReportKitLLDP.buildStreamCsvDownload = buildStreamCsvDownload;
    window.ReportKitLLDP.mergePdfPartsToSingleBlob = mergePdfPartsToSingleBlob;
    window.ReportKitLLDP.zipNamedBlobs = zipNamedBlobs;
    window.ReportKitLLDP.shouldStreamCsvDownload = shouldStreamCsvDownload;
    window.ReportKitLLDP.supportsStreamSaver = supportsStreamSaver;
    window.ReportKitLLDP.ensureJsPdf = ensureJsPdf;
}(window));
