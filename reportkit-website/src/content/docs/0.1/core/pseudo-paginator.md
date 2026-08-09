---
title: "PseudoPaginator"
description: "Merge, dedupe, sort, search, slice."
order: 24
group: "Core concepts"
---

```php
$pager = new \ReportKit\Core\Table\PseudoPaginator();
$unique = $pager->dedupeByKey($rows, 'trip_id');
$sorted = $pager->sortBy($unique, 'booked_at', 'desc');
$found = $pager->searchBy($sorted, 'Hanif', ['operator', 'route']);
$page = $pager->slice($found, $start, $length);
```

Useful when live+archive rows are merged in PHP before paging.
