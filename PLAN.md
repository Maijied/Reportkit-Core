# ReportKit local workspace plan

## Status (2026-08-10)

| Phase | Status |
|-------|--------|
| Monorepo consolidation | **Done** — `Maijied/Reportkit-Core` |
| README + architecture image | **Done** — `brand/cover-same-server-different-architecture.png` |
| Website + Worker + D1 | **Done** — CI green; Worker on workers.dev |
| Research-aligned dummy seed (code) | **Done** — dual schema, generator, Worker API |
| D1 re-seed (`research` 1M rows) | **Not done** — remote DB has **2k + 2k** (default scale only) |
| `api.reportkit` custom domain | **DNS added** — SSL handshake still failing |
| Cloudflare zone `lorapok.tech` | **Active** — NS at get.tech → Cloudflare |
| GitHub Pages site | **Deployed** — `/demo` OK; `/` CDN 404 (use `/index.html` or wait) |
| Domain control panel spec | **Done** — doc only (`DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md`) |
| Packagist URLs → monorepo | **Partial** — `core` updated; `laravel`, `laravel-legacy` still old repos |

## Task checklist (Phase 6)

- [x] **T1** Fix `deploy-site.yml` path filters + `PUBLIC_DEMO_API_URL`
- [x] **T2** Fix `quality.yml` path filters
- [x] **T3** Update `demo.astro` default date range (2012 → 2026-08-10)
- [x] **T4** Update `SETUP-DNS.md` + Worker custom domain docs
- [x] **T5** Detailed README with architecture + cover image
- [x] **T6** Run worker tests
- [x] **T7** Commit Phase 6
- [x] **T8** Push to `origin/main`
- [ ] **T9** Run **Seed D1** at `research` scale — workflow succeeded but applied **default** (2k+2k); re-run needed
- [x] **T10** Deploy Worker — live at `reportkit-demo-api.mdshuvo40.workers.dev`
- [x] **T11** Deploy site — [run 31345244612](https://github.com/Maijied/Reportkit-Core/actions/runs/31345244612)
- [ ] **T12** Smoke test — workers.dev + synthetic 50M OK; live demo uses fixtures until site redeploys with workers.dev API URL

## Verification snapshot (2026-08-10)

| Check | Result |
|-------|--------|
| `GET /v1/health` (workers.dev) | `ok: true` |
| `GET /v1/stats` | `live_rows: 2000`, `archive_rows: 2000` (not 500k) |
| `GET /v1/data?mode=synthetic` | `recordsTotal: 50000000` |
| `https://reportkit.lorapok.tech/demo/` | HTTP 200 |
| `https://reportkit.lorapok.tech/` | HTTP 404 (GitHub CDN cache) |
| `https://api.reportkit.lorapok.tech/v1/health` | SSL handshake failure |
| Worker tests | 5/5 pass |
| Deploy site / Quality CI | Green on `97b3f55` |

## Remaining actions

1. **Re-run Seed D1** → scale `research` (~30–90 min) for 1M measured rows.
2. **Redeploy site** with `PUBLIC_DEMO_API_URL` → workers.dev (until custom domain SSL works).
3. **Wait / fix SSL** on `api.reportkit.lorapok.tech` (Cloudflare Worker custom domain cert).
4. **Packagist** — update `reportkit/laravel` and `reportkit/laravel-legacy` repo URLs to monorepo.
5. **Optional** — archive `Maijied/Reportkit-Website`; rotate exposed tokens.

## Monorepo

Everything lives in **[Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core)**. See [MONOREPO.md](./MONOREPO.md).

| Directory | Package |
|-----------|---------|
| `reportkit-core/` | `reportkit/core` |
| `reportkit-laravel/` | `reportkit/laravel` |
| `reportkit-laravel-legacy/` | `reportkit/laravel-legacy` |
| `reportkit-ui/` | `@lorapok-labs/reportkit-ui` |
| `reportkit-website/` | Site + Worker |

## Do not

- Push package source to Shohoz Azure remotes
- Claim 50M rows are physically stored on free-tier D1 (use `synthetic` + `live` labels)
- Use real carrier or customer data in seeds (dummy only)
