---
title: "Week chunking"
description: "DateRangeChunker for prepare-once reports."
order: 23
group: "Core concepts"
---

```php
$chunker = new \ReportKit\Core\Date\DateRangeChunker();
$chunker->validateDateRange($start, $end, 6); // null|error
$weeks = $chunker->getWeeklyRanges($start, $end);
```

Downloads should compose from prepared store data and must not re-query the full range.
