# Packagist — monorepo + Laravel mirror repos

How **`reportkit/core`**, **`reportkit/laravel`**, and **`reportkit/laravel-legacy`** stay installable from Packagist while **Reportkit-Core** remains the single source of truth.

---

## Why Laravel packages cannot use the monorepo URL on Packagist.org

Packagist.org (free) validates that **`composer.json` exists at the repository root** on the default branch.

| Repo layout | Packagist URL | Works? |
|-------------|---------------|--------|
| `reportkit-core/composer.json` only | `https://github.com/Maijied/Reportkit-Core` | **Only for `reportkit/core`** (legacy root tags) |
| `reportkit-laravel/composer.json` in subdir | same monorepo URL | **Rejected** — `No composer.json was found in the main branch` |
| `reportkit-laravel/` mirrored to root of split repo | `https://github.com/Maijied/Reportkit-Laravel` | **Works** |

Direct monorepo URLs for the Laravel adapters **cannot** be saved (web UI or `PUT /api/packages/...`).

**Solution:** automated **mirror sync** from monorepo subdirs → split GitHub repos → existing Packagist entries.

---

## Target layout

| Packagist package | Packagist repository URL | Source in monorepo |
|-------------------|--------------------------|-------------------|
| `reportkit/core` | `https://github.com/Maijied/Reportkit-Core` | `reportkit-core/` |
| `reportkit/laravel` | `https://github.com/Maijied/Reportkit-Laravel` | `reportkit-laravel/` (mirrored) |
| `reportkit/laravel-legacy` | `https://github.com/Maijied/Reportkit-Laravel-Legacy` | `reportkit-laravel-legacy/` (mirrored) |

Monorepo release tags (source of truth):

| Package | Tag prefix | Example |
|---------|------------|---------|
| Core | `core/v*` | `core/v0.1.1-beta.1` |
| Laravel | `laravel/v*` | `laravel/v0.1.1-beta.1` → mirror tag `v0.1.1-beta.1` |
| Legacy | `laravel-legacy/v*` | `laravel-legacy/v0.1.1-beta.1` → mirror tag `v0.1.1-beta.1` |

---

## Process — run once (or when fixing drift)

### 1. Unarchive mirror repos (if archived)

```bash
gh api -X PATCH repos/Maijied/Reportkit-Laravel -f archived=false
gh api -X PATCH repos/Maijied/Reportkit-Laravel-Legacy -f archived=false
```

### 2. Mirror monorepo → split repos (CI)

```bash
gh workflow run packagist-mirror-sync.yml --repo Maijied/Reportkit-Core
gh run list --repo Maijied/Reportkit-Core --workflow=packagist-mirror-sync.yml --limit 1
```

This workflow:

1. Rsyncs `reportkit-laravel/` → **Reportkit-Laravel** `main`
2. Rsyncs `reportkit-laravel-legacy/` → **Reportkit-Laravel-Legacy** `main`
3. Copies prefixed monorepo tags to mirror repos as `v*`
4. Calls Packagist `update-package` on both mirror URLs

Script (local): `bash reportkit-website/scripts/packagist-mirror-subdir.sh reportkit-laravel Maijied/Reportkit-Laravel laravel/`

### 3. Verify

```bash
bash reportkit-website/scripts/packagist-verify-monorepo.sh --strict
```

Expected:

```text
reportkit/core              → Reportkit-Core            OK
reportkit/laravel           → Reportkit-Laravel         OK
reportkit/laravel-legacy    → Reportkit-Laravel-Legacy  OK
```

### 4. Optional — click Update in Packagist UI

- [reportkit/laravel](https://packagist.org/packages/reportkit/laravel) → **Update**
- [reportkit/laravel-legacy](https://packagist.org/packages/reportkit/laravel-legacy) → **Update**

---

## Ongoing automation

| Event | What runs |
|-------|-----------|
| Push to `main` under `reportkit-laravel/**` or `reportkit-laravel-legacy/**` | [packagist-mirror-sync.yml](../../.github/workflows/packagist-mirror-sync.yml) |
| Tag `laravel/v*` or `laravel-legacy/v*` on monorepo | Mirror sync + Packagist notify |
| Manual refresh | **Actions → Packagist mirror sync** or **Packagist sync** |

Release flows (`laravel-release.yml`, etc.) still tag the **monorepo**; mirror sync propagates to Packagist.

---

## Checklist

```text
[ ] Mirror repos unarchived
[ ] gh workflow run packagist-mirror-sync.yml  → green
[ ] packagist-verify-monorepo.sh --strict  → exit 0
[ ] composer require reportkit/laravel:^0.1@beta  (optional smoke test)
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `No composer.json in main branch` when editing Packagist URL to monorepo | Expected — use mirror repos, not monorepo URL |
| Mirror push 403 | Unarchive target repo |
| Packagist stale versions | Run mirror sync, then Update on package page |
| Verify WRONG for laravel | Run mirror sync; URLs should stay on split repos |

---

## Related

- [MONOREPO.md](../../MONOREPO.md)
- [packagist-sync.yml](../../.github/workflows/packagist-sync.yml) — verify + hook
- [packagist-mirror-sync.yml](../../.github/workflows/packagist-mirror-sync.yml) — mirror automation
