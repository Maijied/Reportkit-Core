---
title: "DataTableResponder"
description: "DataTables serverSide JSON payloads."
order: 25
group: "Core concepts"
---

```php
$responder = new \ReportKit\Core\Table\DataTableResponder();
return $responder->respond($_GET, $pageRows, $total, $filtered, $summary);
```

Payload keys: `draw`, `recordsTotal`, `recordsFiltered`, `data`, optional `summary`.
