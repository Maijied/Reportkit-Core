---
title: "Scale honesty"
description: "How we talk about billions of rows."
order: 91
group: "About"
---

Free tiers (GitHub Pages + Cloudflare Workers/D1) **cannot store billions of rows**.

| Mode | Meaning |
|------|---------|
| `live` | Real dual-D1 merge over seeded rows |
| `synthetic` | Deterministic generator over a huge virtual address space |
| `measured` | CI benchmark numbers with stated methodology |

Every marketing number on this site carries a provenance badge.
