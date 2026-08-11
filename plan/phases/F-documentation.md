# Phase F — Documentation

**Doc:** [plan index](../README.md)

---

| Doc | Content |
|-----|---------|
| F1 `BIG-DATABASE.md` | 4-phase process + ceilings |
| F2 `CONFIGURATION.md` | every config key |
| F3 `BLADE-COMPONENTS.md` | partial catalog + section API |
| F4 `HOST-INTEGRATION.md` | service/repository/controller pattern |
| F5 `SEND-REPORT.md` | Phase 4 validation table |
| F6 `ACTIVITY-LOG.md` | categories, performance rules, panel usage |
| F7 Site docs sync | `/docs/0.1/…` |
| F8 Bus `MIGRATION.md` | PR #16886 step map |
| F9 `UPGRADE.md` | per-package upgrade guides (Phase O) |
| F10 `DEPRECATIONS.md` | API sunset timeline |
| F11 `SEO.md` | sitemap, meta, JSON-LD runbook (Phase N) |
| F12 `BRAND.md` | Kit-Larva usage + asset paths (Phase M) |
| F13 `/docs/0.1/maintenance/*` | upgrade-overview, config-migrations |

---

## Sync pipeline

```bash
cd reportkit-website && npm run sync:docs && npm run build
```

Sources: `reportkit-core/docs/`, `reportkit-ui/docs/`, `plan/docs/` (maintainer-only on GitHub).

---

## Exit criteria

- [ ] Host dev completes integration from docs alone
- [ ] Upgrade 0.1 → 0.2 documented end-to-end
- [ ] Brand + SEO runbooks published
