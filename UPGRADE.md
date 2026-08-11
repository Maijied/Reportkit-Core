# ReportKit — upgrade guide (index)

Start here when moving between ReportKit versions. Each package has adapter-specific steps; the website collects the full migration story.

## Quick links

| Resource | Path |
|----------|------|
| Website overview | [reportkit.lorapok.tech/docs/0.1/maintenance/upgrade-overview](https://reportkit.lorapok.tech/docs/0.1/maintenance/upgrade-overview) |
| 0.1 → 0.2 beta | [upgrade-0.1-to-0.2](https://reportkit.lorapok.tech/docs/0.1/maintenance/upgrade-0.1-to-0.2) |
| Config key migrations | [config-migrations](https://reportkit.lorapok.tech/docs/0.1/maintenance/config-migrations) |
| Deprecations timeline | [deprecations](https://reportkit.lorapok.tech/docs/0.1/maintenance/deprecations) |
| Maintainer runbook | [plan/docs/UPGRADE-PROCESS.md](./plan/docs/UPGRADE-PROCESS.md) |

## Per-package guides

| Package | `UPGRADE.md` |
|---------|--------------|
| `reportkit/core` | [reportkit-core/docs/UPGRADE.md](./reportkit-core/docs/UPGRADE.md) |
| `reportkit/laravel` | [reportkit-laravel/docs/UPGRADE.md](./reportkit-laravel/docs/UPGRADE.md) |
| `reportkit/laravel-legacy` | [reportkit-laravel-legacy/docs/UPGRADE.md](./reportkit-laravel-legacy/docs/UPGRADE.md) |
| `@lorapok-labs/reportkit-ui` | [reportkit-ui/docs/UPGRADE.md](./reportkit-ui/docs/UPGRADE.md) |

## Typical host flow

1. Read the target version section in each package `UPGRADE.md` you depend on.
2. Update Composer / npm constraints together (core + adapter + ui).
3. Run `php artisan reportkit:install --with-config --publish-assets` (or legacy equivalent).
4. Merge new config keys — never overwrite host customizations silently.
5. Republish Blade views if partials changed.
6. Run your host test suite (e.g. export corner-case tests).

## Versioning

ReportKit follows [SemVer](https://semver.org/). Monorepo tags use package prefixes — see [MONOREPO.md](./MONOREPO.md).
