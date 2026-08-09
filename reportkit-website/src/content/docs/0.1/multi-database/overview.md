---
title: "Multiple databases"
description: "The flagship dual-DB story."
order: 30
group: "Multiple databases"
---

ReportKit does **not** own your connections. The host configures `mysql` + `mysql_archive` (or any names). Core provides:

1. `MergedRowSource` — fetch from N sources, merge, dedupe, sort
2. `PseudoPaginator` — page the merged set for DataTables
3. Optional `getTrace()` — per-source counts + timings for debugging / demos

See the [live demo](/demo) for a Cloudflare D1 simulation of this flow.
