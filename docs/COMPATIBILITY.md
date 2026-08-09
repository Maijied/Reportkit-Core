# Compatibility

ReportKit aims to cover **legacy hosts through currently supported PHP and Laravel**.

Laravel no longer ships separate “LTS” labels for every major; “current” means the majors still receiving security fixes from laravel.com (today: **12.x** and **13.x**). Historical LTS lines (**5.5**, **6**) remain in scope via adapters where noted.

## Package matrix

| Package | Role | PHP | Laravel |
|---------|------|-----|---------|
| `reportkit/core` | Framework-agnostic engine | **5.6 → current** (8.3–8.5+) | — |
| `reportkit/laravel-legacy` | Classic Illuminate adapter | 5.6 – 7.4 | **4.1 – 5.4** |
| `reportkit/laravel` | Modern Illuminate adapter | 7.0 – **current** | **5.5 → current** (incl. 5.5/6 LTS era through **12 / 13**) |
| `@reportkit/ui` | CSS / JS (CAS tokens, sync loader, table helpers) | — (browser) | Any host that serves static assets |

## Support policy

1. **`reportkit/core`** stays on PHP **≥ 5.6** language features so one engine serves every adapter. No Laravel types in Core.
2. **`laravel-legacy`** preserves Laravel **4.1–4.2** (and early 5.x without package auto-discovery) APIs: `Input::`, facades, `artisan` command style of that era.
3. **`reportkit/laravel`** tracks **5.5 → currently supported Laravel**, bumping CI as new majors enter security support and dropping majors only after Laravel’s own security EOL — unless a consumer still needs a maintained backport branch.
4. Host apps keep **domain SQL**; adapters only wire providers, routes, Blade/views, and artisan scaffolds.
5. UI package is framework-neutral; peer jQuery/DataTables as documented per release.

## Version pairing (typical)

| Host stack | Use |
|------------|-----|
| PHP 5.6–7.x + Laravel 4.1 / 4.2 | `core` + `laravel-legacy` + `@reportkit/ui` |
| PHP 7.0–7.4 + Laravel 5.5 – 8 | `core` + `laravel` + `@reportkit/ui` |
| PHP 8.0–8.5 + Laravel 9 – 13 | `core` + `laravel` + `@reportkit/ui` |

## Out of scope (Core)

- Framework facades, Eloquent, Blade, Artisan
- Domain queries / report business SQL
- Guaranteeing every EOL Laravel patch forever after Laravel security EOL (best-effort branches may exist)

## Author

Mohammad Maizied Hasan Majumder \<mdshuvo40@gmail.com\>  
Founder & Principal Engineer, Lorapok Labs · Senior Software Engineer, Shohoz Ltd
