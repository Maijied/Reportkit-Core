# ReportKit Core

Framework-agnostic PHP library (`reportkit/core`) for building prepare-once / DataTables / export reports.

**Requires PHP ≥ 5.6.** No Laravel dependency.

## Install

```bash
composer require reportkit/core
```

Path / VCS install while unpublished:

```json
{
  "repositories": [
    {
      "type": "vcs",
      "url": "https://github.com/Maijied/Reportkit-Core.git"
    }
  ],
  "require": {
    "reportkit/core": "dev-main"
  }
}
```

## What it provides

| Area | Classes |
|------|---------|
| Definitions | `Report`, `ReportBuilder`, `ReportDefinition`, `ReportRegistry` |
| Table / JSON | `Column`, `ReportTable`, `DataTableResponder`, `PseudoPaginator` |
| Dates | `DateRangeChunker` (week chunks for RDS-safe prepares) |
| Filters | `FilterValidator` |
| Export names | `ExportHelper` |
| Settings | `SettingsStore`, `ArraySettingsStore` |
| Contract | `RowSource` |

Domain SQL stays in the **host application**. This package only shapes definitions, validation, chunking, and response payloads.

## Quick example

```php
use ReportKit\Core\Report\Report;
use ReportKit\Core\Table\Column;

Report::define('demo', function ($report) {
    $report
        ->title('Demo Report')
        ->flags(['datatables', 'excel', 'csv', 'pdf'])
        ->columns([
            Column::make('id', 'ID'),
            Column::make('name', 'Name'),
        ]);
});
```

See [docs/API.md](docs/API.md) for the full surface.

## Related packages

- `reportkit/laravel-legacy` — Laravel 4.1–4.2 adapter (separate repo)
- `@reportkit/ui` — CSS/JS CAS tokens (separate package)

## License

MIT
