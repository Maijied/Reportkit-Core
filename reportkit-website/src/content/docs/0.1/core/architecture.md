---
title: "Architecture"
description: "Core package layout and design rules."
order: 20
group: "Core concepts"
---

Core is standalone — no Laravel types.

```
Date\DateRangeChunker
Filter\FilterValidator
Export\ExportHelper
Report\{Report, ReportBuilder, ReportDefinition, ReportRegistry}
Table\{Column, ReportTable, DataTableResponder, PseudoPaginator}
Source\{MergedRowSource, ArrayRowSource}
Settings\{SettingsStore, ArraySettingsStore}
Contracts\RowSource
```

Feature flags on definitions: `datatables` · `sync` · `async_prepare` · `kpi` · `email` · `excel` · `csv` · `pdf` · `print` · `howto`.
