# Phase 6 — Research demo (reference)

> **Moved from:** `.cursor/plans/phase6_research_demo_plan.md`  
> **Related:** [Phase L](../phases/L-mock-simulation.md) · [MOCK-DATABASE.md](../simulation/MOCK-DATABASE.md)

**Status:** Plan ready · dual-D1 + 50M synthetic

## Goal

Ship the public ReportKit demo with dummy-only data, dual-D1 merge, 50M synthetic virtual paging, ~1M measured seed, site wired to live Worker API.

See full execution steps in the archived plan at [`.cursor/plans/phase6_research_demo_plan.md`](../../.cursor/plans/phase6_research_demo_plan.md).

## Scale tiers

| Tier | Rows | Provenance |
|------|------|------------|
| `research` | 1M (500k+500k) | measured |
| `synthetic` | 50M virtual | synthetic |
| `ledger-synthetic` | 10M txns (Phase L) | synthetic |

## Verification

```bash
curl -s "$API/v1/stats"
curl -s "$API/v1/data?mode=synthetic&start=0&length=5"
# recordsTotal = 50000000
```
