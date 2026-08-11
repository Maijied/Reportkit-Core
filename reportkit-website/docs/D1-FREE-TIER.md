# Cloudflare D1 (free tier) + billion-row demos

ReportKit uses **two layers** so public demos can talk about billions without pretending free D1 stores them all.

## Measured (stored on D1)

| Scale | Live rows | Archive rows | How to apply |
|-------|-----------|--------------|--------------|
| `default` | 2k | 2k | Local / smoke |
| `large` | 50k | 50k | Dev benchmarks |
| `research` | 500k | 500k | **Recommended free-tier max (~1M total)** |
| `research-full` | 25M | 25M | Paid D1 / self-hosted only |

Apply to your free Cloudflare D1 databases:

```bash
cd reportkit-website/worker
SEED_SCALE=research npm run seed:sql
bash scripts/seed-apply-remote.sh   # needs CLOUDFLARE_* + REPORTKIT_LIVE/ARCHIVE secrets
```

Or GitHub Actions → **Seed D1 (manual)** → scale `research`.

Free-tier limits (rows + storage) make **~1M measured rows** the honest ceiling. The seed batches split into 25k SQL files for reliable `wrangler d1 execute`.

## Virtual (not stored — billions)

The Worker exposes a **1 billion row virtual address space** via deterministic generators:

- `syntheticLedgerRow(index)` — O(1) materialization, no D1 insert
- `/v1/sim/*` — simulation playlist uses synthetic rows
- `/v1/synthetic/*` — paging over virtual totals with provenance badge `synthetic`

Labels on the site: **measured** = rows actually in D1 · **synthetic** = generated on demand · **live** = dual-D1 merge API.

## Ledger on D1

Trip tables are seeded to D1. Ledger browse for `/simulation` uses the in-worker generator (`ledger.ts`) so browse stress tests do not require inserting billions of ledger rows into D1.

## Do not

- Attempt to insert billions of rows into free D1 (will fail quota / timeout)
- Label virtual totals as “stored in database”
- Copy real bus or customer data into seeds
