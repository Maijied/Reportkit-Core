# ReportKit — Execution plan index

**Status:** active (2026-08-10)  
**Owner:** Mohammad Maizied Hasan Majumder · Lorapok Labs

Central architecture and rollout docs for the ReportKit monorepo. Replaces the monolithic root [`PLAN.md`](../PLAN.md) body.

---

## Quick start

| Doc | Read when |
|-----|-----------|
| [OVERVIEW.md](./OVERVIEW.md) | You need the full process map and success criteria |
| [PARITY-CHECKLIST.md](./PARITY-CHECKLIST.md) | You are porting bus PRs #16886 or #16817 |
| [IMPLEMENTATION-ORDER.md](./IMPLEMENTATION-ORDER.md) | You need sprint order and dependencies |
| [simulation/ANIMATED-FLOW.md](./simulation/ANIMATED-FLOW.md) | You are building the public demo simulator |
| [brand/CYBER-LARVA-MASCOT.md](./brand/CYBER-LARVA-MASCOT.md) | Kit-Larva mascot & logo redesign |
| [docs/UPGRADE-PROCESS.md](./docs/UPGRADE-PROCESS.md) | Release & host upgrade runbook |

---

## Phase status

| Phase | Title | Status |
|-------|-------|--------|
| [A](./phases/A-config-settings.md) | Config & settings | mostly done |
| [B](./phases/B-core-php.md) | Core PHP parity | partial |
| [C](./phases/C-browser-kit.md) | Browser kit (`reportkit-ui`) | mostly done |
| [D](./phases/D-laravel-scaffolds.md) | Laravel scaffolds | partial |
| [E](./phases/E-blade-design-system.md) | Blade CAS design system | mostly done |
| [F](./phases/F-documentation.md) | Documentation | mostly done |
| [G](./phases/G-bus-integration.md) | Bus integration (PR #16886) | partial |
| [H](./phases/H-tests-provenance.md) | Tests & provenance | mostly done |
| [I](./phases/I-monorepo-infra.md) | Monorepo infra | mostly done |
| [J](./phases/J-activity-log.md) | Activity log (fast) | mostly done |
| [K](./phases/K-ledger-table-json-browse.md) | Ledger table + JSON browse | mostly done |
| [L](./phases/L-mock-simulation.md) | Mock DB + animated flow | partial |
| [M](./phases/M-brand-mascot.md) | Kit-Larva logo & brand rollout | done |
| [N](./phases/N-seo-marketing.md) | SEO, sitemap, marketing pages | mostly done |
| [O](./phases/O-developer-upgrades.md) | Developer upgrade documentation | done |

---

## References

| Doc | Source |
|-----|--------|
| [bus-pr-16886.md](./references/bus-pr-16886.md) | Export Report · prepare-once workflow |
| [bus-pr-16817.md](./references/bus-pr-16817.md) | Billing ledger table UX (prepaid branch) |
| [external-sources.md](./references/external-sources.md) | Process spec, ceilings, file paths |
| [phase6-research-demo.md](./references/phase6-research-demo.md) | D1 demo / 50M synthetic rollout |

---

## Critical paths

| Doc | Topic |
|-----|-------|
| [config-to-browser.md](./critical-paths/config-to-browser.md) | Settings bootstrap |
| [prepare-export-flow.md](./critical-paths/prepare-export-flow.md) | Filter → compose pipeline |
| [query-optimization.md](./critical-paths/query-optimization.md) | SQL vs PseudoPaginator decision tree |
| [file-touch-index.md](./critical-paths/file-touch-index.md) | Implementation file list |

---

## Simulation & demo

| Doc | Topic |
|-----|-------|
| [MOCK-DATABASE.md](./simulation/MOCK-DATABASE.md) | Fictional multi-million schema |
| [CORNER-CASES.md](./simulation/CORNER-CASES.md) | All edge cases for mock runs |
| [ANIMATED-FLOW.md](./simulation/ANIMATED-FLOW.md) | Public animated showcase spec |

---

## Brand & growth

| Doc | Topic |
|-----|-------|
| [CYBER-LARVA-MASCOT.md](./brand/CYBER-LARVA-MASCOT.md) | Mascot design spec (Kit-Larva) |
| [phases/M-brand-mascot.md](./phases/M-brand-mascot.md) | Logo rollout + animated GIFs |
| [phases/N-seo-marketing.md](./phases/N-seo-marketing.md) | Sitemap, JSON-LD, OG, marketing pages |
| [../reportkit-website/docs/SEO.md](../reportkit-website/docs/SEO.md) | SEO deploy runbook |

---

## Maintainer docs

| Doc | Topic |
|-----|-------|
| [UPGRADE-PROCESS.md](./docs/UPGRADE-PROCESS.md) | Release train + host upgrade |
| [phases/O-developer-upgrades.md](./phases/O-developer-upgrades.md) | UPGRADE.md tree + semver |
| [../UPGRADE.md](../UPGRADE.md) | Root upgrade index |

---

## Policies (do not)

- Push package source to Shohoz Azure remotes
- Put domain SQL inside ReportKit packages
- Re-query RDS after prepare succeeds (browse from JSON)
- Use real customer/operator data in demos or seeds
- Log row payloads in Activity Log
- Ship 4,000-line consumer blades — use partials

---

## External links

- [Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core)
- [reportkit.lorapok.tech](https://reportkit.lorapok.tech)
- [bus PR #16886](https://dev.azure.com/Shohoz/ticket/_git/bus/pullrequest/16886)
- [bus PR #16817](https://dev.azure.com/Shohoz/ticket/_git/bus/pullrequest/16817)
