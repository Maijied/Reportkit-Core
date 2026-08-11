# File touch index

Flat list of implementation paths by phase.

---

## Phase A — Config

- `reportkit-laravel-legacy/config/reportkit.php`
- `reportkit-laravel/config/reportkit.php`
- `reportkit-laravel-legacy/src/ReportKitServiceProvider.php`
- `reportkit-core/docs/CONFIGURATION.md` (new)

## Phase B — Core PHP

- `reportkit-core/src/Export/ExportHelper.php`
- `reportkit-core/src/Mail/MailService.php` (new)
- `reportkit-core/src/Logging/ActivityLog.php` (new)
- `reportkit-core/src/Table/SummaryBuilder.php` (new)
- `reportkit-core/src/Http/AjaxResponse.php` (new)
- `reportkit-laravel-legacy/src/Traits/HandlesReport*.php` (new)

## Phase C — Browser JS

- `reportkit-ui/js/reportkit.js` (+ modules)
- `reportkit-ui/docs/JS.md`

## Phase D — Scaffolds

- `reportkit-laravel-legacy/src/Console/MakeReportCommand.php`
- `reportkit-laravel-legacy/resources/stubs/*`

## Phase E — Blade

- `reportkit-laravel-legacy/resources/views/layouts/report.blade.php`
- `reportkit-laravel-legacy/resources/views/ui/*.blade.php`
- `reportkit-ui/css/reportkit.css`
- `reportkit-ui/css/reportkit-compat.css`

## Phase K — Ledger

- `reportkit-laravel-legacy/resources/views/ui/ledger-panel.blade.php` (new)
- `reportkit-laravel-legacy/resources/views/ui/filter-totals.blade.php` (new)
- `reportkit-laravel-legacy/resources/views/ui/txn-pill.blade.php` (new)

## Phase L — Simulation

- `reportkit-website/worker/src/ledger-synthetic.ts` (new)
- `reportkit-website/worker/seed/generate-ledger-seed.mjs` (new)
- `reportkit-website/src/pages/simulation.astro` (new)

## Phase M — Brand (Kit-Larva)

- `brand/reportkit-icon-larva.svg` (new master)
- `brand/animated/kit-larva-idle.gif`, `kit-larva-prepare.gif`
- `reportkit-website/scripts/sync-brand-assets.sh` (new)
- All paths in [M-brand-mascot.md](../phases/M-brand-mascot.md) rollout map

## Phase N — SEO

- `reportkit-website/src/components/SeoHead.astro` (new)
- `reportkit-website/public/llms.txt` (new)
- `reportkit-website/astro.config.mjs` — sitemap serialize
- `reportkit-website/src/pages/features.astro` (new)

## Phase O — Upgrade docs

- `reportkit-core/docs/UPGRADE.md`, `DEPRECATIONS.md`
- `plan/docs/UPGRADE-PROCESS.md`
- `reportkit-website/src/content/docs/0.1/maintenance/*`

## Phase F — Docs

- `reportkit-core/docs/BIG-DATABASE.md` (new)
- `reportkit-ui/docs/BLADE-COMPONENTS.md` (new)
- `reportkit-website/scripts/sync-docs.mjs`

## Phase H — Tests

- `reportkit-core/tests/**`
- `.github/workflows/core-ci.yml`

## Bus host (documented only)

- `app/views/export-report/report.blade.php`
- `app/views/clients-admin/billing-report.blade.php` (prepaid)
- `app/tests/ExportReportCornerCaseTest.php`
