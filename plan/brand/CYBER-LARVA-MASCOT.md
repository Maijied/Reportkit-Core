# Kit-Larva — Cybernetic Soldier Fly Larva (design spec)

**Mascot name:** Kit-Larva  
**Product line:** ReportKit by Lorapok Labs  
**Version:** brand v2.0 (2026)

---

## Narrative

Kit-Larva is ReportKit's pipeline optimizer — enterprise voice, Lorapok-aligned. **Motto:** MULTI-DATABASE REPORT ENGINE · **Tagline:** Prepare once · secure store · export without re-query


---

## Visual anatomy

```
        ╭── glowing eyes (large ovoid, #8ef0c4 core)
       ╭╯
    ┌──┴──┐  ← head segment (charcoal plate #1a1f24)
    │ ◉ ◉ │
    └──┬──┘
       │  neon seam (#22a06b)
    ┌──┴──┐
    │ ▣ ▣ │  ← body segments (3–5 visible in icon)
    └──┬──┘
       ╰────── coils around center merge icon ──────╮
                                                    │
              [ live DB ]──╮                        │
                           ● merge                  │
              [ archive ]──╯    ─── report bars     │
                                                    ╰── tiny robotic legs
```

---

## Color palette

| Token | Hex | Use |
|-------|-----|-----|
| `--larva-armor` | `#1a1f24` | Primary plating |
| `--larva-armor-light` | `#2d3439` | Segment edges |
| `--larva-neon` | `#0b7a4b` | CAS accent panels |
| `--larva-glow` | `#22a06b` | Panel bright |
| `--larva-eye` | `#8ef0c4` | Eye glow + highlights |
| `--larva-eye-core` | `#ffffff` | Eye catch light |

Existing ReportKit center icon colors **unchanged** inside the coil.

---

## Construction notes (SVG)

1. Draw center group first (existing paths from `reportkit-icon.svg`).
2. Larva path: single compound path or grouped segments for animation.
3. Eyes: layered ellipses + `filter: drop-shadow` for glow (export flat for favicon).
4. Legs: 6 minimal L-shapes, `#2d3439`, only visible ≥64px.
5. Coil gap: 4px minimum between larva body and center glyph at all sizes.

---

## Motion storyboards

### Idle (GIF, 2s loop)

- Eyes blink every 1.2s
- Neon panel opacity 0.7 → 1.0 pulse
- One segment shifts 1px clockwise (subtle peristalsis)

### Prepare (GIF, sync with progress)

- Each week complete → larva advances one segment glow wave
- Center merge node pulses on row merge
- At 100% → eyes flash success green

### Simulation phase rail

- Kit-Larva icon sits on active phase node
- Rotates segment highlight as phases advance

---

## Marketing compositions

| Image | Layout |
|-------|--------|
| Hero | Larva lockup left; headline right; dark charcoal gradient bg |
| Product sheet — Prepare | Larva on week timeline; “Consumes bottlenecks” caption |
| Product sheet — Live data | Eyes glowing; “Feels alive” caption |
| Social square | Center icon + coil; wordmark below |

All marketing uses **fictional** metrics labels with provenance badges.

---

## Accessibility

- `aria-label="ReportKit Kit-Larva mascot"` on decorative imgs
- Meaningful alt on marketing: “ReportKit mascot — friendly data pipeline optimizer”
- Animation respects `prefers-reduced-motion` (static frame fallback)

---

## Related docs

- [Phase M — Brand rollout](../phases/M-brand-mascot.md)
- [Phase N — SEO & marketing](../phases/N-seo-marketing.md)
- Site gallery: `/brand`
