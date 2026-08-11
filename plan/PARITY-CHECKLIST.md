# PR feature parity checklist

**Sources:** [bus PR #16886](./references/bus-pr-16886.md) · [bus PR #16817](./references/bus-pr-16817.md)

Everything must be **config-driven**, **package-delivered**, and **test-covered**.  
All demo data is **fictional** — no real operators, clients, or PNRs from bus.

---

## PHP / AJAX

| Feature | Bus source | Package target | Status |
|---------|------------|----------------|--------|
| Date range + weekly chunks | `ReportDateRangeService` | `DateRangeChunker` | partial |
| Filter validation | `ReportFilterValidator` | `FilterValidator` | partial |
| Export filenames + ini limits | `ReportExportHelper` | `ExportHelper` | partial |
| ZIP email + DNS check | `ReportMailService` | `MailService` + `{slug}/send` | partial |
| Weeks JSON | `getExportWeeks` | `HandlesReportWeeks` | partial |
| Data JSON (prepare) | `getExportData` | `HandlesReportWeeks` (`/rows`) | partial |
| Browse JSON (post-prepare) | — (new) | `HandlesReportBrowse` + `{slug}/browse` | partial |
| Ledger page JSON | `billingReportData` | host SQL + `DataTableResponder` | missing |
| Send JSON | `postExportReportSend` | `HandlesReportSend` + `{slug}/send` | partial |
| Summary aggregates in JSON | billing `summary` key | `DataTableResponder` + `SummaryBuilder` | partial |
| Error contract `{ error }` | all AJAX | `AjaxResponse` helper | partial |
| Domain SQL | host services | **host only** | by design |

---

## Browser JS

| Module | Bus source | Package target | Status |
|--------|------------|----------------|--------|
| Prepare runner | `report-prepare.js` | `ReportKit.prepare.*` | partial |
| Secure store | `report-prepare.js` | `ReportKit.store.*` | partial |
| Excel / CSV / PDF | `report-prepare.js` | `ReportKit.export.*` | partial |
| PDF merge | `report-prepare.js` | `ReportKit.pdf.*` | partial — statement header, watermark, volume zip |
| Send client | `report-prepare.js` | `ReportKit.mail.*` | partial — ZIP attach, `canSend`, typo gate |
| UX (ETA, ping, mute) | `report-prepare.js` | `ReportKit.ui.*` | partial |
| Reload / store lifecycle | clears on reload | `ReportKit.store` init discard | partial — staging verified full reset |
| DataTable mount | billing + demo | `ReportKit.table.*` | partial |
| KPI apply | billing `updateSummary` | `ReportKit.kpi.apply` | partial |
| Browse from store | — (new) | `ReportKit.table.fromPreparedStore` | partial |
| Activity log | — (new) | `ReportKit.log.*` | partial — ring buffer + panel |
| Alias shim | `ShohozCommonReport` | `window.ReportKit` | done |

---

## Blade / design

| UI block | Export (#16886) | Billing (#16817) | Package partial | Status |
|----------|-----------------|------------------|-----------------|--------|
| Page shell | inline | inline | `layouts.report` | partial |
| Filter panel | partial | inline form | `ui.filter-panel` | partial |
| Active filter chips | inline | `.active-filters-section` | `ui.filter-summary` | partial |
| Prepare overlay | `loader` | `.table-loading-overlay` | `ui.prepare-loader` | partial |
| Table loading overlay | — | `.table-loading-overlay` | `ui.table-loader` | missing |
| Action bar | `export-action-buttons` | search + export buttons | `ui.action-bar` | partial — Fetch & Prepare label |
| KPI summary row | 8-metric grid | `.summary-box` wallet KPI | `ui.kpi-row` | partial — `#rkKpiRow`, export defaults |
| Filter totals row | inline | credit/debit totals | `ui.filter-totals` | partial |
| Ledger DataTable | — | 18-column table | `ui.ledger-panel` | partial |
| Txn type pills | — | `.txn-type-pill` | `ui.txn-pill` | partial |
| Table loading overlay | — | `.table-loading-overlay` | `ui.ledger-panel` / `.rk-table-loader` | partial |
| Action bar | `export-action-buttons` | search + export buttons | `ui.action-bar` | partial |
| Send stepper | inline | — | `ui.send-panel` | partial |
| Alert / toast | `#exportErrorMsg` | SweetAlert | `ui.alert` | partial |
| How-to panel | inline | — | `ui.howto-panel` | partial — `@section('reportkit.howto')` |
| Download status | inline overlay (PDF: pages/rows/ETA; CSV silent) | `ui.download-status` | partial — PDF % label |
| Activity log | — | — | `ui.activity-log` | partial |
| Email template | `emails/send` | — | `emails.send` | partial |

---

## Report definition flags

`datatables` · `sync` · `async_prepare` · `browse_prepared` · `kpi` · `email` · `excel` · `csv` · `pdf` · `print` · `howto` · `activity_log` · `ledger`

Disabled flags omit routes, buttons, partials, and JS modules.

---

## Presets

| Preset | Archetype | Flags |
|--------|-----------|-------|
| `hybrid-export` | Export Report | prepare, kpi, excel, csv, pdf, email |
| `hybrid-browse` | Export + ledger table | + browse_prepared, datatables, ledger |
| `datatables-sync` | Trip/billing sync | sync, datatables, kpi |
| `ledger-sync` | Billing PR #16817 | sync, datatables, kpi, ledger, excel, print |
| `hybrid-kpi` | Prepare + KPI only | async_prepare, kpi |

---

## Gap analysis

| Capability | Bus | ReportKit |
|------------|-----|-----------|
| Full prepare JS (~2,500 LOC) | ✓ | ~10% |
| Export blade (~4,100 LOC) | ✓ | 6 partials |
| Billing ledger UX (~1,061 LOC) | prepaid branch | missing |
| JSON browse after prepare | not in bus | **new package feature** |
| Activity log | ad hoc toasts | missing |
| 50M synthetic demo | — | partial (trips only) |
| Animated corner-case simulator | — | missing |

---

## Acceptance gates

| Gate | Test |
|------|------|
| Export | `ExportReportCornerCaseTest` 29/29 |
| Billing UX | Package partial snapshot + JSON contract tests |
| JSON browse | Post-prepare sort/search with SQL query count = 0 |
| Simulation | All cases in [CORNER-CASES.md](../simulation/CORNER-CASES.md) pass mock run |
