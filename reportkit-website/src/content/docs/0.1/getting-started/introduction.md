---
title: "Introduction"
description: "What ReportKit is and how the packages fit together."
order: 1
group: "Getting started"
---

ReportKit is a **framework-agnostic PHP report engine** with Laravel adapters and a CSS/JS UI pack. It is a product of [Lorapok Labs](https://lorapok.labs).

## Packages

| Package | Role |
|---------|------|
| `reportkit/core` | Week chunking, filters, fluent definitions, PseudoPaginator, DataTableResponder |
| `reportkit/laravel` | Laravel **5.5–13** adapter |
| `reportkit/laravel-legacy` | Laravel **4.1–5.4** adapter |
| `@lorapok-labs/reportkit-ui` | CAS CSS/JS (loaders, DataTables mount, KPI helpers) |

## Design rules

1. **Domain SQL stays in the host** via `RowSource`.
2. Core stays on PHP **≥ 5.6** so one engine serves every adapter.
3. Prepare/export uses **week chunks** — downloads should compose from prepared data.
4. Brand accent: `#0b7a4b`.
