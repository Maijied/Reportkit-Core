# Laravel demo scaffold checklist

Minimal **fictional** host proving LLDP hybrid-export end-to-end. This folder is a Composer path-repo consumer — not a full Laravel skeleton.

## Prerequisites

- PHP 5.6+ (legacy adapter) or PHP 7.4+ (modern Laravel)
- Composer
- SQLite (for fixtures)

## 1. Path repositories

Already configured in `composer.json`:

```json
{
  "repositories": [
    { "type": "path", "url": "../../reportkit-core" },
    { "type": "path", "url": "../../reportkit-laravel-legacy" }
  ]
}
```

Run `./bin/setup-demo.sh` or `composer install` from this directory.

## 2. Host app integration

In your Laravel host (or a fresh Laravel 5.x app with this folder merged):

| Step | Command / file |
|------|----------------|
| Install package | `php artisan reportkit:install --with-config --publish-assets` |
| Scaffold export | `php artisan reportkit:make OperatorExport --preset=hybrid-export --route=admin/operator-export` |
| Routes | Copy `routes/reportkit-demo.php.example` into `routes/web.php` |
| Fixtures | `sqlite3 database/demo.sqlite < database/seeds/demo_fixtures.sql` |
| Assets | Ensure `public/css/reportkit/` and `public/js/reportkit/` are published |

## 3. Expected UX (parity target)

1. Filter panel → **Fetch & Prepare**
2. KPI row updates (`row_count`, `ticket_count`, …)
3. CSV / Excel / PDF from prepared store (no re-query)
4. Send panel emails `.csv.zip` with typo-aware gate (`assessSendEmail`)

## 4. Reports to add later

| Report | Preset | Proves |
|--------|--------|--------|
| Ledger Browse | `hybrid-browse` | Prepare + JSON browse |
| Trip Merge | `datatables-sync` | Server-side DataTables |

All fixture data is synthetic — no real operators or production identifiers.
