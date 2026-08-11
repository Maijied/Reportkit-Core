# JavaScript API

Requires **jQuery ≥ 1.10**. DataTables is required only for `ReportKit.table.mount`.

Load order: inline `window.__REPORTKIT_SETTINGS__` (from `@include('reportkit::ui.settings-bootstrap')`) **before** `reportkit.js`.

## `ReportKit.applySettings(settings)`

Merges server payload from PHP config (and optional per-report overrides). Called automatically when `__REPORTKIT_SETTINGS__` is present.

## `ReportKit.util`

| Method | Description |
|--------|-------------|
| `setting(path, fallback?)` | Read nested value from `ReportKit.settings` |
| `runDeferredUiWork(work, done?)` | Schedule heavy UI work off tight loops |
| `processInChunks(items, size, worker, done)` | Chunked async iteration |
| `buildFilename(parts)` | Download filename helper |
| `downloadBlob(name, mime, content)` | Trigger browser download |

## `ReportKit.store`

| Method | Description |
|--------|-------------|
| `beginPrepare()` | Reset in-memory rows |
| `mergeRows(rows)` | Append chunk |
| `commit({ reportKey, fingerprint })` | Persist to sessionStorage if under `store.session_persist_max_bytes` |
| `restore({ reportKey, fingerprint })` | Reload persisted rows |
| `rows()` / `count()` | Access prepared data |
| `isPersisted()` / `isMemoryOnly()` | Persist state |
| `clear()` | Drop store |

Payload encoding uses `rk1:` + base64 JSON (transport obfuscation). Over-limit payloads stay memory-only.

## `ReportKit.prepare`

```js
ReportKit.prepare.run({
  weeksUrl: '/admin/export-weeks',
  dataUrl: '/admin/export-data',
  reportKey: 'export-report',
  fingerprint: '2026-01-01_2026-06-30',
  params: { start_date: '…', end_date: '…' },
  onProgress: function (pct, count) {},
  onComplete: function (rows) {},
  onError: function (message) {}
});
```

Calls `store.commit()` automatically when prepare completes.

## `ReportKit.export`

| Method | Description |
|--------|-------------|
| `assess(rowCount, format)` | Ceiling check vs settings |
| `fromStore(format, options)` | Export prepared rows |
| `compose(format, rows, options)` | CSV / Excel / PDF entry |
| `csv(rows, options)` | Chunked CSV download |
| `excel(rows, options)` | HTML `.xls` under soft max; CSV fallback above |

Ceilings: `export.excel_soft_max_rows`, `export.pdf_single_pass_max_rows`, chunk sizes from settings.

```js
ReportKit.export.fromStore('csv', {
  prefix: 'billing',
  start_date: '2026-01-01',
  end_date: '2026-01-31',
  columns: [{ key: 'amount', label: 'Amount' }]
});
```

## `ReportKit.pdf.compose(rows, options)`

Print-dialog skeleton under PDF ceiling; falls back to CSV when over limit or pop-up blocked. Full volume merge ships in C4.

## `ReportKit.ui.toast(message, tone?)`

Uses SweetAlert2 when present; otherwise `.rk-toast` fallback (styled in CSS).

## Bus migration alias

`window.ShohozCommonReport` points to `ReportKit` during bus PR #16886 migration.

## `ReportKit.fonts.ensure()`

Injects Manrope + Sora from Google Fonts once.

## `ReportKit.syncLoader`

| Method | Description |
|--------|-------------|
| `show(selector?)` | Show `#rkSyncLoading` (default) |
| `hide(selector?)` | Hide overlay |
| `bindForm(form?, loader?)` | Show on form submit |

## `ReportKit.asyncLoader`

| Method | Description |
|--------|-------------|
| `show(selector?, message?)` | Show prepare overlay |
| `hide(selector?)` | Hide |
| `setProgress(pct, selector?)` | 0–100 width on `.rk-progress-bar` |

## `ReportKit.table`

| Method | Description |
|--------|-------------|
| `mount(selector, definition)` | `DataTable({ serverSide, ajax, columns, … })` |
| `toPreparedRows(api)` | Current filtered rows — **no server re-query** |
| `reload(api, resetPaging?)` | `ajax.reload` |

`mount` triggers `rk:table:mounted` on the table element with the API instance.

## `ReportKit.kpi.apply(root, summary)`

```js
ReportKit.kpi.apply('.rk-kpi-row', {
  tickets: { value: '1,240', hint: 'Sold', tone: 'good' }
});
```

Cards need `data-rk-kpi="tickets"` plus `.rk-kpi-value` / `.rk-kpi-hint`.

## `ReportKit.table.fromPreparedStore(options)`

Post-prepare ledger browse (Phase K6). Uploads rows to `{preparedUrl}` then mounts server-side DataTables on `{browseUrl}`, or falls back to local in-memory paging.

```js
ReportKit.table.fromPreparedStore({
  selector: '#ledger-table',
  preparedUrl: '/reportkit/billing/prepared',
  browseUrl: '/reportkit/billing/browse',
  columns: [{ key: 'credit_amount', label: 'Credit' }],
  kpiSelector: '.rk-kpi-row',
  onSummary: function (summary) {}
});
```

## `ReportKit.store.uploadPrepared({ url, rows })`

POST JSON `{ rows: [...] }` to session-backed browse (size capped by `store.session_persist_max_bytes`).

## `ReportKit.log`

Ring buffer when `logging.enabled` is true. `add(category, message)`, `renderPanel('.rk-activity-log')`, `clear()`. Include `@include('reportkit::ui.activity-log', ['enabled' => config('reportkit.logging.enabled')])`.

## `ReportKit.mail`

| Method | Description |
|--------|-------------|
| `assessEmail(email)` | Length + format check vs `mail.email_max_length` |
| `buildAttachment(format, options)` | CSV under `mail.hard_attach_max_bytes` |
| `send({ sendUrl, email, subject, format, … })` | FormData POST with `file` blob (LLDP Deliver contract) |

Host app implements the send route (zip/server-side merge optional).
