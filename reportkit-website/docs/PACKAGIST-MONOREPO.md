# Packagist monorepo migration — `reportkit/laravel` + `reportkit/laravel-legacy`

One-time process to point both Laravel adapter packages at **[Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core)** after the split repos were archived.

> **`reportkit/core`** is already on the monorepo. This runbook covers the **two remaining PHP packages** used by the public demo/docs install path.

---

## Why this is manual

| Action | Packagist API | Packagist web UI |
|--------|---------------|------------------|
| Change **Repository URL** (one-time) | **Not supported** | **Required** for `laravel` + `laravel-legacy` |
| Trigger re-fetch after URL change | `POST /api/update-package` | “Update” button |
| Publish new versions | Git tags + webhook / CI notify | — |

The **`update-package` API only re-scans the URL already saved on packagist.org**. It cannot repoint a package from an archived repo to the monorepo.

---

## Target state

| Package | Monorepo path | Release tag prefix |
|---------|---------------|-------------------|
| `reportkit/core` | `reportkit-core/` | `core/v*` |
| `reportkit/laravel` | `reportkit-laravel/` | `laravel/v*` |
| `reportkit/laravel-legacy` | `reportkit-laravel-legacy/` | `laravel-legacy/v*` |

All three **Repository URL** values on Packagist must be:

```text
https://github.com/Maijied/Reportkit-Core
```

Packagist detects `composer.json` in subdirectories from prefixed tags (monorepo standard).

---

## Prerequisites

1. **Packagist maintainer** login for `reportkit/*` packages.
2. GitHub repo **[Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core)** — split repos already **archived**.
3. GitHub Actions secrets on Reportkit-Core (for post-migration sync):

| Secret | Purpose |
|--------|---------|
| `PACKAGIST_USER` | Packagist username |
| `PACKAGIST_TOKEN` | [Profile → API tokens](https://packagist.org/profile/) |

4. Optional local check:

```bash
bash reportkit-website/scripts/packagist-verify-monorepo.sh
```

---

## Process A — `reportkit/laravel` (Laravel 5.5+)

### A1. Open package settings

1. Go to **[packagist.org/packages/reportkit/laravel](https://packagist.org/packages/reportkit/laravel)**.
2. Log in as a maintainer.
3. Click **Settings** (gear) or **Edit** (wording varies by Packagist UI version).

### A2. Change repository URL

| Field | Old (wrong — archived) | New (correct) |
|-------|------------------------|---------------|
| **Repository URL** | `https://github.com/Maijied/Reportkit-Laravel` | `https://github.com/Maijied/Reportkit-Core` |

- Do **not** add a subdirectory path in the URL — Packagist reads tags like `laravel/v0.1.x-beta.1`.
- Save / Submit.

### A3. Trigger first scan

On the same package page:

- Click **Update** (or wait for GitHub webhook if the monorepo is linked to your Packagist account).

### A4. Verify

```bash
curl -sS 'https://packagist.org/packages/reportkit/laravel.json' \
  | jq -r '.package.repository'
# expected: https://github.com/Maijied/Reportkit-Core
```

---

## Process B — `reportkit/laravel-legacy` (Laravel 4.1–5.4)

Repeat **Process A** for the legacy adapter:

| Field | Old (wrong — archived) | New (correct) |
|-------|------------------------|---------------|
| **Repository URL** | `https://github.com/Maijied/Reportkit-Laravel-Legacy` | `https://github.com/Maijied/Reportkit-Core` |

Links:

- Package: **[packagist.org/packages/reportkit/laravel-legacy](https://packagist.org/packages/reportkit/laravel-legacy)**
- Monorepo source: [`reportkit-laravel-legacy/`](https://github.com/Maijied/Reportkit-Core/tree/main/reportkit-laravel-legacy)

Verify:

```bash
curl -sS 'https://packagist.org/packages/reportkit/laravel-legacy.json' \
  | jq -r '.package.repository'
# expected: https://github.com/Maijied/Reportkit-Core
```

---

## Process C — CI sync (both packages + core)

After **both** URLs are updated on packagist.org:

1. Open **[Actions → Packagist sync](https://github.com/Maijied/Reportkit-Core/actions/workflows/packagist-sync.yml)**.
2. **Run workflow** → leave **Strict verify** = `true`.
3. Workflow will:
   - Print all three repository URLs
   - **Fail** if `laravel` or `laravel-legacy` still point at archived repos
   - Call `update-package` for the monorepo (refreshes Packagist metadata)

Or from CLI:

```bash
gh workflow run packagist-sync.yml --repo Maijied/Reportkit-Core -f strict=true
gh run list --repo Maijied/Reportkit-Core --workflow=packagist-sync.yml --limit 1
```

---

## Process D — End-to-end verification (demo install path)

Confirms Packagist serves installable betas for **both** adapters (what docs/demo consumers use).

### D1. Automated script (repo root)

```bash
bash reportkit-website/scripts/packagist-verify-monorepo.sh --strict
```

Exit `0` = all three packages point at the monorepo.

### D2. Composer smoke test (optional, local)

```bash
mkdir -p /tmp/rk-packagist-test && cd /tmp/rk-packagist-test
cat > composer.json <<'EOF'
{
  "name": "lorapok/packagist-smoke",
  "require": {
    "reportkit/core": "^0.1@beta",
    "reportkit/laravel": "^0.1@beta",
    "reportkit/laravel-legacy": "^0.1@beta"
  },
  "minimum-stability": "beta",
  "prefer-stable": false
}
EOF
composer update --no-install 2>&1 | tail -20
# Expect resolution from packagist.org, not github.com/Maijied/Reportkit-Laravel*
```

> You only need **one** of `laravel` or `laravel-legacy` in a real app — both are listed here to prove **both** Packagist entries work.

### D3. Demo site version band

After the next **Deploy site** run, [reportkit.lorapok.tech](https://reportkit.lorapok.tech) **Live versions** should show current beta tags for all PHP packages (built from `fetch-versions.mjs` + GitHub Releases).

---

## Checklist (copy/paste)

```text
[ ] reportkit/laravel Repository URL → https://github.com/Maijied/Reportkit-Core
[ ] reportkit/laravel-legacy Repository URL → https://github.com/Maijied/Reportkit-Core
[ ] Packagist “Update” clicked on both packages (or webhook fired)
[ ] bash reportkit-website/scripts/packagist-verify-monorepo.sh --strict  → exit 0
[ ] gh workflow run packagist-sync.yml -f strict=true  → green
[ ] composer require smoke test (optional)
[ ] PLAN.md Packagist row → Done
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Packagist still shows old GitHub URL after edit | Hard refresh; wait 1–2 min; click **Update** on package page |
| `update-package` returns success but no new versions | Ensure monorepo has tags `laravel/v*` / `laravel-legacy/v*` |
| Composer resolves archived repo | Repository URL not saved yet — repeat Process A/B |
| “Package not found” for beta | Run **Orchestrate beta release** or check tag exists on monorepo |
| Strict CI fails | Read workflow log for which package still has wrong URL |

---

## Ongoing releases (after migration)

| Event | What happens |
|-------|----------------|
| Tag `laravel/v0.1.x` on `main` | `laravel-release.yml` → GitHub Release → Packagist notify |
| Tag `laravel-legacy/v0.1.x` | `laravel-legacy-release.yml` → same |
| Manual refresh | **Actions → Packagist sync** |

See [VERSIONING.md](../VERSIONING.md) and [MONOREPO.md](../../MONOREPO.md).

---

## Related

- [MONOREPO.md](../../MONOREPO.md) — layout + archived repos
- [SETUP-DNS.md](../SETUP-DNS.md) — secrets including `PACKAGIST_*`
- [PLAN.md](../../PLAN.md) — workspace status
- Workflow: [.github/workflows/packagist-sync.yml](../../.github/workflows/packagist-sync.yml)
