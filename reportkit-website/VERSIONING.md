# ReportKit versioning & release automation

Current public channel: **beta** (`v0.1.x-beta.N`).

## SemVer tags

| Channel | Tag example | Packagist / npm |
|---------|-------------|-----------------|
| `beta` (default) | `v0.1.1-beta.1` | Composer `@beta` / npm dist-tag `beta` |
| `rc` | `v0.1.1-rc.1` | `@rc` / `rc` |
| `stable` | `v0.1.1` | default / npm `latest` |

Computation lives in `bin/next-version.sh` in every package repo:

```bash
./bin/next-version.sh beta prerelease          # → next beta from latest tag
./bin/next-version.sh beta prerelease v0.1.0   # → v0.1.1-beta.1
./bin/next-version.sh stable prerelease v0.1.0-beta.4  # → v0.1.0 (promote)
```

## One package release (Packagist / npm)

GitHub → Actions → **Release** (PHP) or **Publish npm** (UI) → Run workflow:

- **channel:** `beta` (default)
- **bump:** `prerelease` (default) | `patch` | `minor` | `major`
- **dry_run:** tick to preview only

Flow:

1. Dispatch computes next tag and pushes it  
2. Tag push creates GitHub Release (marked prerelease for beta/rc)  
3. Packagist `update-package` notify (needs secrets) / `npm publish --tag beta`  
4. Website receives `package-released` and rebuilds with live `versions.json`

## Orchestrate all packages

On **Reportkit-Website** → Actions → **Orchestrate beta release**:

1. Core  
2. Legacy + Laravel  
3. UI (optional)  
4. Site rebuild  

Requires secret **`RELEASE_GITHUB_TOKEN`** (PAT: `repo` + `workflow`) on the Website repo.  
Also set the same PAT (optional) on package repos if Actions must push tags with elevated rights.

## Required secrets

| Repo | Secrets |
|------|---------|
| Reportkit-Core / Laravel / Legacy | `PACKAGIST_USER`, `PACKAGIST_TOKEN` |
| Reportkit-UI | `NPM_TOKEN` (or npm trusted publishing) |
| Reportkit-Website | `RELEASE_GITHUB_TOKEN` (orchestrator + cross-repo dispatch) |

## Install beta packages

```bash
composer require reportkit/core:^0.1@beta reportkit/laravel:^0.1@beta
npm i @lorapok-labs/reportkit-ui@beta
```

Stable (when tagged without pre-release):

```bash
composer require reportkit/core reportkit/laravel
npm i @lorapok-labs/reportkit-ui
```

## Website deploy triggers

`Deploy site` runs on:

- push to `main`
- `repository_dispatch`: `docs-updated` | `package-released` | `release-orchestrated`
- manual `workflow_dispatch`

Each build runs `scripts/fetch-versions.mjs` so the homepage/docs show current beta/stable tags.
