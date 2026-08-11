# Critical path — config to browser

```mermaid
flowchart LR
  PHP[config/reportkit.php]
  SP[ReportKitServiceProvider]
  SS[ArraySettingsStore]
  RT[GET /reportkit/settings.json]
  BL[Blade layout inline script]
  JS[ReportKit JS modules]

  PHP --> SP --> SS
  SS --> RT
  SS --> BL
  BL --> JS
  RT --> JS
```

---

## Steps

1. **Host publishes** `config/reportkit.php` (ceilings, brand, logging, table, design)
2. **ServiceProvider** maps keys → `ArraySettingsStore` at boot
3. **Optional route** exposes public-safe subset as JSON (no secrets)
4. **Layout** inlines `window.__REPORTKIT_SETTINGS__` to avoid extra round-trip
5. **JS modules** read settings once at init — prepare, store, export, table, log

---

## Public-safe JSON keys

`brand`, `date`, `prepare`, `store`, `export`, `mail`, `notifications`, `logging.enabled`, `logging.panel`, `table`, `design`

**Never expose:** DB credentials, API keys, internal routes.

---

## Per-report overrides

`Report::define('ledger')->settings(['date' => ['ledger_max_days' => 14]])` merges at runtime into store snapshot for that report only.
