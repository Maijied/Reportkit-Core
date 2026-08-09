---
title: "MergedRowSource"
description: "Core merge helper API."
order: 31
group: "Multiple databases"
---

```php
use ReportKit\Core\Source\MergedRowSource;

$source = new MergedRowSource(
    [$live, $archive],
    'trip_id',      // dedupe key (first wins)
    'booked_at',    // order column
    'desc'
);

$rows = $source->getRows($filters);
$trace = $source->getTrace(); // ['sources' => [...], 'merged' => n, 'deduped' => n, ...]
```
