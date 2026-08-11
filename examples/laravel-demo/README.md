# Laravel demo — reference host app

Minimal **fictional** Laravel host proving ReportKit end-to-end. Uses path repositories to local monorepo packages.

## Reports (planned)

| Report | Preset | Proves |
|--------|--------|--------|
| Operator Export | `hybrid-export` | LLDP prepare → CSV/PDF/send |
| Ledger Browse | `hybrid-browse` | Prepare + JSON browse |
| Trip Merge | `datatables-sync` | Server-side DataTables |

All fixture data is synthetic — no real operators or production identifiers.

## Quick start (scaffold)

```bash
# From monorepo root
cd examples/laravel-demo

# Point Composer at local packages (see composer.json repositories)
composer install

# Publish ReportKit assets + config
php artisan reportkit:install --with-config --publish-assets

# Scaffold the demo export report
php artisan reportkit:make OperatorExport --preset=hybrid-export --route=admin/operator-export

# Load fictional SQLite fixtures
sqlite3 database/demo.sqlite < database/seeds/demo_fixtures.sql

composer dump-autoload
```

## Path repositories

```json
{
  "repositories": [
    { "type": "path", "url": "../../reportkit-core" },
    { "type": "path", "url": "../../reportkit-laravel-legacy" }
  ]
}
```

## Routes (after scaffold)

```
GET  admin/operator-export
GET  admin/operator-export/weeks
GET  admin/operator-export/rows
POST reportkit/operator-export/send
```

## License

Same as monorepo — Lorapok-NCL-1.0. Commercial use requires a separate license from Lorapok Labs.
