# ReportKit Core

**A new, standalone PHP library** for building prepare-once / DataTables / export-style reports — framework-agnostic, Packagist-ready.

> Package: `reportkit/core` · PHP ≥ 5.6 · No Laravel dependency

---

## Author

**Mohammad Maizied Hasan Majumder**  
[mdshuvo40@gmail.com](mailto:mdshuvo40@gmail.com)

Founder & Principal Engineer at [Lorapok Labs](https://lorapok.labs) · Senior Software Engineer @ [Shohoz Ltd](https://shohoz.com)

---

## Why ReportKit?

Host apps should own **domain SQL**. ReportKit owns the reusable report mechanics:

- Fluent report definitions (`Report::define`)
- Week-based date chunking (safe prepares over large ranges)
- Filter validation helpers
- DataTables-oriented JSON responders
- Export filename helpers
- Runtime settings store (brand, accents, ceilings) — not a hard-coded `config/reports.php` map

## Install

```bash
composer require reportkit/core
```

Until Packagist publish, use VCS:

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
| Dates | `DateRangeChunker` |
| Filters | `FilterValidator` |
| Export names | `ExportHelper` |
| Settings | `SettingsStore`, `ArraySettingsStore` |
| Contract | `RowSource` |

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

Full surface: [docs/API.md](docs/API.md) · Design notes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Ecosystem (planned)

| Package | Role |
|---------|------|
| `reportkit/core` | This repository |
| `reportkit/laravel-legacy` | Laravel 4.1–4.2 adapter |
| `reportkit/laravel` | Laravel 5.5–12 adapter |
| `@reportkit/ui` | Browser CSS/JS |

## License

MIT © Mohammad Maizied Hasan Majumder / Lorapok Labs
