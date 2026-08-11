# External sources

Cross-repo references for ReportKit planning. **Do not copy production data.**

---

## Bus repository

| Resource | Path / link |
|----------|-------------|
| Monorepo host | Azure DevOps `Shohoz/ticket/bus` |
| Process spec | `Documents/common-report-generation.md` |
| Export PR | [#16886](https://dev.azure.com/Shohoz/ticket/_git/bus/pullrequest/16886) |
| Billing PR | [#16817](https://dev.azure.com/Shohoz/ticket/_git/bus/pullrequest/16817) |
| Prepaid branch | `Client-API-Prepaid-System-Renew` |
| Export tests | `app/tests/ExportReportCornerCaseTest.php` |
| CommonServices tests | `app/tests/CommonServices/Report*Test.php` |

---

## ReportKit monorepo

| Resource | Path |
|----------|------|
| Plan index | [plan/README.md](../README.md) |
| Monorepo layout | [MONOREPO.md](../../MONOREPO.md) |
| Live site | [reportkit.lorapok.tech](https://reportkit.lorapok.tech) |
| Research / seeds | [reportkit-website/docs/RESEARCH.md](../../reportkit-website/docs/RESEARCH.md) |
| Synthetic generator | [reportkit-website/worker/src/generate.ts](../../reportkit-website/worker/src/generate.ts) |

---

## Proven capacity numbers (config defaults)

| Metric | Value | Provenance |
|--------|-------|------------|
| Max export date span | 6 months | live (bus) |
| Prepare concurrency | 3 | live |
| Session persist threshold | ~1.5MB | live |
| Excel soft max | 25,000 rows | live |
| PDF single pass | 105,303 rows | measured |
| PDF proven max | 287,484 rows / 8,997 pages | measured |
| CSV chunk | 400 rows | live |
| Mail attach max | 25MB | live |
| Ledger date window | 31 days | live (billing) |
| Virtual demo scale | 50,000,000 rows | synthetic |
| Measured seed | 1,000,000 rows | measured |

Label all public claims with provenance badges.
