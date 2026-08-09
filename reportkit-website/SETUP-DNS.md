# Phase 0 — DNS & secrets (manual)

## DNS records (at your `lorapok.tech` registrar / Cloudflare zone)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | `reportkit` | `Maijied.github.io` | DNS-only until GitHub TLS issues, then optional |
| CNAME | `api.reportkit` | Worker custom domain (set by Wrangler) | Proxied if zone is on Cloudflare |

If the zone is **not** on Cloudflare, use the Worker `*.workers.dev` hostname as a temporary API URL and set `PUBLIC_DEMO_API_URL` accordingly.

## GitHub Pages

1. Repo: https://github.com/Maijied/Reportkit-Core
2. Settings → Pages → Source: **GitHub Actions**
3. Custom domain: `reportkit.lorapok.tech`
4. Enforce HTTPS after the certificate is issued

## Cloudflare secrets (website repo)

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Deploy Worker + D1 migrations/seeds |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account UUID |
| `REPORTKIT_LIVE` | D1 database ID for `reportkit_live` |
| `REPORTKIT_ARCHIVE` | D1 database ID for `reportkit_archive` |
| `RELEASE_GITHUB_TOKEN` | Orchestrate package releases + cross-repo `repository_dispatch` (PAT: `repo` + `workflow`) |

Add secrets on **Maijied/Reportkit-Core** only: **Settings → Secrets and variables → Actions**.

### 1. Get your Cloudflare Account ID

1. Log in at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Open **Workers & Pages**
3. Copy **Account ID** from the right sidebar (32-character hex UUID)
4. Paste as GitHub secret `CLOUDFLARE_ACCOUNT_ID`

### 2. Create a Cloudflare API token

1. [Create API token](https://dash.cloudflare.com/profile/api-tokens) → **Edit Cloudflare Workers** (or custom)
2. Permissions (minimum):
   - **Account → Workers Scripts → Edit**
   - **Account → D1 → Edit**
   - **Account → Account Settings → Read**
3. Account resources: **Include → your account**
4. Create → copy once → paste as `CLOUDFLARE_API_TOKEN`

### 3. Create the two D1 databases

The demo merges **live** + **archive** SQLite databases.

#### Option A — Dashboard

1. **Workers & Pages → D1 SQL Database → Create**
2. Create **`reportkit_live`** → copy **Database ID**
3. Create **`reportkit_archive`** → copy **Database ID**
4. Add GitHub secrets (do **not** commit IDs to git):

| Secret | Value |
|--------|--------|
| `REPORTKIT_LIVE` | UUID from `reportkit_live` |
| `REPORTKIT_ARCHIVE` | UUID from `reportkit_archive` |

`worker/wrangler.toml` references `${REPORTKIT_LIVE}` and `${REPORTKIT_ARCHIVE}` — CI injects them at deploy/seed time.

#### Option B — Wrangler CLI

```bash
cd reportkit-website/worker
npm install
npx wrangler login
npx wrangler d1 create reportkit_live
npx wrangler d1 create reportkit_archive
```

Paste both printed `database_id` values into GitHub secrets `REPORTKIT_LIVE` and `REPORTKIT_ARCHIVE`.

### 4. Seed schema + demo data

After secrets are set on **Reportkit-Website**:

1. **Actions → Seed D1 (manual) → Run workflow**
2. Scale: `default` (use `large` only if needed)

Or locally:

```bash
cd worker
npm run seed:sql
npx wrangler d1 execute reportkit_live --remote --file=./schema/live.sql
npx wrangler d1 execute reportkit_archive --remote --file=./schema/archive.sql
npx wrangler d1 execute reportkit_live --remote --file=./seed/live.seed.sql
npx wrangler d1 execute reportkit_archive --remote --file=./seed/archive.seed.sql
```

### 5. Deploy the Worker

Push changes under `worker/` to `main`, or **Actions → Deploy Worker → Run workflow**.

- **Custom domain** (zone on Cloudflare): configure `routes` in `wrangler.toml` for `api.reportkit.lorapok.tech`
- **Otherwise**: use the `*.workers.dev` URL from the deploy log

Set the site API URL:

- `.env`: `PUBLIC_DEMO_API_URL=https://YOUR_WORKER_HOST`
- Or ensure the default in `src/lib/api.ts` matches your deployed Worker

### 6. Verify

```bash
curl -s "https://YOUR_WORKER_HOST/health"
curl -s "https://YOUR_WORKER_HOST/api/trips?start=2024-01-01&end=2024-01-31"
```

[reportkit.lorapok.tech/demo](https://reportkit.lorapok.tech/demo) → **Live dual-D1** should show real merge timings.

## Packagist / npm secrets (package repos)

| Repo | Secrets |
|------|---------|
| Reportkit-Core / Laravel / Legacy | `PACKAGIST_USER`, `PACKAGIST_TOKEN` |
| Reportkit-UI | `NPM_TOKEN` (automation token with **2FA bypass**, or npm Trusted Publishing) |

Published npm package: **`@lorapok-labs/reportkit-ui`** (org: `lorapok-labs`)

```bash
npm install @lorapok-labs/reportkit-ui@beta
```

See [VERSIONING.md](./VERSIONING.md) for beta release workflow.

## PAT hygiene

Package remotes must use clean HTTPS (`https://github.com/Maijied/...`) without embedded tokens.
Rotate any previously leaked `ghp_` token in GitHub → Settings → Developer settings → Personal access tokens.

## Pushing GitHub Actions workflows

The initial `gh` OAuth token lacked the `workflow` scope, so site content was pushed first and workflows remain **one commit ahead** locally. After refreshing scopes:

```bash
gh auth refresh -h github.com -s repo,workflow
cd reportkit-website && git push origin main
```

Then set Pages source to **GitHub Actions** and add Cloudflare secrets above.
