# Phase 0 — DNS & secrets (manual)

> **Future automation:** See [DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md](./docs/DOMAIN-CONTROL-PANEL-INSTRUCTIONS.md) for the planned Google Sign-In control panel that will automate subdomain + Cloudflare Worker setup from a web UI.

**Registrar:** [get.tech](https://get.tech) (`.tech` domains) — client area DNS panel matches the tabs in your screenshot (Overview · DNS · Domain Forwarding · Email).

## DNS records (get.tech today vs Cloudflare after migration)

| Type | Name | Value | Where to set |
|------|------|-------|--------------|
| CNAME | `reportkit` | `Maijied.github.io` | **get.tech** → DNS → DNS Records *(already done ✓)* |
| Worker | `api.reportkit` | Cloudflare Worker `reportkit-demo-api` | **Cloudflare only** — after nameserver migration (see below) |

**Do not add `api.reportkit` at get.tech** while nameservers still point to get.tech. Worker custom domains require Cloudflare to control DNS for `lorapok.tech`.

If the zone is **not** on Cloudflare yet, use the Worker `*.workers.dev` URL as a temporary API:
`https://reportkit-demo-api.mdshuvo40.workers.dev`

---

## Full process — get.tech → Cloudflare → Worker API

### A. Site on GitHub Pages (done at get.tech)

1. **get.tech** → [client area](https://get.tech) → **lorapok.tech** → **DNS** → **DNS Records**
2. CNAME **`reportkit`** → **`Maijied.github.io`** (TTL Auto) — you already have this.
3. GitHub: **[Reportkit-Core → Settings → Pages](https://github.com/Maijied/Reportkit-Core/settings/pages)** → custom domain **`reportkit.lorapok.tech`** → enable HTTPS when ready.

### B. Move `lorapok.tech` DNS to Cloudflare (required for `api.reportkit`)

1. **Add site:** [Cloudflare — Add site](https://dash.cloudflare.com/add-site) → enter **`lorapok.tech`** → Free plan.
2. Cloudflare scans DNS — confirm **`reportkit`** CNAME → **`Maijied.github.io`** is imported.
3. **get.tech** → **lorapok.tech** → **DNS** → **DNSSEC** → **disable** DNSSEC if enabled (required before nameserver change).
4. Copy Cloudflare’s two nameservers from the zone **Overview** (e.g. `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`).
5. **get.tech** → **lorapok.tech** → **DNS** → **Nameservers** → replace get.tech nameservers with Cloudflare’s two NS (exact copy).
6. Wait until Cloudflare zone status = **Active** (minutes to 24h). Check: [whatsmydns.net](https://www.whatsmydns.net/#NS/lorapok.tech).

After this, **stop editing DNS Records at get.tech** — manage records in [Cloudflare DNS](https://dash.cloudflare.com) only.

### C. Worker custom domain `api.reportkit.lorapok.tech`

1. Deploy latest Worker: [Actions → Deploy Worker](https://github.com/Maijied/Reportkit-Core/actions/workflows/deploy-worker.yml) (or push `worker/`).
2. **Workers & Pages** → **[reportkit-demo-api → Settings → Domains](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/workers/services/view/reportkit-demo-api/production/settings)** → **Add custom domain** → **`api.reportkit.lorapok.tech`** → **Continue**.
3. Cloudflare creates a **proxied** DNS record automatically (orange cloud). No manual row at get.tech.
4. Verify:
   ```bash
   curl -s https://api.reportkit.lorapok.tech/v1/health
   ```

Docs: [Workers custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) · [Cloudflare full setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)

### D. Seed dummy data + deploy site

| Step | Link |
|------|------|
| Seed D1 (`research` = 1M dummy rows) | [Actions → Seed D1](https://github.com/Maijied/Reportkit-Core/actions/workflows/seed-d1.yml) |
| Deploy site | [Actions → Deploy site](https://github.com/Maijied/Reportkit-Core/actions/workflows/deploy-site.yml) |
| Live demo | [reportkit.lorapok.tech/demo](https://reportkit.lorapok.tech/demo) |

---

## DNS records reference (after Cloudflare migration)

---

## `api.reportkit` — Worker custom domain (step by step)

**Prerequisite:** `lorapok.tech` must be an active zone on the **same Cloudflare account** as the Worker (`account_id` in `wrangler.toml`).

### Step 1 — Route in Wrangler (dashboard preferred)

**Do not edit the deployed Worker bundle in Cloudflare.** All API code is controlled by CI:

| What | Where to change |
|------|-----------------|
| Worker logic (`index.ts`, `generate.ts`, …) | Git repo → push `main` → **Deploy Worker** workflow |
| Custom domain `api.reportkit.lorapok.tech` | **Cloudflare dashboard** (below) |
| Dummy seed data | **Seed D1 (manual)** workflow or `scripts/seed-apply-remote.sh` |

`wrangler.toml` keeps `workers_dev = true` so `*.workers.dev` stays available as a fallback. Custom domain is attached in the dashboard, not via `routes` in wrangler (that requires `lorapok.tech` as a zone on this account).

**Optional (after zone is on Cloudflare):** uncomment a route in `wrangler.toml` only if you want CI to manage the route instead of the dashboard.

### Step 2 — Deploy the Worker

Push to `main` (paths under `reportkit-website/worker/**`) or run **Actions → Deploy Worker → Run workflow**.

CI injects D1 IDs from secrets `REPORTKIT_LIVE` and `REPORTKIT_ARCHIVE` before deploy.

### Step 3 — DNS record in Cloudflare

1. Open **[Cloudflare Dashboard](https://dash.cloudflare.com)** → zone **`lorapok.tech`** → **DNS → Records**
2. After a successful deploy, check **Workers & Pages → reportkit-demo-api → Settings → Domains & Routes**
3. If no record exists yet, add:

| Field | Value |
|-------|--------|
| **Type** | `AAAA` + `AAAA` (Worker custom hostname) *or* follow dashboard “Add custom domain” |
| **Name** | `api.reportkit` |
| **Target** | Assigned by Cloudflare when you attach the custom domain to the Worker |
| **Proxy status** | **Proxied** (orange cloud) |

**Recommended (dashboard):**

1. **Workers & Pages** → **reportkit-demo-api** → **Settings** → **Domains & Routes**
2. **Add** → **Custom domain** → enter `api.reportkit.lorapok.tech`
3. Cloudflare creates/updates DNS automatically when the zone is on Cloudflare

**Manual CNAME (if dashboard asks):**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `api.reportkit` | `<worker-subdomain>.workers.dev` or target shown in Workers UI | Proxied |

> The exact target string is shown in the Worker **Custom domains** panel after you add `api.reportkit.lorapok.tech`. Do not guess — copy from the dashboard.

### Step 4 — Verify TLS and API

Wait 1–5 minutes for certificate issuance, then:

```bash
curl -s "https://api.reportkit.lorapok.tech/v1/health"
curl -s "https://api.reportkit.lorapok.tech/v1/stats"
```

Expected: JSON with `"ok": true"` and dummy row stats after seeding.

### Step 5 — Point the site at the API

Site build reads **`PUBLIC_DEMO_API_URL`** at build time:

- **Production (after DNS live):** `https://api.reportkit.lorapok.tech` (set in `.github/workflows/deploy-site.yml`)
- **Temporary:** `https://reportkit-demo-api.mdshuvo40.workers.dev`

Local dev: copy `reportkit-website/.env.example` → `.env` and set `PUBLIC_DEMO_API_URL`.

---

## GitHub Pages

1. Repo: https://github.com/Maijied/Reportkit-Core
2. Settings → Pages → Source: **GitHub Actions**
3. Custom domain: `reportkit.lorapok.tech`
4. Enforce HTTPS after the certificate is issued

---

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

### 2. Create a Cloudflare Account API token

Use **Account API tokens** (recommended for CI — not tied to a user session):

1. [Account API tokens](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/api-tokens) → **Create Token** → custom name **`reportkit`**
2. Permissions (minimum):
   - **Account → Workers Scripts → Edit**
   - **Account → D1 → Edit**
   - **Account → Account Settings → Read** (and **Write** if offered)
3. Account resources: **Entire account** (`f049faaf2f67549f5c58837479596a4a`)
4. **Create** or **Roll** → copy once → GitHub secret **`CLOUDFLARE_API_TOKEN`**

After editing permissions, **Roll** the token and update GitHub — editing alone does not refresh the secret value.

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

### 4. Seed schema + dummy demo data

After secrets are set on **Reportkit-Core**:

1. **Actions → Seed D1 (manual) → Run workflow**
2. Scale: **`research`** (500k + 500k dummy rows, ~30–90 min). Use `default` (2k + 2k) for a quick smoke test.

Or locally:

```bash
cd reportkit-website/worker
SEED_SCALE=research npm run seed:sql
bash scripts/seed-apply-remote.sh
```

All seeded operators and routes are **fictional** — see `seed/operators.json`.

### 5. Deploy the Worker

Push changes under `worker/` to `main`, or **Actions → Deploy Worker → Run workflow**.

- **Custom domain:** `api.reportkit.lorapok.tech` (see section above)
- **Fallback:** `*.workers.dev` URL from the deploy log

### 6. Verify

```bash
curl -s "https://api.reportkit.lorapok.tech/v1/health"
curl -s "https://api.reportkit.lorapok.tech/v1/stats"
curl -s "https://api.reportkit.lorapok.tech/v1/data?start_date=2012-01-01&end_date=2017-12-31&start=0&length=5"
```

[reportkit.lorapok.tech/demo](https://reportkit.lorapok.tech/demo) → **Live dual-D1** should show merge timings with provenance badge `live`.

---

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
