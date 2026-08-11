# Blade partials

Namespace: `reportkit::ui.*` and `reportkit::layouts.report`.

Pass `$reportFlags` from the report definition to gate optional blocks:

```blade
@include('reportkit::layouts.report', ['reportFlags' => $definition->flags])
```

## Layout shell

| Partial | Purpose |
|---------|---------|
| `layouts.report` | Page shell — filters, KPI, action bar, results yield |
| `ui.settings-bootstrap` | Inline `window.__REPORTKIT_SETTINGS__` |

## Filters & summary

| Partial | Variables |
|---------|-----------|
| `ui.filter-panel` | Yields `reportkit.filters` |
| `ui.filter-summary` | `$filterSummary[]` with label/value |
| `ui.filter-totals` | Credit/debit strip; `data-rk-kpi` keys for live summary |

## Ledger browse (Phase K)

| Partial | Variables |
|---------|-----------|
| `ui.ledger-panel` | `$tableId`, `$title`, `$loaderId`, `$reportFlags` |
| `ui.txn-pill` | `$type`, `$label`, optional `$classMap` |
| `ui.action-bar` | `$reportFlags`, `$disabledUntilLoad` |
| `ui.kpi-row` | `$kpis[]` with optional `key` for `ReportKit.kpi.apply` |

## Prepare / status

| Partial | Notes |
|---------|-------|
| `ui.sync-loader` | Classic form submit overlay |
| `ui.prepare-loader` | LLDP prepare progress overlay (wraps async-loader) |
| `ui.async-loader` | Prepare progress overlay (legacy include target) |
| `ui.activity-log` | `$enabled` when `logging.enabled` |
| `ui.send-panel` | Email stepper when `flags.email` |
| `ui.alert` | Inline alert region |
| `ui.download-status` | ETA progress bar |
| `ui.howto-panel` | Collapsible instructions |
| `emails.send` | Branded mail layout |

## Presets (`reportkit:make --preset=`)

| Preset | Use case |
|--------|----------|
| `hybrid-browse` | Prepare → session browse → export from store |
| `ledger-sync` | Sync DataTables + KPI from host `/data` |
| `hybrid-export` | Prepare + email send (no ledger table) |
| `datatables-sync` | Simple sync table |
| `hybrid-kpi` | Prepare + KPI only |

Preset-specific stubs: `report.blade.{preset}.stub`, `report.js.{preset}.stub`, `report.definition.{preset}.stub`.
