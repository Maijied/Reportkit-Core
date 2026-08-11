# Phase A — Config & settings architecture

**Doc:** [plan index](../README.md)

---

**Outcome:** One settings surface; no magic numbers in Blade/JS.

## A1. Expand `config/reportkit.php`

```php
return [
    'brand' => [
        'name' => 'ReportKit',
        'accent' => '#0b7a4b',
        'mascot_enabled' => true,
        'mascot_name' => 'Kit-Larva',
        'logo_path' => null,
        'loader_animation' => 'kit-larva-prepare.gif',
        'pdf_disclaimer' => '…',
    ],
    'date' => [
        'max_months' => 6,
        'ledger_max_days' => 31,
        'block_future_dates' => false,
        'auto_open_end_date' => false,
    ],
    'prepare' => [
        'concurrency' => 3,
        'day_label_under_days' => 7,
    ],
    'store' => [
        'session_persist_max_bytes' => 1500000,
        'storage_key_prefix' => 'reportkit_',
    ],
    'export' => [
        'excel_soft_max_rows' => 25000,
        'pdf_single_pass_max_rows' => 105303,
        'pdf_proven_single_max_rows' => 105303,
        'pdf_single_file_max_rows' => 40000,
        'pdf_rows_per_volume' => 25000,
        'pdf_chunk_rows' => 80,
        'csv_chunk_rows' => 400,
        'excel_chunk_rows' => 400,
        'memory_limit' => '2048M',
    ],
    'mail' => [
        'enabled' => true,
        'hard_attach_max_bytes' => 26214400,
        'email_max_length' => 254,
        'view' => 'reportkit::emails.send',
    ],
    'notifications' => [
        'ping_enabled' => true,
        'sound_muted_key' => 'reportkit_sound_muted',
    ],
    'logging' => [
        'enabled' => false,
        'panel' => 'local',
        'level' => 'info',
        'buffer_max' => 200,
        'sample_rate' => 1.0,
        'include_in_ajax' => false,
        'redact' => ['password', 'token', '_token'],
    ],
    'design' => [
        'theme' => 'cas',
        'dual_class_compat' => true,
        'ledger_enhanced' => false,
    ],
    'table' => [
        'page_limit_max' => 10000,
        'default_page_length' => 25,
        'length_menu' => [10, 25, 50, 100],
        'txn_type_classes' => [
            'recharge' => 'rk-txn-pill--recharge',
            'ticket_sell' => 'rk-txn-pill--sell',
            'ticket_cancel' => 'rk-txn-pill--cancel',
            'admin_debit' => 'rk-txn-pill--debit',
            'balance_reset' => 'rk-txn-pill--reset',
        ],
    ],
    'features' => [ /* reportkit:make preset defaults */ ],
];
```

## A2. Wire `SettingsStore` + browser bootstrap

- [x] Map config → `ArraySettingsStore` at boot
- [x] Publish `GET /reportkit/settings.json` (ceilings + brand + logging flags only)
- [x] Inline `window.__REPORTKIT_SETTINGS__` in layout (no extra round-trip)
- [x] Document every key in `reportkit-core/docs/CONFIGURATION.md`

## A3. Definition-level overrides

- [x] `Report::define(...)->settings([...])` merges per-report ceilings
- [x] Feature flags exposed on browser payload as `report.flags`
- [ ] Feature flags control partials, routes, and JS bundle splits (partial — flags in payload; Blade gates pending)

---
