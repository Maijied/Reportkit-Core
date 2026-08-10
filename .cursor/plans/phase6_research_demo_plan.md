# Phase 6 — Research Demo (Dummy Data, 50M Virtual, Dual-D1)

**Status:** Plan ready · **Branch:** `main` · **Last pushed:** `0aa3850`

## Goal

Ship the public ReportKit demo with:
- **Dummy-only data** (fictional operators/routes — no real project data)
- **Dual-D1 merge** (live 2018→now + archive 2012–2017, cross-DB `operator_code` ref)
- **50M synthetic** virtual paging (`mode=synthetic`)
- **~1M measured** seed on D1 (`research` scale: 500k + 500k)
- Site wired to live Worker API

---

## Current state

| Item | Status |
|------|--------|
| Local code (schema, seed generator, worker API, dummy fixtures) | ✅ Done, **uncommitted** |
| Remote D1 | ❌ Old flat schema (~2k rows) |
| Deployed Worker | ⚠️ Old code at `reportkit-demo-api.mdshuvo40.workers.dev` |
| Deploy site CI | ❌ Broken (`paths` + `paths-ignore` conflict) |
| GitHub Pages | ❌ Never deployed successfully |
| `PUBLIC_DEMO_API_URL` | ❌ Not set in site build |

---

## Step-by-step execution

### Step 1 — Fix blocking CI workflows

**Files:**
- `.github/workflows/deploy-site.yml`
- `.github/workflows/quality.yml`

**Changes:**
1. Replace `paths` + `paths-ignore` with a single `paths` list using `!` exclusions:
   ```yaml
   paths:
     - 'reportkit-website/**'
     - '!reportkit-website/worker/**'
     - '!reportkit-website/SETUP-DNS.md'
     - '!reportkit-website/VERSIONING.md'
     - 'reportkit-core/docs/**'
     - ...
   ```
2. Add to `deploy-site.yml` build step:
   ```yaml
   env:
     GITHUB_TOKEN: ${{ github.token }}
     PUBLIC_DEMO_API_URL: https://reportkit-demo-api.mdshuvo40.workers.dev
   ```

### Step 2 — Small UX/doc polish (same commit)

**Files:**
- `reportkit-website/src/pages/demo.astro` — default dates `2012-01-01` → `2026-08-10`
- `reportkit-website/SETUP-DNS.md` — update seed commands to batched scripts + `/v1/*` endpoints
- `PLAN.md` — sync with this plan + task checklist

**Exclude from commit:**
- `reportkit-website/Your-Framework-Is-Old-...-Manuscript.docx` (add later when publishing)
- `reportkit-website/worker/seed/batches/` (CI regenerates; optional to commit)

### Step 3 — Commit & push (Phase 6 batch)

**Commit message:**
```
feat(demo): research-scale dummy dual-D1 seed and 50M synthetic API

- Dual schema with operator catalog and cross-DB operator_code
- Batched seed generator (default/large/research/research-full)
- Worker JOIN, COUNT, overlap dedupe, synthetic 50M mode
- Fix deploy-site and quality path filters; wire PUBLIC_DEMO_API_URL
```

**Files to stage:**
- `.github/workflows/seed-d1.yml`, `deploy-site.yml`, `quality.yml`
- `PLAN.md`
- `reportkit-website/docs/RESEARCH.md`
- `reportkit-website/worker/schema/*.sql`
- `reportkit-website/worker/seed/generate-research-seed.mjs`, `generate-seed.mjs`, `operators.json`, `*.meta.sql`
- `reportkit-website/worker/scripts/seed-apply-remote.sh`, `seed-remote.sh`
- `reportkit-website/worker/src/index.ts`, `generate.ts`
- `reportkit-website/src/pages/index.astro`, `demo.astro`
- `reportkit-website/src/content/docs/0.1/about/scale.md`
- `reportkit-website/src/data/fixtures/demo-page.json`
- `reportkit-website/SETUP-DNS.md` (if updated)

**Push:** `git push origin main`

### Step 4 — Seed D1 at research scale (manual CI)

1. GitHub → **Actions → Seed D1 (manual)**
2. Input: `scale = research` (500k + 500k, ~30–90 min)
3. Monitor job (360 min timeout)
4. Verify locally:
   ```bash
   curl -s "https://reportkit-demo-api.mdshuvo40.workers.dev/v1/stats" | jq .
   # Expect live_rows ~500000, archive_rows ~500000, data_kind dummy_synthetic
   ```

**Prerequisite secrets on Reportkit-Core:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `REPORTKIT_LIVE`, `REPORTKIT_ARCHIVE`

### Step 5 — Deploy Worker

- Trigger **Deploy Worker** workflow (or push under `reportkit-website/worker/**`)
- Verify:
  ```bash
  curl -s "https://reportkit-demo-api.mdshuvo40.workers.dev/v1/health" | jq .
  curl -s "https://reportkit-demo-api.mdshuvo40.workers.dev/v1/data?mode=synthetic&start=0&length=5" | jq .
  # recordsTotal = 50000000
  ```

### Step 6 — Deploy site

1. **Actions → Deploy site → Run workflow**
2. GitHub → Settings → Pages → custom domain `reportkit.lorapok.tech`
3. Verify demo page calls Worker (provenance badge `live` or `synthetic`, not `cached`)

### Step 7 — Manual follow-ups (post-demo)

| # | Task | Owner |
|---|------|-------|
| 7a | DNS CNAME `reportkit` → `Maijied.github.io` | Manual |
| 7b | Enable `api.reportkit.lorapok.tech` in `wrangler.toml` when zone ready | Manual |
| 7c | Packagist URLs → monorepo | Manual |
| 7d | Archive old split repos | Manual |
| 7e | Rotate tokens exposed in chat | Manual |

---

## Task checklist

- [ ] **T1** Fix `deploy-site.yml` path filters + `PUBLIC_DEMO_API_URL`
- [ ] **T2** Fix `quality.yml` path filters
- [ ] **T3** Update `demo.astro` default date range
- [ ] **T4** Update `SETUP-DNS.md` seed/verify commands
- [ ] **T5** Update `PLAN.md` status
- [ ] **T6** Run worker tests (`npm test` in `reportkit-website/worker`)
- [ ] **T7** Commit Phase 6 (exclude `.docx`, optional exclude `batches/`)
- [ ] **T8** Push to `origin/main`
- [ ] **T9** Run Seed D1 workflow (`research`)
- [ ] **T10** Run Deploy Worker workflow
- [ ] **T11** Run Deploy site workflow
- [ ] **T12** Smoke test `/v1/health`, `/v1/stats`, `/demo` live + synthetic modes

---

## Verification

### Local (before push)
```bash
cd reportkit-website/worker
SEED_SCALE=default npm run seed:sql   # quick sanity
npm test
cd ../..
npm ci && npm run build               # in reportkit-website/
```

### Remote (after seed + deploy)
```bash
API=https://reportkit-demo-api.mdshuvo40.workers.dev
curl -s "$API/v1/health"
curl -s "$API/v1/stats"
curl -s "$API/v1/data?start_date=2012-01-01&end_date=2017-12-31&start=0&length=5"
curl -s "$API/v1/data?mode=synthetic&start=0&length=5"
```

### Site
- Open `/demo` → Live mode → trace shows live + archive row counts
- Synthetic mode → `recordsTotal: 50000000`
- Homepage shows **1M** dummy seed / **50M** virtual

---

## Known limitations (documented, not blocking)

1. **Live mode pagination** — fetches max 500 rows per DB per request; COUNT drives `recordsTotal` but deep pages need future week-chunked prepare.
2. **Archive operator display** — shows `operator_code` (`OP01`) not resolved name; live shows full name via JOIN.
3. **50M physical rows** — not stored on free D1; synthetic mode only.
4. **`RESEARCH.md`** — lives in `reportkit-website/docs/` (not Astro content); link from `scale.md` points to repo path.

---

## Critical file paths

```
.github/workflows/{seed-d1,deploy-worker,deploy-site,quality}.yml
PLAN.md
reportkit-website/docs/RESEARCH.md
reportkit-website/worker/schema/{live,archive}.sql
reportkit-website/worker/seed/generate-research-seed.mjs
reportkit-website/worker/scripts/seed-apply-remote.sh
reportkit-website/worker/src/{index,generate,merge}.ts
reportkit-website/src/pages/{demo,index}.astro
reportkit-website/src/content/docs/0.1/about/scale.md
```
