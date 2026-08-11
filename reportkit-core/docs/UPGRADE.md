# ReportKit Core — upgrade guide

**Package:** `reportkit/core`  
**Changelog:** [CHANGELOG.md](../CHANGELOG.md)  
**Deprecations:** [DEPRECATIONS.md](./DEPRECATIONS.md)

---

## Before you upgrade

1. Pin your current version in `composer.json` until you have read the notes below.
2. Upgrade **core and your Laravel adapter together** — mismatched versions are unsupported.
3. Keep domain SQL in the host app; core API changes should not require SQL rewrites unless noted.

---

## 0.1.x → 0.2.x (beta)

**Status:** in progress — see [config migrations](https://reportkit.lorapok.tech/docs/0.1/maintenance/config-migrations).

### Composer

```bash
composer require reportkit/core:0.2.*@beta
```

### Config

New keys ship with safe defaults. Merge into `config/reportkit.php` rather than replacing the file:

| New key | Default | Notes |
|---------|---------|-------|
| `brand.mascot_enabled` | `true` | Kit-Larva async loader (adapter views) |
| `brand.loader_animation` | `kit-larva-prepare.gif` | Published with `--publish-assets` |
| `logging.enabled` | `false` | Activity log (Phase J) |
| `table.page_limit_max` | `10000` | PseudoPaginator ceiling |

Renamed keys (if you used early alphas):

| Old | New |
|-----|-----|
| `date.max_range_months` | `date.max_months` |

### Breaking changes

None planned for 0.2.0-beta.1. Major bumps will be listed here with before/after PHP examples.

### Verify

```bash
composer test   # in reportkit-core/
```

Host apps: run export/report integration tests after upgrading.

---

## Patch releases (0.1.x)

Apply with `composer update reportkit/core`. Read [CHANGELOG.md](../CHANGELOG.md) for bug fixes. Patch releases do not remove public API.

---

## Getting help

- [Discussions — Q&A](https://github.com/Maijied/Reportkit-Core/discussions/categories/q-a)
- [Maintenance docs](https://reportkit.lorapok.tech/docs/0.1/maintenance/upgrade-overview)
