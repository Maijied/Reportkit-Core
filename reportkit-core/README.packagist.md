> Plain-text overview for Packagist (no Mermaid). GitHub renders the full diagram version in [README.md](README.md).

<p align="center">
  <img src="https://raw.githubusercontent.com/Maijied/Reportkit-Core/main/brand/png/reportkit-logo-1200.png" alt="ReportKit" width="160">
</p>

<h1 align="center">ReportKit Core</h1>

<p align="center"><strong>Merge many databases. Emit one JSON. Report on anything.</strong></p>

<p align="center">
  <a href="https://packagist.org/packages/reportkit/core"><img alt="Packagist Version" src="https://img.shields.io/packagist/v/reportkit/core?include_prereleases&label=packagist&color=0b7a4b"></a>
  <a href="https://packagist.org/packages/reportkit/core"><img alt="Downloads" src="https://img.shields.io/packagist/dt/reportkit/core?color=0b7a4b"></a>
  <img alt="PHP" src="https://img.shields.io/badge/php-5.6%20%E2%86%92%208.5-777bb4">
  <a href="https://packagist.org/packages/reportkit/core"><img alt="License" src="https://img.shields.io/packagist/l/reportkit/core?color=0b7a4b"></a>
  <a href="https://reportkit.lorapok.tech"><img alt="Docs" src="https://img.shields.io/badge/docs-reportkit.lorapok.tech-0b7a4b"></a>
</p>

> Framework-agnostic PHP engine for prepare-once / DataTables / export-style reports. Host apps own **domain SQL**; ReportKit owns the reusable report mechanics.
>
> **Website & docs:** https://reportkit.lorapok.tech · **Part of the Lorapok Labs ecosystem.**

> A diagram-rich version of this README (with Mermaid) is shown on the [GitHub repository page](https://github.com/Maijied/Reportkit-Core).

## What is ReportKit Core?

ReportKit Core is a standalone PHP library for *prepare-once → paginate → export* reports. Your application keeps its domain SQL; ReportKit owns the mechanics every reporting screen repeats: date chunking, filter validation, in-memory paging/dedupe, DataTables-shaped JSON, and export naming.

The signature use case: **pull rows from several databases (live + archive + read-replicas), merge them, and serve one clean JSON response** to a DataTable or export — fast, and without re-querying the whole range on every download.

## Why ReportKit?

- **Multi-DB merge, one payload** — combine rows from any number of connections through the `RowSource` contract, then dedupe/sort/page in memory.
- **Prepare once, export many** — long date ranges are split into week chunks; downloads compose from prepared data.
- **DataTables-native** — `DataTableResponder` speaks server-side DataTables out of the box.
- **Definitions are code** — `Report::define()` is version-controlled and unit-testable.
- **Legacy → current** — engine runs on PHP 5.6 → 8.5; adapters cover Laravel 4.1 → all supported.
- **Zero framework coupling** — not a single Laravel import in this package.

## Features

| Area | Classes |
|------|---------|
| Definitions | `Report`, `ReportBuilder`, `ReportDefinition`, `ReportRegistry` |
| Table / JSON | `Column`, `ReportTable`, `DataTableResponder`, `PseudoPaginator` |
| Dates | `DateRangeChunker` |
| Filters | `FilterValidator` |
| Export names | `ExportHelper` |
| Settings | `SettingsStore`, `ArraySettingsStore` |
| Contract | `RowSource` |

**Feature flags** (host-declared per definition): `datatables` · `sync` · `async_prepare` · `kpi` · `email` · `excel` · `csv` · `pdf` · `print` · `howto`.

## Requirements

- PHP **≥ 5.6.0**
- No Laravel (or other framework) dependency

## Install

```bash
composer require reportkit/core
```

Track the beta channel while ReportKit stabilises:

```bash
composer require "reportkit/core:^0.1@beta"
```

Install from Git (VCS) or a local path:

```json
{
  "repositories": [
    { "type": "vcs", "url": "https://github.com/Maijied/Reportkit-Core.git" }
  ],
  "require": { "reportkit/core": "dev-main" }
}
```

## Quick start

```php
use ReportKit\Core\Report\Report;
use ReportKit\Core\Table\Column;
use ReportKit\Core\Table\ReportTable;

Report::define('demo', function ($report) {
    $report
        ->title('Demo Report')
        ->flags(['datatables', 'excel', 'csv', 'pdf'])
        ->table(
            ReportTable::make('main')
                ->title('Results')
                ->serverSide()
                ->columns([
                    Column::make('id', 'ID'),
                    Column::make('name', 'Name'),
                ])
        );
});
```

Merge two databases behind one report (host owns the SQL):

```php
use ReportKit\Core\Table\PseudoPaginator;
use ReportKit\Core\Table\DataTableResponder;

$rows = array_merge(
    $liveDb->select($domainSql, $bindings),      // connection A
    $archiveDb->select($domainSql, $bindings)    // connection B
);

$page = (new PseudoPaginator($rows))
    ->searchBy($request->search, ['name', 'email'])
    ->sortBy($request->orderColumn, $request->orderDir)
    ->page($request->start, $request->length);

return DataTableResponder::make($page)->toArray();
```

Full surface: [docs/API.md](docs/API.md) · Design notes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · Matrix: [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)

## Ecosystem

| Package | Role | PHP | Laravel |
|---------|------|-----|---------|
| `reportkit/core` | This repository — engine only | **5.6 → 8.5** | — |
| `reportkit/laravel-legacy` | Classic adapter | 5.6 – 7.4 | **4.1 – 5.4** |
| `reportkit/laravel` | Modern adapter | 7.0 – current | **5.5 → 12 / 13** |
| `@lorapok-labs/reportkit-ui` | Browser CSS/JS | — | Any host |

## Development

```bash
composer install
vendor/bin/phpunit
```

- Autoload: `ReportKit\Core\` → `src/`
- Tests: `ReportKit\Core\Tests\` → `tests/`
- Releases follow SemVer with `beta` / `rc` / `stable` channels.

## Author

**Mohammad Maizied Hasan Majumder** · [mdshuvo40@gmail.com](mailto:mdshuvo40@gmail.com)
Founder & Principal Engineer at Lorapok Labs · Senior Software Engineer @ Shohoz Ltd

## License

MIT © Mohammad Maizied Hasan Majumder / Lorapok Labs
