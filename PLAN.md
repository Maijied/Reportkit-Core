# ReportKit workspace plan

## Status (2026-08-10, verified live)

| Phase | Status |
|-------|--------|
| Monorepo consolidation | **Done** — [Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core) |
| README + architecture image | **Done** — `brand/cover-same-server-different-architecture.png` |
| Website + Worker + D1 | **Done** — CI green |
| Research-aligned dummy seed (code) | **Done** — dual schema, generator, Worker API |
| D1 re-seed (`research` 1M rows) | **Done** — remote: **500k + 500k** (`live_rows` / `archive_rows`) |
| Cloudflare zone `lorapok.tech` | **Active** — NS at get.tech → Cloudflare |
| GitHub Pages site | **Done** — `reportkit.lorapok.tech` HTTP 200 (`/` + `/demo`) |
| Site → API URL (build) | **Pending redeploy** — `deploy-site.yml` → `reportkit-api.lorapok.tech` |
| Worker custom domain SSL | **Done** — `reportkit-api.lorapok.tech` TLS OK |
| Domain control panel spec | **Done** — doc only ([DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md](./reportkit-website/docs/DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md)) |
| Packagist URLs → monorepo | **Partial** — `core` updated; `laravel`, `laravel-legacy` still old repos |

---

## Phase 6 — Research demo (complete)

- [x] **T1** Fix `deploy-site.yml` path filters + `PUBLIC_DEMO_API_URL`
- [x] **T2** Fix `quality.yml` path filters
- [x] **T3** Update `demo.astro` default date range (2012 → 2026-08-10)
- [x] **T4** Update `SETUP-DNS.md` + Worker custom domain docs
- [x] **T5** Detailed README with architecture + cover image
- [x] **T6** Run worker tests (5/5 pass)
- [x] **T7** Commit Phase 6
- [x] **T8** Push to `origin/main`
- [x] **T9** Seed D1 at `research` scale — **500k + 500k** on remote D1
- [x] **T10** Deploy Worker — live at `reportkit-demo-api.mdshuvo40.workers.dev`
- [x] **T11** Deploy site — GitHub Pages on `reportkit.lorapok.tech`
- [x] **T12** Smoke test — workers.dev + synthetic 50M + live merge OK

---

## Phase 7 — Cloudflare optimization (in progress)

**Goal:** Fix API TLS on Free plan, enable safe zone features, then point the site build at the custom API hostname.

### 7.1 SSL fix (manual — Cloudflare dashboard)

Root cause (confirmed on **SSL/TLS → Edge Certificates**):

| Certificate | Hosts | Status |
|-------------|-------|--------|
| Universal | `*.lorapok.tech`, `lorapok.tech` | **Active** |
| Advanced (Worker) | `api.reportkit.lorapok.tech` | **Pending Validation (Error)** |

Free Universal SSL covers **one** label under the zone (`reportkit-api.lorapok.tech`), not nested names (`api.reportkit.lorapok.tech`).

| Step | Action | Dashboard |
|------|--------|-----------|
| 7.1a | Remove Worker custom domain `api.reportkit.lorapok.tech` | [Worker Domains](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/workers/services/view/reportkit-demo-api/production/settings) |
| 7.1b | Delete failed Advanced certificate | [Edge Certificates](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/ssl-tls/edge-certificates) |
| 7.1c | Add Worker custom domain **`reportkit-api.lorapok.tech`** | Worker Domains (proxied DNS auto-created) |
| 7.1d | Verify TLS | `curl -s https://reportkit-api.lorapok.tech/v1/health` |
| 7.1e | Switch site build URL | Set `PUBLIC_DEMO_API_URL` in `.github/workflows/deploy-site.yml` → `https://reportkit-api.lorapok.tech` and redeploy site |

Until 7.1d passes, keep **`workers.dev`** in CI (current).

### 7.2 Enable Cloudflare features (lorapok.tech, Free plan)

Safe for ReportKit **now** (proxied Worker + zone defaults):

| Feature | Setting | Why |
|---------|---------|-----|
| Encryption mode | **Full (strict)** | Worker origin is Cloudflare-managed |
| Always Use HTTPS | **On** | Redirect HTTP on proxied hostnames |
| TLS 1.3 | **On** | Already recommended |
| Automatic HTTPS Rewrites | **On** | Fix mixed content on proxied routes |
| Minimum TLS version | **1.2** | Baseline security |

**Leave off for now** (can break demo API fetches):

| Feature | Reason |
|---------|--------|
| Bot Fight Mode | May challenge browser `fetch()` to Worker API |
| Under Attack Mode | Same |

**GitHub Pages (`reportkit` CNAME):** keep **DNS only** (grey cloud). TLS is issued by GitHub, not Cloudflare edge.

Dashboard links: [SSL overview](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/ssl-tls) · [Edge Certificates](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/ssl-tls/edge-certificates) · [DNS](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/dns/records)

Full checklist: [DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md §0](./reportkit-website/docs/DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md)

### 7.3 Phase 7 checklist

- [x] **7.1** Migrate API hostname `api.reportkit` → `reportkit-api` (via GitHub Actions)
- [x] **7.2** Enable SSL/TLS settings (workflow; warnings OK if token lacks zone edit)
- [ ] **7.3** Update `PUBLIC_DEMO_API_URL` in deploy-site and redeploy site
- [ ] **7.4** Re-run site deploy + demo smoke test (live mode, provenance badge)
- [ ] **7.5** Optional: enable **Certificate Transparency Monitoring** (email alerts)

---

## Verification snapshot (2026-08-10)

| Check | Result |
|-------|--------|
| `GET /v1/health` (workers.dev) | `ok: true` |
| `GET /v1/stats` (workers.dev) | `live_rows: 500000`, `archive_rows: 500000` |
| `GET /v1/data?mode=synthetic` | `recordsTotal: 50000000` |
| `https://reportkit.lorapok.tech/` | HTTP **200** |
| `https://reportkit.lorapok.tech/demo/` | HTTP **200** |
| `https://reportkit-api.lorapok.tech/v1/health` | HTTP **200** |
| `https://api.reportkit.lorapok.tech/v1/health` | **Removed** (NXDOMAIN) |
| Worker tests | 5/5 pass |
| Deploy site / Quality / Worker CI | Green |

---

## Remaining actions (priority order)

1. **Cloudflare SSL fix** — Phase 7.1 (dashboard; Browser MCP disconnected — manual or reconnect)
2. **Switch site API URL** — after `reportkit-api` TLS works
3. **Packagist** — update `reportkit/laravel` and `reportkit/laravel-legacy` repo URLs to monorepo
4. **Optional** — archive `Maijied/Reportkit-Website`; rotate any exposed tokens
5. **Future** — build **Lorapok Domain Hub** in separate repo (blueprint only in Reportkit-Core)

---

## Monorepo layout

Everything lives in **[Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core)**. See [MONOREPO.md](./MONOREPO.md).

| Directory | Package |
|-----------|---------|
| `reportkit-core/` | `reportkit/core` |
| `reportkit-laravel/` | `reportkit/laravel` |
| `reportkit-laravel-legacy/` | `reportkit/laravel-legacy` |
| `reportkit-ui/` | `@lorapok-labs/reportkit-ui` |
| `reportkit-website/` | Site + Worker |

---

## Do not

- Push package source to Shohoz Azure remotes
- Claim 50M rows are physically stored on free-tier D1 (use `synthetic` + `live` labels)
- Use real carrier or customer data in seeds (dummy only)
- Build the Lorapok Domain Hub inside Reportkit-Core
- Edit the Worker bundle in the Cloudflare dashboard (repo + CI only)
