# ReportKit local workspace plan

## Status (2026-08-10)

| Phase | Status |
|-------|--------|
| Monorepo consolidation | **Done** — `Maijied/Reportkit-Core` |
| README + architecture image | **Done** — `brand/cover-same-server-different-architecture.png` |
| Website + Worker + D1 | Workflows fixed; secrets on **Reportkit-Core** |
| Research-aligned dummy seed | **Committed** — dual schema, 2012→now, operator cross-ref |
| D1 re-seed (research) | **Manual** — run **Seed D1** workflow, scale `research` |
| `api.reportkit` custom domain | **Wrangler route enabled** — deploy Worker + Cloudflare DNS (see SETUP-DNS.md) |
| Packagist / npm | Update package URLs to monorepo on Packagist |

## Task checklist

- [x] **T1** Fix `deploy-site.yml` path filters + `PUBLIC_DEMO_API_URL`
- [x] **T2** Fix `quality.yml` path filters
- [x] **T3** Update `demo.astro` default date range (2012 → 2026-08-10)
- [x] **T4** Update `SETUP-DNS.md` + enable Worker route in `wrangler.toml`
- [x] **T5** Detailed README with architecture + cover image
- [x] **T6** Run worker tests
- [x] **T7** Commit Phase 6
- [ ] **T8** Push to `origin/main` (in progress)
- [ ] **T9** Run **Seed D1** workflow (`research`)
- [ ] **T10** Run **Deploy Worker** workflow
- [ ] **T11** Run **Deploy site** workflow
- [ ] **T12** Smoke test API + `/demo`

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

### Manual steps after push

1. **Cloudflare DNS** — add Worker custom domain `api.reportkit.lorapok.tech` (proxied). See [SETUP-DNS.md](./reportkit-website/SETUP-DNS.md).
2. Run **Seed D1 (manual)** → scale `research` (~30–90 min).
3. Run **Deploy Worker** → attaches route + new code.
4. Run **Deploy site** → GitHub Pages with API URL baked in.
5. Archive old split repos; rotate any tokens exposed in chat.

## Do not

- Push package source to Shohoz Azure remotes
- Claim 50M rows are physically stored on free-tier D1 (use `synthetic` + `live` labels)
- Use real carrier or customer data in seeds (dummy only)
