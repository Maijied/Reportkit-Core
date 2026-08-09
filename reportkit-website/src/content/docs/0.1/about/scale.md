---
title: "Scale honesty"
description: "How we talk about 50 million rows."
order: 91
group: "About"
---

Free tiers (GitHub Pages + Cloudflare Workers/D1) **cannot store 50 million physical rows**.

ReportKit separates what is **stored**, **generated**, and **measured in CI**:

| Mode | Meaning |
|------|---------|
| `live` | Real dual-D1 merge over indexed **dummy** seed data (operator catalog + cross-DB `operator_code`) |
| `synthetic` | Deterministic generator over **50M** virtual rows (2012 → present) — O(1) paging |
| `measured` | CI benchmark numbers with stated methodology (no production data) |
| `cached` | Bundled fixtures when the Worker or D1 quota is unavailable |

## Research sample sizes

| `SEED_SCALE` | Live rows | Archive rows | Use |
|--------------|-----------|--------------|-----|
| `default` | 2,000 | 2,000 | Local dev |
| `large` | 50,000 | 50,000 | Quick stress |
| `research` | 500,000 | 500,000 | CI / public demo (default) |
| `research-full` | 25,000,000 | 25,000,000 | Paid D1 or offline batch only |

Archive DB holds **2012–2017**; live DB holds **2018–present**. Overlap trip IDs (`X-*`) appear in both DBs to test dedupe.

See [RESEARCH.md](/docs/RESEARCH.md) (in repo: `reportkit-website/docs/RESEARCH.md`) for schema and seed commands.

Every marketing number on this site carries a provenance badge.
