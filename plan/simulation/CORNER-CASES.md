# Corner cases — mock simulation playlist

**Total:** 29 export-parity cases + 8 ledger-specific = **37 scenarios**  
**Run via:** `/simulation?playlist=full` or CI headless per case

All data is **fictional**. Expected outcomes are deterministic from seed + case config.

---

## Export parity (from ExportReportCornerCaseTest patterns)

| # | Case ID | Scenario | Expected |
|---|---------|----------|----------|
| 1 | `filter-invalid-dates` | End before start | `{ error }`, no prepare |
| 2 | `filter-over-6-months` | Span &gt; 6 months | validation error |
| 3 | `filter-missing-company` | Required enum empty | validation error |
| 4 | `prepare-single-week` | 7-day range | 1 week, rows &gt; 0 |
| 5 | `prepare-multi-week` | 6-month range | 26–27 weeks |
| 6 | `prepare-cancel-mid` | Cancel at week 3 | partial store discarded |
| 7 | `prepare-empty-week` | Week returns `[]` | merge continues, log warn |
| 8 | `prepare-network-timeout` | Mock 504 | retry or error toast |
| 9 | `store-under-cap` | JSON &lt; 1.5MB | sessionStorage persist |
| 10 | `store-over-cap` | JSON &gt; 1.5MB | memory-only, log info |
| 11 | `store-encrypt-roundtrip` | commit + reload page | rows restored |
| 12 | `excel-under-soft-max` | 10k rows | .xlsx download |
| 13 | `excel-over-soft-max` | 30k rows | CSV fallback + log |
| 14 | `csv-chunked` | 100k rows | chunked progress complete |
| 15 | `pdf-single-pass` | 50k rows | single PDF |
| 16 | `pdf-over-single-file` | 45k rows | .pdf.zip |
| 17 | `pdf-proven-scale` | 287k synthetic | completes with ETA |
| 18 | `send-valid-email` | ZIP &lt; 25MB | `{ ok: true }` |
| 19 | `send-over-attach` | ZIP &gt; 25MB | error + suggestion |
| 20 | `send-dns-typo` | `gmial.com` | typo suggestion |
| 21 | `dual-db-merge` | live+archive | dedupe by trip_id |
| 22 | `dedupe-sort-page` | duplicate keys | stable unique rows |
| 23 | `concurrency-3` | 9 weeks | max 3 in-flight |
| 24 | `ping-mute` | mute on | no audio ping |
| 25 | `keep-alive` | long PDF | session stays alive |
| 26 | `memory-limit` | huge prepare | ini bump applied |
| 27 | `error-contract` | server error | `{ error: string }` only |
| 28 | `6-month-live-fetch` | measured seed | all weeks return data |
| 29 | `provenance-labels` | each mode | correct badge shown |

---

## Ledger / browse specific

| # | Case ID | Scenario | Expected |
|---|---------|----------|----------|
| 30 | `ledger-first-fetch` | Generate with valid filters | KPI + table populate |
| 31 | `ledger-empty-result` | Filter → no rows | empty table, zero KPI |
| 32 | `ledger-page-limit-max` | No Limit selected | cap at 10,000 |
| 33 | `ledger-search-pnr` | table_search fictional PNR | filtered page |
| 34 | `ledger-txn-pills` | all txn types | correct CSS classes |
| 35 | `ledger-export-disabled` | before fetch | buttons disabled |
| 36 | `hybrid-browse-no-sql` | post-prepare paging | SQL count = 0 |
| 37 | `ledger-health-critical` | balance under 5% | critical KPI tone |

---

## Simulation driver config

```json
{
  "playlist": "full",
  "speed": 8,
  "seed": "reportkit-demo-v1",
  "cases": [
    { "id": "filter-invalid-dates", "pause_ms": 500 },
    { "id": "prepare-multi-week", "mock_weeks": 26 }
  ]
}
```

---

## Assertions (CI headless)

Each case verifies:

1. Activity log contains expected category + level
2. Final UI state matches `expected` column
3. No uncaught JS errors
4. Mock API received expected request sequence
5. Elapsed time under case budget at 1×

---

## Provenance per case

| Case group | Badge |
|------------|-------|
| 1–20 | synthetic |
| 21–22 | measured (dual D1) |
| 28 | measured |
| 17 | synthetic (scale label honest) |
| 30–37 | synthetic ledger |
