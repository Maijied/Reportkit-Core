# Architecture

ReportKit Core is a **standalone** library. Adapters and host apps are separate projects.

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

- **No framework coupling** in this package — Laravel (and others) live in adapter packages.
- **Definitions** (`Report::define`) are code: version-controlled and testable.
- **Settings** (brand name, accent, disclaimer, ceilings) use `SettingsStore`.
- **Domain SQL** always stays in the host application.
- Prepare/export uses **week chunks**. Downloads should compose from prepared store data and must not re-query the full range.

## Feature flags (host)

Declared on each definition; disabled flags should omit routes and UI:

`datatables` · `sync` · `async_prepare` · `kpi` · `email` · `excel` · `csv` · `pdf` · `print` · `howto`

## Author

Mohammad Maizied Hasan Majumder \<mdshuvo40@gmail.com\>  
Founder & Principal Engineer, Lorapok Labs · Senior Software Engineer, Shohoz Ltd
