# ReportKit Core

**A new, standalone PHP library** for building prepare-once / DataTables / export-style reports — framework-agnostic, Packagist-ready.

> Package: `reportkit/core` · PHP **5.6 → current** · No Laravel dependency

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

## Ecosystem

ReportKit spans **legacy → currently supported** PHP and Laravel (see [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)).

| Package | Role | PHP | Laravel | Repo |
|---------|------|-----|---------|------|
| `reportkit/core` | This repository — engine only | **5.6 → current** | — | [Reportkit-Core](https://github.com/Maijied/Reportkit-Core) |
| `reportkit/laravel-legacy` | Classic adapter | 5.6 – 7.4 | **4.1 – 5.4** | planned |
| `reportkit/laravel` | Modern adapter | 7.0 – **current** | **5.5 → current** (through **12 / 13**) | planned |
| `@reportkit/ui` | Browser CSS/JS | — | Any host | [Reportkit-UI](https://github.com/Maijied/Reportkit-UI) |

“Current” means majors still on Laravel/PHP security support (today Laravel **12.x** and **13.x**, PHP **8.3–8.5**). Historical LTS lines (**Laravel 5.5**, **6**) are covered by `reportkit/laravel`.

## License

MIT © Mohammad Maizied Hasan Majumder / Lorapok Labs
