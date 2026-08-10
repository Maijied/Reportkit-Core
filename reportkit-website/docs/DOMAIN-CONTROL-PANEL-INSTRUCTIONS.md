# Lorapok Domain Hub — instructions (separate repo)

**Status:** Instructions only. **Do not build this inside Reportkit-Core.**

Build this product in a **new GitHub repository** (suggested name: `Lorapok-Domain-Hub` or `lorapok-control`). This file lives in Reportkit-Core only as a **reference blueprint** for that future project.

**What it replaces:** Manual steps in [SETUP-DNS.md](../SETUP-DNS.md), Cloudflare dashboard clicking, and scattered GitHub Pages / Actions configuration.

**Reference zone (example):** [lorapok.tech](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech) · account `f049faaf2f67549f5c58837479596a4a`

---

## 0. ReportKit zone — immediate actions (this project)

Use this section **today** in Reportkit-Core + Cloudflare dashboard. The Lorapok Domain Hub (§1+) automates this later in a **separate repo**.

### 0.1 Live audit — `lorapok.tech` (2026-08-10, post-fix)

| Item | Status |
|------|--------|
| Zone status | **Active** |
| Site `reportkit.lorapok.tech` | GitHub Pages · HTTP 200 |
| API `reportkit-api.lorapok.tech` | Worker custom domain · TLS OK · HTTP 200 |
| D1 demo data | **500k + 500k** rows (`live` mode) |
| Nested `api.reportkit.lorapok.tech` | **Removed** |
| Universal SSL | `*.lorapok.tech` — **Active** |
| Site build API URL | `https://reportkit-api.lorapok.tech` |

### 0.2 Fix API SSL (Free plan — required)

**Problem:** `api.reportkit.lorapok.tech` is a **nested** subdomain (two labels under `lorapok.tech`). Universal SSL on Free only covers `{one-label}.lorapok.tech`. Attaching this Worker hostname requests an Advanced certificate that fails validation.

**Fix (≈10 minutes):**

1. **[Workers → reportkit-demo-api → Domains](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/workers/services/view/reportkit-demo-api/production/settings)** → remove **`api.reportkit.lorapok.tech`**
2. **[SSL/TLS → Edge Certificates](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/ssl-tls/edge-certificates)** → delete the failed **Advanced** row for `api.reportkit.lorapok.tech`
3. Same Worker **Domains** panel → **Add custom domain** → **`reportkit-api.lorapok.tech`** → Continue (proxied DNS auto-created)
4. Wait 1–5 min, then verify:
   ```bash
   curl -s https://reportkit-api.lorapok.tech/v1/health
   curl -s https://reportkit-api.lorapok.tech/v1/stats
   ```
5. In Reportkit-Core: set `PUBLIC_DEMO_API_URL=https://reportkit-api.lorapok.tech` in `.github/workflows/deploy-site.yml` → run **Deploy site**

**Do not** rename to another nested pattern (e.g. `v1.api.lorapok.tech`). Enforce **one label** before the zone (see §5).

Until step 4 passes, CI keeps `https://reportkit-demo-api.mdshuvo40.workers.dev` as the demo API URL.

### 0.3 Enable Cloudflare features for ReportKit (Free plan)

Apply on zone **[lorapok.tech](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech)**:

| Area | Feature | Recommended | Dashboard |
|------|---------|-------------|-----------|
| SSL/TLS | Encryption mode | **Full (strict)** | [SSL overview](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/ssl-tls) |
| SSL/TLS | Always Use HTTPS | **On** | [Edge Certificates](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/ssl-tls/edge-certificates) |
| SSL/TLS | TLS 1.3 | **On** | Edge Certificates |
| SSL/TLS | Automatic HTTPS Rewrites | **On** | Edge Certificates |
| SSL/TLS | Minimum TLS version | **1.2** | Edge Certificates |
| DNS | `reportkit` CNAME → GitHub Pages | **DNS only** (grey cloud) | [DNS records](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/dns/records) |
| DNS | `reportkit-api` Worker hostname | **Proxied** (orange cloud) | Auto when Worker domain added |
| Security | Bot Fight Mode | **Off** for now | [Bots](https://dash.cloudflare.com/f049faaf2f67549f5c58837479596a4a/lorapok.tech/security/bots) — can break browser demo `fetch()` |
| Speed | Auto Minify / Brotli | Optional | Low impact — site bypasses CF (DNS only) |

**Not needed on Free for ReportKit:** ACM, Total TLS, Custom certificates, SSL for SaaS.

### 0.4 ReportKit DNS reference (current + target)

| Name | Type | Target | Proxy | Purpose |
|------|------|--------|-------|---------|
| `reportkit` | CNAME | `Maijied.github.io` | DNS only | Docs site (GitHub Pages) |
| `reportkit-api` | Worker custom domain | `reportkit-demo-api` | Proxied | Demo API (**use this**, not `api.reportkit`) |
| `api.reportkit` | — | **Remove** | — | Failed nested hostname |

Manual runbook: [SETUP-DNS.md](../SETUP-DNS.md) · Workspace plan: [PLAN.md](../../PLAN.md)

### 0.5 What stays in Reportkit-Core vs future hub

| Task | Where |
|------|-------|
| Worker code, D1 seed, site deploy | **Reportkit-Core** (CI) |
| Attach Worker custom domain, SSL cleanup | **Cloudflare dashboard** (now) or **Lorapok Domain Hub** (later) |
| Toggle zone features, DNS CRUD UI | **Lorapok Domain Hub** (future separate repo) |

---

## 1. Product vision

A **professional web control plane** where a signed-in operator can:

| Area | Automate from the UI |
|------|----------------------|
| **Domains** | Onboard zones to Cloudflare, show nameservers, poll until Active |
| **DNS** | Create/edit/delete records via templates (GitHub Pages, Worker, CNAME, A, MX, TXT) |
| **Cloudflare** | Read and (where safe) toggle zone features — SSL, cache, bots, rules |
| **Workers** | Attach/detach custom domains, list scripts, trigger deploy hooks |
| **GitHub** | Connect repos, set Pages custom domain, view Actions status, dispatch workflows |
| **Registrar** | Guided NS change at get.tech (copy NS, checklist — no registrar API v1) |
| **Health** | SSL probes, DNS checks, `/v1/health`, audit log |

**Auth:** Sign in with Google (allowlist). Optional v2: GitHub OAuth for repo operations.

**Planned URLs (on `lorapok.tech`):**

| Role | Hostname | Notes |
|------|----------|-------|
| UI | `control.lorapok.tech` | Static site (GitHub Pages or Cloudflare Pages) |
| API | `api-control.lorapok.tech` | Cloudflare Worker + D1 — **single-level** subdomain |

---

## 2. New repository — do not add to Reportkit-Core

### 2.1 Create the repo

```bash
# On GitHub: New repository → Lorapok-Domain-Hub (public or private)
git clone https://github.com/Maijied/Lorapok-Domain-Hub.git
cd Lorapok-Domain-Hub
```

### 2.2 Recommended monorepo layout

```text
Lorapok-Domain-Hub/
├── README.md
├── docs/
│   └── ARCHITECTURE.md
├── apps/
│   └── web/                    # Astro or Next.js — operator UI
│       ├── astro.config.mjs
│       ├── CNAME               # control.lorapok.tech
│       └── src/
├── services/
│   └── api/                    # Cloudflare Worker
│       ├── wrangler.toml
│       ├── schema/control.sql
│       └── src/
├── packages/
│   └── shared/                 # Types, validation (hostname rules, templates)
└── .github/workflows/
    ├── deploy-web.yml
    └── deploy-api.yml
```

### 2.3 Tech stack (professional defaults)

| Layer | Choice | Why |
|-------|--------|-----|
| UI | **Astro 5** + Bootstrap 5 or Tailwind | Fast static site, matches Lorapok sites |
| API | **Cloudflare Worker** + **D1** | Same edge as DNS; encrypted secrets |
| Auth | **Google OAuth 2.0** | Session via HttpOnly cookie from Worker |
| GitHub | **GitHub App** or OAuth + REST | Pages domain, Actions, workflow_dispatch |
| Cloudflare | **Account API token** (encrypted in D1) | Zones, DNS, SSL, Workers, settings |
| CI | GitHub Actions | Deploy web + Worker independently |

---

## 3. Full Cloudflare feature catalog

Use this table to build the **Features** tab in the UI. For each row: **status badge**, **deep link to dashboard**, and **automate** when marked.

Legend: **Auto** = v1 automation · **Read** = show status · **Link** = dashboard only · **Paid** = document, no automation on Free

### 3.1 Zone & DNS

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| Zone overview / Active status | Overview | ✓ poll | ✓ | `GET /zones/:id` |
| Add zone (full setup) | Domains → Add | ✓ | | `POST /zones` |
| DNS records (A, AAAA, CNAME, MX, TXT, SRV, NS, CAA) | DNS → Records | ✓ CRUD | ✓ | `/zones/:id/dns_records` |
| DNSSEC | DNS → Settings | | ✓ warn if on at registrar | `/zones/:id/dnssec` |
| CNAME flattening | DNS → Settings | | ✓ | Zone setting |
| Multi-signer DNSSEC | DNS → Settings | | Link | |
| DNS analytics | Analytics → DNS | | ✓ | Analytics API |
| Import / export DNS | DNS → Records | | Link | `GET/POST` export endpoints |

### 3.2 SSL/TLS

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| Encryption mode (Off/Flexible/Full/Strict) | SSL → Overview | warn | ✓ | `ssl` setting |
| Universal SSL cert | Edge Certificates | | ✓ Active/backup | Certificate list |
| Advanced / Worker certs | Edge Certificates | alert errors | ✓ | Certificate packs |
| Always Use HTTPS | Edge Certificates | v2 toggle | ✓ | Zone setting |
| TLS 1.3 | Edge Certificates | | ✓ | Zone setting |
| Automatic HTTPS Rewrites | Edge Certificates | | ✓ | Zone setting |
| Minimum TLS version | Edge Certificates | v2 | ✓ | Zone setting |
| HSTS | Edge Certificates | Link | | |
| Certificate Transparency Monitoring | Edge Certificates | v2 opt-in | | |
| Advanced Certificate Manager (ACM) | ACM | Paid | Link | Paid add-on |
| Total TLS | Edge Certificates | Paid | Link | Requires ACM |
| Custom certificates upload | Edge Certificates | Paid | Link | Business+ |
| SSL for SaaS | Account | Paid | Link | Enterprise |

### 3.3 Workers & Pages (account level)

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| Workers scripts list | Workers & Pages | ✓ link deploy | ✓ | Workers API |
| Worker custom domains | Worker → Domains | ✓ attach/detach | ✓ | Custom domains API |
| Worker routes (`host/*`) | Workers Routes | read | ✓ | `/zones/:id/workers/routes` |
| Cron triggers | Worker → Triggers | read | ✓ | Worker settings |
| Environment variables / secrets | Worker → Settings | Link | | Wrangler / dashboard |
| D1 databases | Storage → D1 | list | ✓ | D1 API |
| R2 buckets | Storage → R2 | list | Link | R2 API |
| KV namespaces | Storage → KV | list | Link | KV API |
| Queues | Storage → Queues | list | Link | Queues API |
| Pages projects | Workers & Pages | v2 | ✓ | Pages API |
| Pages custom domains | Pages → Custom domains | v2 GitHub overlap | ✓ | Pages API |

### 3.4 Security

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| Security overview / events | Security → Overview | | ✓ | Analytics |
| Security level | Security → Settings | v2 | ✓ | `security_level` |
| Challenge passage | Security → Settings | v2 | ✓ | Zone setting |
| Browser Integrity Check | Security → Settings | v2 | ✓ | Zone setting |
| Bot Fight Mode | Security → Bots | v2 toggle | ✓ | Bot management |
| Super Bot Fight Mode | Security → Bots | Paid | Link | |
| Block AI training bots | Overview / Bots | v2 | ✓ | Bots + robots.txt |
| WAF managed rules | Security → WAF | read | ✓ | Rulesets API |
| WAF custom rules | Security → WAF | v2 | Link | Paid limits |
| Rate limiting rules | Security → WAF | v2 | Link | |
| Page Shield (client-side) | Security → Page Shield | v2 | ✓ | |
| Precursor | Overview quick action | v2 | ✓ | Security settings |
| Cloudflare Access (Zero Trust) | Access | Link | | Separate product |
| Turnstile | Account | Link | | Widget keys |

### 3.5 Speed, caching & delivery

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| Speed overview | Speed → Overview | | Link | |
| Auto Minify (JS/CSS/HTML) | Speed → Optimization | v2 | ✓ | Zone settings |
| Brotli | Speed → Optimization | v2 | ✓ | Zone setting |
| Early Hints | Speed → Optimization | v2 | ✓ | Zone setting |
| Rocket Loader | Speed → Optimization | v2 | ✓ | Zone setting |
| Caching level | Caching → Configuration | v2 | ✓ | `cache_level` |
| Browser Cache TTL | Caching → Configuration | v2 | ✓ | Zone setting |
| Always Online | Caching → Configuration | v2 | ✓ | Zone setting |
| Development Mode (3h bypass) | Overview quick action | v2 toggle | ✓ | `development_mode` |
| Cache Rules | Caching → Cache Rules | v2 | Link | Rulesets |
| Tiered Cache | Caching → Tiered Cache | Paid | Link | |
| Argo Smart Routing | Traffic → Argo | Paid | Link | |
| Polish (image opt) | Speed | Paid | Link | |
| Mirage | Speed | Paid | Link | |

### 3.6 Rules & traffic

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| Redirect Rules | Rules → Redirect | v2 | Link | Rulesets |
| Rewrite Rules | Rules → Rewrite | v2 | Link | Rulesets |
| Configuration Rules | Rules → Configuration | v2 | Link | Rulesets |
| Transform Rules (headers/URL) | Rules → Transform | v2 | Link | |
| Page Rules (legacy, 3 on Free) | Rules → Page Rules | read | ✓ | Page Rules API |
| Origin Rules | Rules | v2 | Link | |
| Single Redirects | Rules | v2 | Link | |
| Error Pages (custom 5xx) | Error Pages | v2 | Link | |
| Waiting Room | Traffic | Paid | Link | |
| Load Balancing | Traffic | Paid | Link | |

### 3.7 Network

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| HTTP/2 | Network | | ✓ | Zone setting |
| HTTP/3 (QUIC) | Network | v2 | ✓ | Zone setting |
| 0-RTT | Network | v2 | ✓ | Zone setting |
| WebSockets | Network | | ✓ | Zone setting |
| gRPC | Network | v2 | ✓ | Zone setting |
| IPv6 compatibility | Network | | ✓ | Zone setting |
| IP Geolocation header | Network | v2 | ✓ | Zone setting |
| Maximum upload size | Network | v2 | ✓ | Zone setting |
| Pseudo IPv4 | Network | v2 | Link | |

### 3.8 Analytics & observability

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| Traffic analytics | Analytics → Traffic | embed summary | ✓ | GraphQL Analytics |
| Security events | Security → Events | | ✓ | |
| Worker logs / tail | Worker → Observability | Link | | Logpush paid |
| Health Checks | Traffic | Paid | Link | |
| Notifications (email/webhook) | Account → Notifications | v2 | Link | |
| AI Crawl Control | AI Crawl Control | v2 | ✓ | |
| Agent Readiness | Agent Readiness | Link | | |
| Investigate (account search) | Investigate | Link | | |

### 3.9 Email & Web3

| Feature | Dashboard | Auto | Read | API |
|---------|-----------|------|------|-----|
| Email Routing | Email → Routing | v2 wizard | ✓ | Email Routing API |
| Email Security (DMARC) | Email | v2 MX/TXT | ✓ | DNS + wizard |
| SPF / DKIM records | DNS | v2 | ✓ | DNS CRUD |
| Web3 / IPFS gateway | Web3 | Link | | |

### 3.10 Account & billing (read-only in UI)

| Feature | Dashboard | Auto | Read |
|---------|-----------|------|------|
| Free / Pro plan | Overview | | ✓ |
| Domain registration / transfer | Domain Registration | Link | ✓ |
| Billing & subscriptions | Account → Billing | Link | |
| API tokens | Profile → API Tokens | Link | |
| Audit log (Cloudflare) | Account Audit Log | Link | |

### 3.11 Automation priority matrix

| Priority | Automate in v1 | Read + dashboard link | Manual / Paid |
|----------|----------------|----------------------|---------------|
| **P0** | Zone onboard, DNS CRUD, Worker custom domains, SSL error alerts | Zone status | — |
| **P1** | GitHub Pages domain checklist, workflow_dispatch deploy | All SSL/TLS read | — |
| **P2** | Subdomain templates, health polling, audit log | Security, cache, bots read | — |
| **P3** | — | Analytics embed | ACM, Argo, Access, LB |
| **P4** | — | — | Registrar API (get.tech) |

---

## 4. GitHub integration catalog

Automate or surface these from the **GitHub** tab in the UI.

### 4.1 Repositories & Pages

| Feature | Automate v1 | API |
|---------|-------------|-----|
| List user/org repos | ✓ | `GET /user/repos` or App installation |
| Pages enabled check | ✓ | `GET /repos/{owner}/{repo}/pages` |
| Set Pages custom domain | v2 ✓ | `PUT /repos/{owner}/{repo}/pages` `{ "cname": "..." }` |
| Pages source (Actions branch) | read | `GET .../pages` → `build_type` |
| Pages HTTPS enforced | read | `https_enforced` |
| CNAME conflict detection | ✓ | Compare with Cloudflare DNS |

**Known constraint:** Only one repo can hold a given Pages custom domain (e.g. move `reportkit.lorapok.tech` from old repo to new).

### 4.2 GitHub Actions

| Feature | Automate v1 | API |
|---------|-------------|-----|
| List workflows | ✓ | `GET /repos/{owner}/{repo}/actions/workflows` |
| Recent run status | ✓ | `GET .../actions/runs` |
| Trigger workflow_dispatch | ✓ | `POST .../actions/workflows/{id}/dispatches` |
| View failed job logs link | ✓ | Deep link to run URL |

**Example dispatches for Lorapok stack:**

| Workflow | Repo | Input |
|----------|------|-------|
| Deploy site | Reportkit-Core | — |
| Deploy Worker | Reportkit-Core | — |
| Seed D1 | Reportkit-Core | `scale: research` |
| Deploy control hub | Lorapok-Domain-Hub | — |

### 4.3 Secrets & environments (read-only v1)

| Feature | v1 | Notes |
|---------|-----|-------|
| List secret names (not values) | read | `GET /repos/{owner}/{repo}/actions/secrets` |
| Check required secrets exist | ✓ | `CLOUDFLARE_API_TOKEN`, `REPORTKIT_LIVE`, … |
| Environment protection rules | Link | Dashboard |

### 4.4 GitHub OAuth / App setup (for v2)

**Option A — GitHub OAuth (simpler):** scope `repo`, `read:org`, `workflow` for workflow_dispatch.

**Option B — GitHub App (professional):** Installation per org, fine-grained permissions, webhook for push/deploy events.

Store `GITHUB_TOKEN` or App credentials encrypted in D1 (same as Cloudflare token).

---

## 5. Critical SSL & hostname rules

**Production lesson (lorapok.tech, 2026):** nested subdomains break on Cloudflare **Free** plan.

| Hostname | Universal SSL `*.zone` | Result |
|----------|--------------------------|--------|
| `reportkit.lorapok.tech` | ✓ | OK |
| `reportkit-api.lorapok.tech` | ✓ | OK for Worker |
| `api.reportkit.lorapok.tech` | ✗ (two labels under zone) | Advanced cert **Pending Validation (Error)** |

**Enforce in UI validator:**

```text
Allowed: {name}.lorapok.tech     (one label before zone)
Blocked: {a}.{b}.lorapok.tech  (requires ACM / paid)
```

**GitHub Pages:** CNAME targets `*.github.io` → Cloudflare proxy **DNS only** (grey cloud).

---

## 6. Architecture (standalone repo)

```text
┌──────────────────────────────────────────────────────────────┐
│  control.lorapok.tech  — apps/web (static)                  │
│  · Google Sign-In                                             │
│  · Domains · DNS · Cloudflare Features · GitHub · Audit       │
└────────────────────────────┬─────────────────────────────────┘
                             │ credentials: include (session cookie)
                             ▼
┌──────────────────────────────────────────────────────────────┐
│  api-control.lorapok.tech  — services/api (Worker)            │
│  · /auth/google*  · /v1/domains*  · /v1/github*  · /v1/cf/*   │
└──────────────┬─────────────────────────────┬─────────────────┘
               │                             │
               ▼                             ▼
        D1 lorapok_control              External APIs
        (users, tokens,                 · Cloudflare v4
         domains, audit)                · GitHub REST
                                        · DNS over HTTPS (health)
```

---

## 7. Sign in with Google

1. Google Cloud → project **Lorapok Domain Hub**.
2. OAuth client (Web):
   - Origins: `https://control.lorapok.tech`, `http://localhost:4321`
   - Redirect: `https://api-control.lorapok.tech/auth/google/callback`
3. Worker secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `ALLOWED_EMAILS`.
4. HttpOnly Secure SameSite=Lax session cookie; 7-day TTL.

---

## 8. API surface (Worker)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/auth/google` | Start OAuth |
| GET | `/auth/google/callback` | Finish OAuth |
| POST | `/auth/logout` | Clear session |
| GET | `/v1/me` | Current user |
| POST | `/v1/integrations/cloudflare` | Save encrypted CF token |
| POST | `/v1/integrations/github` | Save encrypted GitHub token (v2) |
| GET | `/v1/domains` | List zones |
| POST | `/v1/domains` | Onboard zone |
| GET | `/v1/domains/:id` | Zone + NS |
| GET | `/v1/domains/:id/features` | All Cloudflare features (§3) |
| GET | `/v1/domains/:id/dns` | DNS records |
| POST/PATCH/DELETE | `/v1/domains/:id/dns` | DNS CRUD |
| GET/POST/DELETE | `/v1/domains/:id/workers/domains` | Worker custom domains |
| GET | `/v1/domains/:id/status` | SSL + health aggregation |
| GET | `/v1/github/repos` | List repos |
| GET | `/v1/github/repos/:owner/:repo/pages` | Pages config |
| PUT | `/v1/github/repos/:owner/:repo/pages` | Set custom domain (v2) |
| GET | `/v1/github/repos/:owner/:repo/actions` | Workflow runs |
| POST | `/v1/github/repos/:owner/:repo/actions/dispatch` | Trigger workflow |
| GET | `/v1/audit` | Audit log |

---

## 9. UI — professional pages

Design: clean dashboard, Lorapok green accent (`#0b7a4b`), sidebar nav, status badges (green/yellow/red).

| Page | Content |
|------|---------|
| `/` | Product pitch + Sign in with Google |
| `/dashboard` | Connected integrations, domain cards, alerts |
| `/domains/new` | Add zone wizard + registrar NS checklist |
| `/domains/[zone]` | **Overview** · **DNS** · **Cloudflare** (§3 grid) · **GitHub** · **Workers** · **Audit** |
| `/domains/[zone]/dns/new` | Template wizard |
| `/settings` | Cloudflare token, GitHub connect, allowlist |

**Cloudflare tab:** Render §3 tables with live status + “Open in Cloudflare” links.

**GitHub tab:** Repo picker → Pages domain status → Actions last 5 runs → Deploy buttons.

---

## 10. Subdomain templates

| Template | Creates | Proxy |
|----------|---------|-------|
| `github_pages` | CNAME → `{user}.github.io` | DNS only |
| `worker_api` | Worker custom domain | Proxied |
| `cname` | CNAME → target | user choice |
| `a_record` | A → IPv4 | user choice |
| `mx` | MX + optional TXT (SPF) | DNS only |
| `txt` | TXT (verification, DKIM) | DNS only |

---

## 11. Build instructions — step by step

### Phase A — Repository bootstrap

1. Create **Lorapok-Domain-Hub** on GitHub.
2. Scaffold `apps/web` (Astro) and `services/api` (Worker + wrangler).
3. Add `packages/shared` for hostname validation + TypeScript types.
4. Configure ESLint, TypeScript, Prettier.
5. Add README with architecture diagram.

### Phase B — API foundation

1. Create D1 `lorapok_control`; apply schema (users, integrations, domains, subdomains, audit_log).
2. Implement Google OAuth + session middleware.
3. Implement encrypted credential storage (AES-GCM).
4. Implement Cloudflare client: verify token, list zones, get zone.

### Phase C — DNS & Workers

1. DNS list/create/update/delete.
2. Subdomain templates with hostname validator (§5).
3. Worker custom domain attach/detach.
4. Status endpoint: NS, SSL certs, HTTPS probe.

### Phase D — Cloudflare features dashboard

1. `GET /v1/domains/:id/features` — aggregate §3 read-only flags.
2. UI grid with badges + dashboard deep links.
3. Alert banner for Advanced cert **Pending Validation (Error)**.

### Phase E — GitHub integration

1. GitHub OAuth or PAT connect (encrypted).
2. List repos; show Pages config.
3. Show Actions runs; add workflow_dispatch for allowed workflows.
4. Checklist: “Set Pages custom domain” with one-click copy.

### Phase F — Web UI polish

1. Responsive layout, loading states, error toasts.
2. Audit log on every mutation.
3. Empty states and onboarding wizard.

### Phase G — Deploy

1. Worker → `api-control.lorapok.tech` (Cloudflare Domains).
2. Web → GitHub Pages `control.lorapok.tech` (CNAME, DNS only in Cloudflare).
3. GitHub Actions: `deploy-web.yml`, `deploy-api.yml`.
4. Secrets: see §12.

### Phase H — QA

Run verification script (§14) before calling v1 done.

---

## 12. Secrets & tokens

### GitHub repo secrets (Lorapok-Domain-Hub)

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Deploy Worker + optional bootstrap |
| `CLOUDFLARE_ACCOUNT_ID` | Account UUID |
| `LORAPOK_CONTROL_D1` | D1 database ID |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth |
| `SESSION_SECRET` | Cookie signing |
| `TOKEN_ENCRYPTION_KEY` | Encrypt tokens in D1 |
| `ALLOWED_EMAILS` | Login allowlist |

### Cloudflare API token permissions (minimum)

Account: Workers Scripts Edit, D1 Edit, Account Settings Read  
Zone: DNS Edit, Zone Read, SSL and Certificates Read, Zone Settings Read

### Wrangler secrets (production API)

```bash
cd services/api
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
npx wrangler secret put TOKEN_ENCRYPTION_KEY
npx wrangler secret put ALLOWED_EMAILS
```

---

## 13. DNS records to add (in Cloudflare, for the hub itself)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `control` | `{github-user}.github.io` | DNS only |
| Worker | `api-control` | `lorapok-control-api` | Proxied |

Add **after** Lorapok-Domain-Hub repo exists — not in Reportkit-Core.

---

## 14. Verification checklist

```bash
# UI
curl -sI https://control.lorapok.tech/

# API auth
curl -s https://api-control.lorapok.tech/v1/me   # 401 when logged out

# Zone (with token)
curl -s -H "Authorization: Bearer $CF_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones?name=lorapok.tech" | jq '.result[0].status'

# SSL (single-level Worker host)
curl -s https://reportkit-api.lorapok.tech/v1/health

# GitHub Pages
gh api repos/Maijied/Lorapok-Domain-Hub/pages --jq '{cname,https_enforced}'
```

---

## 15. Security checklist

- [ ] Google allowlist only — no public signup
- [ ] HttpOnly Secure cookies; no tokens in localStorage
- [ ] Cloudflare + GitHub tokens encrypted at rest
- [ ] CSRF on OAuth and forms
- [ ] Rate limits on auth and DNS mutations
- [ ] CORS restricted to `control.lorapok.tech`
- [ ] Audit log for all writes
- [ ] Hostname depth validator (§5)
- [ ] Separate repo — no Reportkit-Core coupling in runtime

---

## 16. Relationship to Reportkit-Core

| Item | Location |
|------|----------|
| ReportKit site + demo Worker | **Reportkit-Core** monorepo (this repo) |
| Domain Hub control plane | **New repo** — build later using this doc |
| Manual DNS runbook | [SETUP-DNS.md](../SETUP-DNS.md) |
| Example zone / account IDs | Reference only in this doc |

**Do not** add `control-panel/` or `worker-control/` folders to Reportkit-Core.

---

## 17. Related links

- [SETUP-DNS.md](../SETUP-DNS.md) — current manual DNS for ReportKit
- [Cloudflare API](https://developers.cloudflare.com/api/)
- [GitHub REST — Pages](https://docs.github.com/en/rest/pages/pages)
- [GitHub REST — Actions](https://docs.github.com/en/rest/actions)
- [Workers custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Universal SSL coverage](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)
- [Google OAuth web server flow](https://developers.google.com/identity/protocols/oauth2/web-server)

---

## 18. Suggested repo name & first commit

```bash
# When ready — separate session, separate repo
gh repo create Maijied/Lorapok-Domain-Hub --public --description \
  "Lorapok Domain Hub — Cloudflare + GitHub control plane (Google Sign-In)"
```

Copy this file into `Lorapok-Domain-Hub/docs/INSTRUCTIONS.md` when the repo is created.
