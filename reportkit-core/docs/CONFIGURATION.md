# ReportKit configuration reference

**File:** `config/reportkit.php` (published via `php artisan reportkit:install --with-config`)

Runtime keys are flattened into `SettingsStore` (`brand.name`, `export.excel_soft_max_rows`, …).  
Browser-safe subset is exposed as `window.__REPORTKIT_SETTINGS__` and `GET /reportkit/settings.json`.

---

## Browser exposure

| Surface | Path |
|---------|------|
| Inline bootstrap | `@include('reportkit::ui.settings-bootstrap')` in layout |
| JSON endpoint | `GET /{prefix}/settings.json` (default `/reportkit/settings.json`) |

**Public sections:** `brand`, `date`, `prepare`, `store`, `export`, `mail`, `notifications`, `logging.enabled`, `logging.panel`, `table`, `design`, `features`

**Never exposed:** `routes`, `definitions_path`, `dedupe`, `logging.redact`, credentials.

JS: `ReportKit.applySettings(window.__REPORTKIT_SETTINGS__)` runs automatically when `reportkit.js` loads after the bootstrap script.

---

## Keys

### `brand`

| Key | Default | Notes |
|-----|---------|-------|
| `name` | `ReportKit` | UI product label |
| `accent` | `#0b7a4b` | CAS accent |
| `mascot_enabled` | `true` | Kit-Larva async loader |
| `mascot_name` | `Kit-Larva` | Display name |
| `logo_path` | `null` | Override logo URL/path |
| `loader_animation` | `kit-larva-prepare.gif` | GIF filename |
| `loader_path` | `img/reportkit` / `vendor/reportkit/img` | Public asset dir (adapter-specific) |
| `loader_url` | `null` | CDN override |
| `pdf_disclaimer` | *(see config)* | PDF footer text |

### `routes`

| Key | Default | Notes |
|-----|---------|-------|
| `enabled` | `false` | Opt-in package routes |
| `prefix` | `reportkit` | URL prefix |
| `middleware` | `[]` | Route middleware |
| `trace` | `false` | `/trace` debug endpoint |

### `definitions_path`

Default `app/Reports` — where `Report::define` files live.

### `date`

| Key | Default | Notes |
|-----|---------|-------|
| `max_months` | `6` | Filter gate max range |
| `ledger_max_days` | `31` | Ledger table mode |
| `block_future_dates` | `false` | Disallow future end dates |
| `auto_open_end_date` | `false` | UX toggle |

### `prepare`

| Key | Default | Notes |
|-----|---------|-------|
| `concurrency` | `3` | Parallel week fetches |
| `day_label_under_days` | `7` | Short-range label threshold |

### `store`

| Key | Default | Notes |
|-----|---------|-------|
| `session_persist_max_bytes` | `1500000` | Encrypted session persist cap |
| `storage_key_prefix` | `reportkit_` | Browser storage prefix |

### `export`

| Key | Default | Notes |
|-----|---------|-------|
| `excel_soft_max_rows` | `25000` | Soft Excel ceiling |
| `pdf_single_pass_max_rows` | `105303` | Single-pass PDF attempt |
| `pdf_proven_single_max_rows` | `105303` | Proven single-file max |
| `pdf_single_file_max_rows` | `40000` | Hard single-file cap |
| `pdf_rows_per_volume` | `25000` | Multi-volume split |
| `pdf_chunk_rows` | `80` | PDF row chunk size |
| `csv_chunk_rows` | `400` | CSV chunk size |
| `excel_chunk_rows` | `400` | Excel chunk size |
| `memory_limit` | `2048M` | Compose memory ini hint |

### `mail`

| Key | Default | Notes |
|-----|---------|-------|
| `enabled` | `true` | Send-via-email feature |
| `hard_attach_max_bytes` | `26214400` | Attachment size cap |
| `email_max_length` | `254` | Validation |
| `view` | `reportkit::emails.send` | Blade email template |

### `notifications`

| Key | Default | Notes |
|-----|---------|-------|
| `ping_enabled` | `true` | UI ping sound |
| `sound_muted_key` | `reportkit_sound_muted` | localStorage key |

### `logging`

| Key | Default | Browser |
|-----|---------|---------|
| `enabled` | `false` | `logging.enabled` only |
| `panel` | `local` | `logging.panel` only |
| `level` | `info` | server only |
| `buffer_max` | `200` | server only |
| `sample_rate` | `1.0` | server only |
| `include_in_ajax` | `false` | server only |
| `redact` | `[password, token, _token]` | server only |

### `design`

| Key | Default | Notes |
|-----|---------|-------|
| `theme` | `cas` | Design system id |
| `dual_class_compat` | `true` | Legacy class aliases |
| `ledger_enhanced` | `false` | Ledger table UX (Phase K) |

### `table`

| Key | Default | Notes |
|-----|---------|-------|
| `page_limit_max` | `10000` | PseudoPaginator ceiling |
| `default_page_length` | `25` | DataTables default |
| `length_menu` | `[10,25,50,100]` | Page size options |
| `txn_type_classes` | *(map)* | Ledger pill CSS classes |

### `dedupe`

| Key | Default | Notes |
|-----|---------|-------|
| `key` | `null` | Default dedupe field |

### `features`

| Key | Default | Notes |
|-----|---------|-------|
| `async_prepare` | `true` | Week-chunk prepare flow |
| `ledger_browse` | `false` | Post-prepare JSON browse |
| `activity_log_panel` | `false` | Activity log UI (Phase J) |

---

## Per-report overrides

```php
Report::define('ledger', function (ReportBuilder $r) {
    $r->settings([
        'date' => ['ledger_max_days' => 14],
        'export' => ['excel_soft_max_rows' => 50000],
    ])->flags(['async_prepare' => true]);
});
```

Overrides merge over host `config/reportkit.php` via `array_replace_recursive`.

| Surface | Behaviour |
|---------|-----------|
| Blade bootstrap | Pass `$reportkitReportId = 'ledger'` before `@include('reportkit::layouts.report')` |
| JSON | `GET /reportkit/{slug}/settings.json` |
| Server validators | `ReportSettingsResolver::get($slug, $config, 'date.max_months', 6)` |
| Browser payload | Includes `report.id` and `report.flags` when scoped to a definition |

Phase A3 complete. Definition flags are exposed to JS under `settings.report.flags`.

---

## See also

- [Upgrade / config migrations](https://reportkit.lorapok.tech/docs/0.1/maintenance/config-migrations)
- [Config → browser critical path](../../plan/critical-paths/config-to-browser.md)
