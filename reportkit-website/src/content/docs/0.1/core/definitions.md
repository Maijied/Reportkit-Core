---
title: "Report definitions"
description: "Fluent Report::define + ReportBuilder."
order: 21
group: "Core concepts"
---

```php
use ReportKit\Core\Report\Report;
use ReportKit\Core\Table\Column;
use ReportKit\Core\Table\ReportTable;

Report::define('demo', function ($r) {
    $r->title('Demo')
      ->route('admin/demo-report')
      ->flags(['datatables', 'async_prepare', 'csv'])
      ->table(ReportTable::make('main')->columns([
          Column::make('id', 'ID')->sortable(),
      ]));
});
```

On Laravel, place definition files in `app/Reports/` (configurable).
