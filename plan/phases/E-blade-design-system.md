# Phase E — Blade design system

**Doc:** [plan index](../README.md)

---

**Outcome:** Host apps never copy Export Report CSS/HTML again. All visual blocks are package partials driven by config + flags.

## E1. Token layer (`reportkit-ui/css/`)

| Token | Default | Legacy alias |
|-------|---------|--------------|
| `--rk-accent` | `#0b7a4b` | Shohoz `#16784f` via compat sheet |
| `--rk-accent-light` | `#22a06b` | |
| `--rk-fetch` | `#2f6fae` | Fetch button |
| `--rk-csv` | `#1f8a5a` | |
| `--rk-pdf` | `#c0392b` | |
| `--rk-send` | `#6c5ce7` | |
| `--rk-cancel` | `#d9822b` | |
| `--rk-text`, `--rk-muted`, `--rk-border` | CAS scale | |

Ship **`reportkit.css`** (CAS) + **`reportkit-compat.css`** (dual `.shohoz-*` / `.report-*` classes).

## E2. Blade partial library (complete)

```
reportkit::layouts.report          ← shell + yields
reportkit::ui.page-head            ← kicker, title, subtitle, breadcrumb
reportkit::ui.filter-panel         ← dynamic fields + date-range hook
reportkit::ui.filter-summary       ← active filter chips
reportkit::ui.prepare-loader       ← overlay, progress, cancel
reportkit::ui.action-bar           ← fetch / excel / csv / pdf / send
reportkit::ui.kpi-row              ← N metric cards via $metrics[]
reportkit::ui.download-status      ← ETA bar, ping, mute, cancel
reportkit::ui.send-panel           ← 4-step stepper + email gate
reportkit::ui.alert                ← error / success toast region
reportkit::ui.howto-panel          ← collapsible instructions
reportkit::ui.activity-log         ← categorized log panel (Phase J)
reportkit::ui.sync-loader          ← classic form submit
reportkit::ui.async-loader         ← DataTables prepare overlay
reportkit::emails.send             ← branded mail layout
```

Each partial accepts **IDs/class overrides** for multi-report pages on one admin site.

## E3. Layout sections (host fills content only)

```blade
@extends('reportkit::layouts.report')

@section('reportkit.filters') … @endsection
@section('reportkit.results') … @endsection
@section('reportkit.send') … @endsection   {{-- if flags.email --}}
@section('reportkit.howto') … @endsection  {{-- if flags.howto --}}
```

## E4. Design QA

- [ ] Pixel-parity checklist vs Export Report (loader, KPI, send stepper, PDF header)
- [ ] Responsive admin panel (Bootstrap 3 grid)
- [ ] Select2 / overflow-safe filter dropdowns
- [ ] Website `/showcase` live gallery of every partial
- [x] Landing hero — animated prepare sequence (Figure B) with fictional data
- Docs: `reportkit-ui/docs/BLADE-COMPONENTS.md` + update `CSS.md`

**Exit:** `reportkit:make Export --preset=hybrid-export` renders indistinguishable UX from PR page using package partials only.

---
