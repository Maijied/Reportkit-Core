# ReportKit monorepo

All ReportKit packages and the product website live in **one repository**:

**https://github.com/Maijied/Reportkit-Core**

## Layout

| Directory | Package | Registry |
|-----------|---------|----------|
| `reportkit-core/` | `reportkit/core` | Packagist |
| `reportkit-laravel/` | `reportkit/laravel` | Packagist |
| `reportkit-laravel-legacy/` | `reportkit/laravel-legacy` | Packagist |
| `reportkit-ui/` | `@lorapok-labs/reportkit-ui` | npm |
| `reportkit-website/` | Astro site + Cloudflare Worker demo | GitHub Pages |

## CI / releases

Workflows live in `.github/workflows/` at the repo root. Path filters limit runs to the package that changed.

Release tags use a **prefix per package** (monorepo-safe):

| Package | Tag example |
|---------|-------------|
| Core | `core/v0.1.1-beta.1` |
| Laravel | `laravel/v0.1.1-beta.1` |
| Laravel Legacy | `laravel-legacy/v0.1.1-beta.1` |
| UI | `ui/v0.1.1-beta.1` |

**Orchestrate beta release** (Actions) runs Core → Legacy + Laravel → UI → site deploy in order.

## Secrets (single repo)

Set on **Maijied/Reportkit-Core → Settings → Secrets → Actions**:

| Secret | Used by |
|--------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Worker + D1 |
| `CLOUDFLARE_API_TOKEN` | Worker + D1 |
| `REPORTKIT_LIVE` | D1 live DB UUID |
| `REPORTKIT_ARCHIVE` | D1 archive DB UUID |
| `PACKAGIST_USER` / `PACKAGIST_TOKEN` | PHP releases |
| `NPM_TOKEN` | npm publish |
| `RELEASE_GITHUB_TOKEN` | Optional; `github.token` works for same-repo orchestration |

## Deprecated split repos

These standalone repos are **superseded** by this monorepo — archived on GitHub:

- [Maijied/Reportkit-Laravel](https://github.com/Maijied/Reportkit-Laravel) → `reportkit-laravel/`
- [Maijied/Reportkit-Laravel-Legacy](https://github.com/Maijied/Reportkit-Laravel-Legacy) → `reportkit-laravel-legacy/`
- [Maijied/Reportkit-UI](https://github.com/Maijied/Reportkit-UI) → `reportkit-ui/`
- [Maijied/Reportkit-Website](https://github.com/Maijied/Reportkit-Website) → `reportkit-website/`

Update Packagist package URLs to `https://github.com/Maijied/Reportkit-Core` (subdir auto-detected).

**Runbook (both Laravel packages):** [reportkit-website/docs/PACKAGIST-MONOREPO.md](./reportkit-website/docs/PACKAGIST-MONOREPO.md)

After changing URLs on [packagist.org](https://packagist.org), run **Actions → Packagist sync** (strict verify + hook).
