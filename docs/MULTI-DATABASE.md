# Multiple databases

ReportKit does **not** own your DB connections. The host app configures
`mysql` + `mysql_archive` (or any names). Core provides merge mechanics.

## MergedRowSource

```php
use ReportKit\Core\Source\MergedRowSource;

$source = new MergedRowSource(
    array($liveSource, $archiveSource),
    'trip_id',   // dedupe key — first source wins
    'booked_at', // order column
    'desc'
);

$rows = $source->getRows($filters);
$trace = $source->getTrace();
```

## Laravel helpers

```php
use ReportKit\Laravel\Facades\ReportKit;

$source = ReportKit::merged(array(
    ReportKit::connection('mysql', function ($q, $f) {
        return $q->from('trips')
            ->whereBetween('booked_at', array($f['start_date'], $f['end_date']));
    }),
    ReportKit::connection('mysql_archive', function ($q, $f) {
        return $q->from('trips')
            ->whereBetween('booked_at', array($f['start_date'], $f['end_date']));
    }),
))->dedupeBy('trip_id')->orderBy('booked_at', 'desc');
```

## Pipeline

1. Fetch each source (host SQL)
2. Concatenate rows
3. `PseudoPaginator::dedupeByKey` (stable, first wins)
4. `PseudoPaginator::sortBy` / `searchBy`
5. `PseudoPaginator::slice` + `DataTableResponder`

## Author

Mohammad Maizied Hasan Majumder \<mdshuvo40@gmail.com\>  
Founder & Principal Engineer, Lorapok Labs
