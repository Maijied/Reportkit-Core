# Phase N — SEO, sitemap & product marketing

**Depends on:** Phase M (OG images, mascot assets)  
**Blocks:** Public launch polish, Packagist discovery

---

## Outcome

ReportKit site is **fully discoverable**: correct sitemaps, structured data, social previews, performance SEO, and marketing pages wired to Kit-Larva assets.

---

## Current baseline

| Item | Status |
|------|--------|
| `@astrojs/sitemap` | ✅ priorities + changefreq in `astro.config.mjs` |
| `robots.txt` | ✅ sitemap + llms.txt comment |
| Per-page `title` + `description` | ✅ via `SeoHead.astro` |
| Open Graph | ✅ single `og:image` in `SeoHead.astro` |
| JSON-LD | ✅ `WebSite`, `Organization`, `SoftwareApplication` |
| `llms.txt` | ✅ |
| `humans.txt` | ✅ optional credits |
| Marketing landing pages | ✅ `/features` + existing index, demo, benchmarks |

---

## Requirements

| ID | Requirement |
|----|-------------|
| N-R1 | Valid `sitemap-index.xml` + per-locale URLs if added later |
| N-R2 | Every public page has unique title, description, canonical |
| N-R3 | JSON-LD: `Organization`, `SoftwareApplication`, `WebSite` |
| N-R4 | OG/Twitter images use Kit-Larva `og-image-mascot.png` |
| N-R5 | `robots.txt` + optional AI crawler rules |
| N-R6 | Lighthouse SEO ≥95 on `/`, `/docs`, `/demo` |
| N-R7 | Marketing pages for each major feature |
| N-R8 | Internal linking graph (docs ↔ demo ↔ showcase) |
| N-R9 | Packagist + GitHub repo descriptions aligned with SEO keywords |
| N-R10 | Analytics hook placeholder (privacy-respecting) |

---

## Sitemap strategy

```mermaid
flowchart TB
  Astro[Astro build]
  SM[@astrojs/sitemap]
  Custom[customPages in astro.config]
  Astro --> SM
  Custom --> SM
  SM --> IDX[sitemap-index.xml]
  SM --> S0[sitemap-0.xml pages]
```

### Include with priority

| Path pattern | changefreq | priority |
|--------------|------------|----------|
| `/` | weekly | 1.0 |
| `/docs/**` | weekly | 0.9 |
| `/demo`, `/simulation` | weekly | 0.85 |
| `/showcase`, `/benchmarks` | monthly | 0.8 |
| `/brand`, `/laravel` | monthly | 0.7 |
| Legal/governance | yearly | 0.3 |

### astro.config.mjs additions

```js
sitemap({
  filter: (page) => !page.includes('/api/'),
  customPages: [
    'https://reportkit.lorapok.tech/brand',
  ],
  serialize(item) {
    if (item.url.endsWith('/demo')) item.priority = 0.85;
    return item;
  },
}),
```

---

## SEO meta checklist (per layout)

- [ ] `<title>` unique, ≤60 chars
- [ ] `<meta name="description">` ≤160 chars
- [ ] `<link rel="canonical">`
- [ ] Open Graph: title, description, url, image (single)
- [ ] Twitter card: `summary_large_image`
- [ ] `<meta name="theme-color">`
- [ ] `<html lang="en">`
- [ ] JSON-LD script block

### Target keywords (natural use)

`Laravel reports`, `big database export`, `multi-database merge`, `prepare once export`, `DataTables pseudo pagination`, `PHP 5.6 reporting`

---

## Structured data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ReportKit",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Cross-platform",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": { "@type": "Organization", "name": "Lorapok Labs" }
}
```

Add to `BaseLayout.astro` or `SeoHead.astro` component.

---

## New / updated public files

| File | Purpose |
|------|---------|
| `public/robots.txt` | Sitemap + crawl rules |
| `public/llms.txt` | AI crawler summary + doc links |
| `public/humans.txt` | Credits (optional) |
| `src/components/SeoHead.astro` | Unified meta component |
| `src/pages/features.astro` | Product marketing grid |
| `src/pages/simulation.astro` | Animated demo (Phase L) |
| `public/brand/animated/*` | Kit-Larva GIFs |

---

## Marketing pages map

| Page | Message | CTA |
|------|---------|-----|
| `/` | Hero + Kit-Larva + 4-phase flow | Get started |
| `/features` | Prepare / store / browse / export | Docs |
| `/demo` | Live API + synthetic 50M | Try modes |
| `/simulation` | Animated corner cases | Watch flow |
| `/benchmarks` | Honest provenance numbers | Research doc |
| `/showcase` | Blade partial gallery | Install |
| `/brand` | Logo + mascot downloads | ZIP kit |

---

## Tasks

| Task | Deliverable | Status |
|------|-------------|--------|
| N1 | Extract `SeoHead.astro`; fix duplicate og:image | ✅ |
| N2 | Enhance sitemap serialize + priorities | ✅ |
| N3 | Add JSON-LD blocks | ✅ |
| N4 | Create `llms.txt` + link from robots comment | ✅ |
| N5 | `/features` marketing page with product PNGs | ✅ |
| N6 | Regenerate OG images with Kit-Larva (Phase M6) | ✅ |
| N7 | Docs frontmatter audit — all pages have description | ✅ |
| N8 | Internal link pass (related links component) | ✅ |
| N9 | GitHub repo topics + description SEO sync | ✅ |
| N10 | Lighthouse CI budget (optional workflow) | ✅ |
| N11 | `reportkit-website/docs/SEO.md` runbook | ✅ |

---

## Exit criteria

- [ ] Google Search Console sitemap submits clean
- [ ] Rich results test passes for SoftwareApplication
- [ ] Social share preview shows Kit-Larva OG image
- [ ] No duplicate meta tags in HTML validator
- [ ] All marketing pages linked from footer + sitemap
