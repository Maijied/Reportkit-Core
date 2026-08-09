---
title: "Laravel dual-DB"
description: "ConnectionRowSource wiring."
order: 32
group: "Multiple databases"
---

```php
use ReportKit\Laravel\Facades\ReportKit;

$source = ReportKit::merged([
    ReportKit::connection('mysql', function ($q, $f) {
        return $q->from('trips')
            ->whereBetween('booked_at', [$f['start_date'], $f['end_date']]);
    }),
    ReportKit::connection('mysql_archive', function ($q, $f) {
        return $q->from('trips')
            ->whereBetween('booked_at', [$f['start_date'], $f['end_date']]);
    }),
])->dedupeBy('trip_id')->orderBy('booked_at', 'desc');
```

Scaffold with the dual-DB repository stub via `reportkit:make`.
