---
title: "Quick start"
description: "Install and scaffold a report in minutes."
order: 2
group: "Getting started"
---

## Laravel 5.5+

```bash
composer require reportkit/core reportkit/laravel
php artisan reportkit:install --publish-assets
php artisan reportkit:make Demo --route=admin/demo-report --preset=hybrid
```

Enable optional routes:

```php
// config/reportkit.php
'routes' => ['enabled' => true],
```

Then call `ReportKit::routes()` from your route service provider.

## Dual-DB in ~15 lines

```php
use ReportKit\Laravel\Facades\ReportKit;

$source = ReportKit::merged([
    ReportKit::connection('mysql', fn ($q, $f) =>
        $q->from('trips')->whereBetween('booked_at', [$f['start_date'], $f['end_date']])),
    ReportKit::connection('mysql_archive', fn ($q, $f) =>
        $q->from('trips')->whereBetween('booked_at', [$f['start_date'], $f['end_date']])),
])->dedupeBy('trip_id')->orderBy('booked_at', 'desc');
```
