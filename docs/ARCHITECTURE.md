# Architecture

```
reportkit/core (this repo)
  Date\DateRangeChunker
  Filter\FilterValidator
  Export\ExportHelper
  Report\{Report, ReportBuilder, ReportDefinition, ReportRegistry}
  Table\{Column, ReportTable, DataTableResponder, PseudoPaginator}
  Settings\{SettingsStore, ArraySettingsStore}
  Contracts\RowSource
```

## Design rules

- **No Laravel** in this package — adapters live elsewhere.
- **Definitions** (`Report::define`) are code, version-controlled, testable.
- **Settings** (brand, accent, ceilings) use `SettingsStore` — runtime overrides without editing PHP.
- **Domain SQL** always stays in the host app repositories / services.
- Prepare/export uses **week chunks** (host concurrency typically ≤ 3). Downloads should compose from prepared store data and must not re-query the full range.

## Feature flags (host)

Declared on each definition; disabled flags should omit routes and UI:

`datatables` · `sync` · `async_prepare` · `kpi` · `email` · `excel` · `csv` · `pdf` · `print` · `howto`
