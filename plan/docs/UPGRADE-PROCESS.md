# Maintainer runbook — upgrade & release process

**Audience:** ReportKit monorepo maintainers  
**Related:** [Phase O](../phases/O-developer-upgrades.md)

---

## Release train

1. Complete phase tasks on `main`
2. Update `CHANGELOG.md` per package (Keep a Changelog)
3. Update `UPGRADE.md` + config migration table
4. Bump `composer.json` / `package.json` versions in sync
5. Run full CI matrix (PHP 5.6–8.x)
6. Tag: `core/v0.2.0-beta.1`, `laravel-legacy/v0.2.0-beta.1`, etc.
7. Packagist mirror sync workflow
8. Deploy site + verify sitemap
9. Post release note on GitHub Discussions

---

## Pre-release checklist

- [ ] `plan/PARITY-CHECKLIST.md` rows for this release marked done or N/A
- [ ] No `TODO` in public API without deprecation notice
- [ ] Brand assets synced (`scripts/sync-brand-assets.sh`)
- [ ] Docs synced (`reportkit-website/scripts/sync-docs.mjs`)
- [ ] SEO: new pages in sitemap
- [ ] Provenance labels on any new benchmark claims

---

## Host app upgrade verification

| Step | Command / check |
|------|-----------------|
| 1 | Read target `UPGRADE.md` |
| 2 | `composer update reportkit/*` |
| 3 | Merge new config keys from published stub |
| 4 | `php artisan reportkit:install` |
| 5 | Republish views if Blade partials changed |
| 6 | Clear browser cache for `reportkit-ui` assets |
| 7 | Run host test suite (e.g. `ExportReportCornerCaseTest`) |
| 8 | Enable `activity_log` in staging; verify overhead |

---

## Config merge strategy

Never overwrite host customizations silently.

1. Publish default config to `config/reportkit.php.new`
2. Maintainer merges new keys manually OR uses documented PHP array merge
3. `reportkit:doctor` (future) lists missing keys

---

## Deprecation workflow

```
Release N     → @deprecated log + docs
Release N+1   → runtime warning (dev only)
Release N+2   → remove API (MAJOR)
```

Document each step in `DEPRECATIONS.md` with dates.

---

## Brand asset upgrades

When Kit-Larva or logo changes (Phase M):

1. Update masters in `brand/`
2. Run PNG export + sync script
3. Bump `brand/version.txt` → `2.0`
4. Note in CHANGELOG: “Visual brand update — no API break”
5. Regenerate OG/marketing images (Phase N)

---

## Website doc sync

```bash
cd reportkit-website
npm run sync:docs
npm run build
# verify /docs/0.1/maintenance/*
```

---

## Rollback

| Layer | Action |
|-------|--------|
| Composer | Pin previous tag `0.1.*` |
| Views | Restore backed-up published blades |
| Assets | Pin npm `@lorapok-labs/reportkit-ui@0.1.x` |
| Config | Revert migration; remove new keys |

Document rollback in each version’s `UPGRADE.md` § Rollback.

---

## Future automation (planned)

- Renovate/Dependabot for monorepo internal refs
- `upgrade-smoke.yml` — sample L4.1 app CI
- Packagist verify strict on tag push
