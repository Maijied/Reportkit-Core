# Implementation order

**Depends on:** [OVERVIEW.md](./OVERVIEW.md)  
**Last updated:** 2026-08-10

---

## Gantt

```mermaid
gantt
  title ReportKit rollout
  dateFormat YYYY-MM-DD
  section Foundation
  Phase A Config           :a1, 2026-08-11, 5d
  Phase B Core PHP         :a2, after a1, 7d
  section Kit
  Phase C Browser JS       :b1, after a2, 12d
  Phase D Laravel scaffolds :b2, after b1, 7d
  section Design
  Phase E Blade CAS        :c1, after b2, 10d
  Phase K Ledger table     :c2, after b1, 8d
  Phase J Activity Log     :c3, after b1, 6d
  section Brand
  Phase M Kit-Larva brand   :m1, after c1, 8d
  Phase N SEO marketing     :m2, after m1, 5d
  section Maintain
  Phase O Upgrade docs      :o1, after a1, 5d
  section Demo
  Phase L Mock simulation  :e1, after c2, 10d
  section Ship
  Phase F Docs             :d1, after c1, 7d
  Phase G Bus PR 16886     :d2, after c1, 10d
  Phase H Tests            :d3, after d2, 5d
```

---

## Dependency graph

```mermaid
flowchart LR
  A[Phase A Config] --> B[Phase B Core]
  B --> C[Phase C UI JS]
  B --> J[Phase J Log]
  C --> D[Phase D Scaffolds]
  C --> K[Phase K Ledger]
  D --> E[Phase E Blade]
  K --> L[Phase L Simulation]
  E --> G[Phase G Bus]
  K --> G
  G --> H[Phase H Tests]
  L --> F[Phase F Docs]
```

---

## Sprint 1 (this week)

| Task | Phase | Deliverable |
|------|-------|-------------|
| Expand `config/reportkit.php` | A1 | All keys including `table.*`, `logging.*` |
| `prepare-loader` + `action-bar` partials | E2 | CAS loader + action bar |
| `ledger-panel` partial stub | K2 | Table shell + KPI row |
| ActivityLog ring buffer | J2 | PHP + JS stub |
| `BLADE-COMPONENTS.md` outline | F3 | Partial catalog |
| Animated flow spec | L1 | `simulation/ANIMATED-FLOW.md` ✓ |

---

## Sprint 2

| Task | Phase |
|------|-------|
| Port `createPrepareRunner` | C1 |
| `ReportKit.table.fromPreparedStore` | K4 |
| Mock ledger generator | L2 |
| `HandlesReportWeeks` trait | B5 |

---

## Sprint 3

| Task | Phase |
|------|-------|
| Full Blade partial library | E2 |
| `/showcase` animated demo page | L3 |
| Bus config extraction | G4 |
| Capacity test port patterns | H4 |

---

## First integration milestone

**Target:** `reportkit:make Ledger --preset=hybrid-browse` renders:

1. Filter panel → prepare loader → secure store commit
2. KPI row updated from JSON aggregates
3. Ledger DataTable pages prepared rows (PseudoPaginator)
4. Excel/CSV export from same JSON (no SQL)
5. Activity log panel shows categorized timeline

**Exit:** Demo at `/demo?mode=hybrid-browse` with synthetic 50M virtual backing.
