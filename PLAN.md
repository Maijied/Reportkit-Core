# ReportKit local workspace plan



## Status (2026-08-10)



| Phase | Status |

|-------|--------|

| Monorepo consolidation | **Done locally** — single repo `Maijied/Reportkit-Core` |

| Website + Worker + D1 | Workflows at repo root; secrets on **Reportkit-Core** |

| Packagist / npm | Update package URLs to monorepo on Packagist |



## Monorepo



Everything lives in **[Maijied/Reportkit-Core](https://github.com/Maijied/Reportkit-Core)**. See [MONOREPO.md](./MONOREPO.md).



| Directory | Package |

|-----------|---------|

| `reportkit-core/` | `reportkit/core` |

| `reportkit-laravel/` | `reportkit/laravel` |

| `reportkit-laravel-legacy/` | `reportkit/laravel-legacy` |

| `reportkit-ui/` | `@lorapok-labs/reportkit-ui` |

| `reportkit-website/` | Site + Worker |



Release tags: `core/v*`, `laravel/v*`, `laravel-legacy/v*`, `ui/v*`.



## Manual follow-ups



1. Push monorepo to `Maijied/Reportkit-Core` (replaces old site-only layout)

2. Archive split repos on GitHub

3. Update Packagist package source URLs to the monorepo

4. Ensure all secrets are on **Reportkit-Core**

5. Run **Seed D1** → **Deploy Worker** → verify demo API



## Do not



- Push package source to Shohoz Azure remotes

