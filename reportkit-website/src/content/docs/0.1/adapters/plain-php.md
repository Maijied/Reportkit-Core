---
title: "Plain PHP"
description: "Use Core without Laravel."
order: 12
group: "Adapters"
---

```php
use ReportKit\Core\Date\DateRangeChunker;
use ReportKit\Core\Table\PseudoPaginator;
use ReportKit\Core\Table\DataTableResponder;
use ReportKit\Core\Source\MergedRowSource;

$merged = new MergedRowSource([$liveSource, $archiveSource], 'trip_id', 'booked_at', 'desc');
$rows = $merged->getRows($filters);
$page = (new PseudoPaginator())->slice($rows, $start, $length);
return (new DataTableResponder())->respond($_GET, $page, count($rows), count($rows), $merged->getSummary($rows));
```
