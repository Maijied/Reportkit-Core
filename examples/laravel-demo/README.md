# Laravel demo — runnable host app

Full **fictional** Laravel 5.4 host proving ReportKit **hybrid-export** and **hybrid-browse** end-to-end with SQLite fixtures.

## Requirements

- **PHP 7.0–7.2** recommended (Laravel 5.4). PHP 8+ is not supported by Laravel 5.4.
- Composer, SQLite extension

```bash
cd examples/laravel-demo
chmod +x bin/setup-demo.sh
./bin/setup-demo.sh
php -S localhost:8080 -t public
```

Open [http://localhost:8080/](http://localhost:8080/) — pick a demo report.

## What it proves

### Operator Export (`hybrid-export`)

1. **Fetch & Prepare** — week-chunked AJAX via `reportkit/operator-export/weeks` + `/rows`
2. **Secure store** — browser-side merge + commit (LLDP)
3. **Export** — CSV / Excel / PDF from prepared store (no re-query)
4. **Send** — `.csv.zip` email gate with typo detection
5. **Activity log** — categorized timeline when `REPORTKIT_LOG=true`

### Ledger Browse (`hybrid-browse`)

1. Same prepare flow — ledger-shaped rows from fictional SQLite
2. **Session browse** — POST `/reportkit/ledger-browse/prepared`, GET `/browse` (DataTables, SQL = 0)
3. **Ledger panel** — txn pills, running balance, KPI row
4. Export from prepared store after browse mounts

## Pre-built reports

| Preset | Files |
|--------|-------|
| hybrid-export | `OperatorExportReport.php`, `OperatorExportReportService.php`, `operator-export.blade.php`, `operator-export.js` |
| hybrid-browse | `LedgerBrowseReport.php`, `LedgerBrowseReportService.php`, `ledger-browse.blade.php`, `ledger-browse.js` |

Shared: `app/Repositories/Reports/*` (SQLite fictional SQL / ledger mapping).

## Path repositories

Local monorepo packages via `composer.json`:

```json
{
  "repositories": [
    { "type": "path", "url": "../../reportkit-core" },
    { "type": "path", "url": "../../reportkit-laravel-legacy" }
  ]
}
```

## Routes

| Method | Path | Handler |
|--------|------|---------|
| GET | `/` | Demo home — links to both reports |
| GET | `/admin/operator-export` | hybrid-export page |
| GET | `/admin/ledger-browse` | hybrid-browse page |
| GET | `/reportkit/{slug}/weeks` | Week list JSON |
| GET | `/reportkit/{slug}/rows` | Prepare row JSON |
| POST | `/reportkit/{slug}/prepared` | Store prepared rows (browse) |
| GET | `/reportkit/{slug}/browse` | DataTables browse JSON |
| POST | `/reportkit/operator-export/send` | Email ZIP |

Enabled via `config/reportkit.php` → `routes.enabled = true` and `ReportKit::routes()`.

## Fixtures

```bash
sqlite3 database/demo.sqlite < database/seeds/demo_fixtures.sql
```

All data is synthetic — operators like `NORTHSTAR`, `BLUELINE` are fictional.

## Related

- Public simulation: [reportkit.lorapok.tech/simulation](https://reportkit.lorapok.tech/simulation)
- Monorepo: [github.com/Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core)

## License

Lorapok-NCL-1.0 — same as monorepo.
