# Laravel demo — runnable host app

Full **fictional** Laravel 5.4 host proving ReportKit **hybrid-export** end-to-end with SQLite fixtures.

## Requirements

- **PHP 7.0–7.2** recommended (Laravel 5.4). PHP 8+ is not supported by Laravel 5.4.
- Composer, SQLite extension

```bash
cd examples/laravel-demo
chmod +x bin/setup-demo.sh
./bin/setup-demo.sh
php -S localhost:8080 -t public
```

Open [http://localhost:8080/admin/operator-export](http://localhost:8080/admin/operator-export)

## What it proves

1. **Fetch & Prepare** — week-chunked AJAX via `reportkit/operator-export/weeks` + `/rows`
2. **Secure store** — browser-side merge + commit (LLDP)
3. **Export** — CSV / Excel / PDF from prepared store (no re-query)
4. **Send** — `.csv.zip` email gate with typo detection
5. **Activity log** — categorized timeline when `REPORTKIT_LOG=true`

## Pre-built report

| File | Role |
|------|------|
| `app/Reports/OperatorExportReport.php` | Definition + flags |
| `app/Services/Reports/OperatorExportReportService.php` | Week chunking orchestration |
| `app/Repositories/Reports/OperatorExportReportRepository.php` | SQLite fictional SQL |
| `resources/views/admin/reports/operator-export.blade.php` | CAS Blade page |
| `public/js/reports/operator-export.js` | LLDP client wiring |

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
| GET | `/admin/operator-export` | Demo report page |
| GET | `/reportkit/operator-export/weeks` | Week list JSON |
| GET | `/reportkit/operator-export/rows` | Prepare row JSON |
| POST | `/reportkit/operator-export/send` | Email ZIP |

Enabled via `config/reportkit.php` → `routes.enabled = true` and `ReportKit::routes()`.

## Fixtures

```bash
sqlite3 database/demo.sqlite < database/seeds/demo_fixtures.sql
```

All data is synthetic — operators like `NORTHSTAR`, `BLUELINE` are fictional.

## Related

- Public simulation: [reportkit.lorapok.tech/simulation](https://reportkit.lorapok.tech/simulation)
- Live API demo: [reportkit.lorapok.tech/demo](https://reportkit.lorapok.tech/demo)

## License

Lorapok-NCL-1.0 — same as monorepo.
