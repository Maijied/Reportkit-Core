# reportkit/core API (0.1)

Standalone library by **Mohammad Maizied Hasan Majumder** \<mdshuvo40@gmail.com\>.  
PHP `>= 5.6`. No Laravel dependency.

## DateRangeChunker

```php
$chunker = new \ReportKit\Core\Date\DateRangeChunker();
$chunker->isValidYmdDate('2026-01-01');
$chunker->validateDateRange($start, $end, 6); // null|error
$chunker->getWeeklyRanges($start, $end);      // [['start'=>..,'end'=>..], ...]
$chunker->validateWeekWithinRange($start, $end, $weekStart, $weekEnd);
$chunker->getInclusiveDayCount($start, $end);
```

## FilterValidator

```php
$v = new \ReportKit\Core\Filter\FilterValidator();
$v->requireKeys($inputs, ['company_id', 'start_date', 'end_date']);
$v->requireEnum($value, ['online', 'offline'], 'Invalid user type');
$v->requirePositiveIntId($companyId);
$v->validateDateAndOptionalWeek($inputs, 6);
```

## ExportHelper

```php
$h = new \ReportKit\Core\Export\ExportHelper();
$h->sanitizeFilenamePart('Hanif (CTG)');
$h->titleCaseLabel('offline'); // Offline
$h->buildDownloadFilename([...]);
$h->prepareLongRunningReport();
```

## Report::define

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

## DataTables helpers

```php
$responder = new \ReportKit\Core\Table\DataTableResponder();
return $responder->respond($_GET, $pageRows, $total, $filtered, $summary);

$pager = new \ReportKit\Core\Table\PseudoPaginator();
$page = $pager->slice($allRows, $start, $length);
$unique = $pager->dedupeByKey($allRows, 'trip_id');
```

## SettingsStore

```php
$store = new \ReportKit\Core\Settings\ArraySettingsStore();
$store->set('brand.accent', '#0b7a4b');
$store->get('brand.name', 'ReportKit');
```
