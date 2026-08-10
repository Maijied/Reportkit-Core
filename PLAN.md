# ReportKit local workspace plan

## Status (2026-08-10)

| Phase | Status |
|-------|--------|
| Monorepo consolidation | **Done** — `Maijied/Reportkit-Core` |
| README + architecture image | **Done** — `brand/cover-same-server-different-architecture.png` |
| Website + Worker + D1 | Workflows fixed; secrets on **Reportkit-Core** |
| Research-aligned dummy seed | **Committed** — dual schema, 2012→now, operator cross-ref |
| D1 re-seed (research) | **Done** — Seed D1 workflow succeeded (run 31342266856) |
| `api.reportkit` custom domain | **Added in Cloudflare** — SSL cert still provisioning |
| Cloudflare zone `lorapok.tech` | **Active** — NS at get.tech → Cloudflare |
| Domain control panel spec | **Done** — `docs/DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md` |
| Packagist / npm | Update package URLs to monorepo on Packagist |

## Task checklist

- [x] **T1** Fix `deploy-site.yml` path filters + `PUBLIC_DEMO_API_URL`
- [x] **T2** Fix `quality.yml` path filters
- [x] **T3** Update `demo.astro` default date range (2012 → 2026-08-10)
- [x] **T4** Update `SETUP-DNS.md` + Worker custom domain docs
- [x] **T5** Detailed README with architecture + cover image
- [x] **T6** Run worker tests
- [x] **T7** Commit Phase 6
- [x] **T8** Push to `origin/main`
- [x] **T9** Run **Seed D1** workflow (`research`) — succeeded
- [x] **T10** Run **Deploy Worker** workflow — succeeded on push
- [ ] **T11** Run **Deploy site** workflow — blocked by `VersionBand.astro` import path (fix committed)
- [ ] **T12** Smoke test API + `/demo` — workers.dev OK; custom domain SSL pending; site 404 until T11

## Monorepo

Everything lives in **[Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core)**. See [MONOREPO.md](./MONOREPO.md).

| Directory | Package |
|-----------|---------|
| `reportkit-core/` | `reportkit/core` |
| `reportkit-laravel/` | `reportkit/laravel` |
| `reportkit-laravel-legacy/` | `reportkit/laravel-legacy` |
| `reportkit-ui/` | `@lorapok-labs/reportkit-ui` |
| `reportkit-website/` | Site + Worker |

Release tags: `core/v*`, `laravel/v*`, `laravel-legacy/v*`, `ui/v*`.

## Phase 6 — Research scale demo

Based on [RESEARCH.md](./reportkit-website/docs/RESEARCH.md). **All demo data is fictional.**

1. **Schema** — live `operators` + FK trips; archive `operator_code` cross-ref; indexes on date + operator.
2. **Seed** — `generate-research-seed.mjs` with scales `default` / `large` / `research` / `research-full`.
3. **Worker** — JOIN live operators; COUNT + overlap dedupe; synthetic **50M** virtual rows (2012 → now).
4. **CI** — Seed D1 workflow applies batched SQL (`research` = 1M dummy rows).
5. **Site** — provenance badges; `PUBLIC_DEMO_API_URL=https://api.reportkit.lorapok.tech`.

### Remaining manual / infra

1. Wait for SSL on `api.reportkit.lorapok.tech` (5–30 min after custom domain add).
2. Re-run **Deploy site** after build fix lands on `main`.
3. GitHub Pages → confirm custom domain `reportkit.lorapok.tech` + HTTPS.
4. Archive old split repos; rotate any tokens exposed in chat.

## Do not

- Push package source to Shohoz Azure remotes
- Claim 50M rows are physically stored on free-tier D1 (use `synthetic` + `live` labels)
- Use real carrier or customer data in seeds (dummy only)
