# ReportKit workspace plan

**Status: complete** (2026-08-10) — all in-repo phases shipped; Lorapok Domain Hub remains a future separate project.

---

## Executive summary

| Area | Status |
|------|--------|
| Monorepo (`Maijied/Reportkit-Core`) | **Done** |
| Public site + demo | **Live** — [reportkit.lorapok.tech](https://reportkit.lorapok.tech) |
| Demo API (custom domain) | **Live** — [reportkit-api.lorapok.tech/v1/health](https://reportkit-api.lorapok.tech/v1/health) |
| D1 research seed | **Done** — 500k + 500k dummy rows |
| Cloudflare zone | **Done** — SSL fix, `reportkit-api` hostname |
| CI (site, worker, quality, seed) | **Green** |
| Domain hub blueprint | **Done** — doc only |
| Packagist monorepo URLs | **Partial** — `core` done; follow [PACKAGIST-MONOREPO.md](./reportkit-website/docs/PACKAGIST-MONOREPO.md) for `laravel` + `laravel-legacy` |
| Deprecated split repos | **Archived** on GitHub |

---

## Phase 6 — Research demo ✓

- [x] CI path filters + demo date range
- [x] README + architecture cover image
- [x] SETUP-DNS + Worker docs
- [x] D1 seed at `research` scale (500k + 500k)
- [x] Deploy Worker + site + smoke tests (live + synthetic 50M)

---

## Phase 7 — Cloudflare optimization ✓

- [x] Migrate `api.reportkit` → `reportkit-api.lorapok.tech` (GitHub Actions)
- [x] Site build uses custom API URL
- [x] SSL/TLS zone settings (via automation script)
- [x] Live verification — health, stats, demo page

Automation: [cloudflare-fix-api-domain.yml](./.github/workflows/cloudflare-fix-api-domain.yml) · [scripts/cloudflare-fix-api-domain.sh](./reportkit-website/scripts/cloudflare-fix-api-domain.sh)

---

## Phase 8 — Monorepo polish ✓

- [x] Footer + llms.txt + VersionBand → monorepo paths
- [x] INSTALL docs → single monorepo clone
- [x] Website README ecosystem table
- [x] [packagist-sync.yml](./.github/workflows/packagist-sync.yml) workflow
- [x] Archive deprecated GitHub repos
- [x] [MONOREPO.md](./MONOREPO.md) updated

---

## Live verification (2026-08-10)

| Check | Result |
|-------|--------|
| `https://reportkit.lorapok.tech/` | HTTP 200 |
| `https://reportkit.lorapok.tech/demo/` | HTTP 200 · API = `reportkit-api` |
| `https://reportkit-api.lorapok.tech/v1/health` | HTTP 200 · `ok: true` |
| `https://reportkit-api.lorapok.tech/v1/stats` | 500k + 500k rows |
| Synthetic mode | 50M virtual rows |
| Worker tests | 5/5 pass |
| Deploy site / Quality / Worker CI | Green |

---

## One-time manual follow-ups (external)

| Item | Action |
|------|--------|
| Packagist `laravel` + `laravel-legacy` | **[PACKAGIST-MONOREPO.md](./reportkit-website/docs/PACKAGIST-MONOREPO.md)** — Process A & B (web UI), then Process C (CI sync) |
| Orphan Advanced cert | Delete `api.reportkit` row in [Edge Certificates](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/ssl-tls/edge-certificates) if still visible |
| PAT hygiene | Rotate any exposed `ghp_` tokens |

---

## Future (out of scope for Reportkit-Core)

- **Lorapok Domain Hub** — separate repo; blueprint in [DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md](./reportkit-website/docs/DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md)
- Packagist stable channel cuts (`orchestrate-release.yml`)
- Certificate Transparency Monitoring (optional Cloudflare email alerts)

---

## Monorepo layout

| Directory | Package |
|-----------|---------|
| `reportkit-core/` | `reportkit/core` |
| `reportkit-laravel/` | `reportkit/laravel` |
| `reportkit-laravel-legacy/` | `reportkit/laravel-legacy` |
| `reportkit-ui/` | `@lorapok-labs/reportkit-ui` |
| `reportkit-website/` | Site + Worker |

See [MONOREPO.md](./MONOREPO.md) · [SETUP-DNS.md](./reportkit-website/SETUP-DNS.md)

---

## Do not

- Push package source to Shohoz Azure remotes
- Claim 50M rows are physically stored on free-tier D1
- Use real customer data in seeds
- Build Lorapok Domain Hub inside this repo
- Edit Worker bundle in Cloudflare dashboard (repo + CI only)
