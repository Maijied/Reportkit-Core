# @lorapok-labs/reportkit-ui — upgrade guide

**Package:** `@lorapok-labs/reportkit-ui` (npm) · mirrored in monorepo `reportkit-ui/`

---

## 0.1.x → 0.2.x (beta)

### npm

```bash
npm update @lorapok-labs/reportkit-ui
# or
npm install @lorapok-labs/reportkit-ui@0.2.0-beta.1
```

### Composer / Artisan hosts

Prefer `php artisan reportkit:install --publish-assets` so CSS/JS/GIF paths match the adapter docs.

Manual copy from monorepo:

```
reportkit-ui/css/reportkit.css      → public/css/reportkit/
reportkit-ui/css/reportkit-compat.css
reportkit-ui/js/reportkit.js        → public/js/reportkit/
```

### CSS

- `.rk-async-mascot` styles added for Kit-Larva loader; hidden under `prefers-reduced-motion: reduce`.
- No breaking token renames in 0.2.0-beta.1.

### JS

Public surface unchanged for 0.2.0-beta.1. Future breaking changes will be listed here with migration snippets.

### Cache bust

After upgrading, hard-refresh admin pages or bump your asset query string — browsers cache `reportkit.css` aggressively.

---

## Links

- [CSS reference](./CSS.md)
- [JS reference](./JS.md)
- [Website UI docs](https://reportkit.lorapok.tech/docs/0.1/ui/overview)
