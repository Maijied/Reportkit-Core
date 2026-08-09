---
title: "RowSource"
description: "Host-owned data contract."
order: 22
group: "Core concepts"
---

```php
interface RowSource
{
    public function getWeeks(array $filters);
    public function getRows(array $filters);
    public function getSummary(array $rows);
}
```

`getWeeks` returns week maps for `async_prepare`. SQL always lives in the host repository.
