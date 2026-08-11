# Phase C — Browser kit

**Doc:** [plan index](../README.md)

**Status:** C1–C8 implemented in `reportkit-ui/js/reportkit.js` — Phase K browse wired via `ReportKit.table.fromPreparedStore` + `{slug}/browse` endpoint.

---

Port **`report-prepare.js`** into modular ES5 bundles (still one built file for L4.1):

| Module | Target |
|--------|--------|
| C1 `ReportKit.prepare` | runner, cancel, progress |
| C2 `ReportKit.store` | secure store, merge, persist |
| C3 `ReportKit.export` | excel, csv, pdf + ceilings from settings |
| C4 `ReportKit.pdf` | statement header, watermark, merge |
| C5 `ReportKit.mail` | zip, assessEmail, send FormData |
| C6 `ReportKit.ui` | toast, ETA, ping/mute, keep-alive |
| C7 `ReportKit.log` | activity buffer + panel hooks (Phase J) |
| C8 Aliases | `ShohozCommonReport = ReportKit` during bus migration |
| C9 Non-JSON guard | If AJAX body is HTML (302 login, 500 page), skip `response.json()`; dismiss prepare loader; toast `{ error }` |
| C10 AJAX timeout | Configurable timeout on `GET weeks` / `GET data`; fail fast vs stuck 0% |
| C11 Compose UX | CSV/Excel: silent Blob download. PDF: overlay with pages, PNR row progress, ETA, Ping/Mute/Cancel; disable all export buttons during PDF |
| C12 Reload reset | Page load / reload clears in-memory store; hide KPI + disable exports until next prepare |

**Performance rule:** all heavy work uses `runDeferredUiWork` / `processInChunks`; logging never runs inside tight loops without sampling.

**Staging reference (2026-08-10):** see [prepare-export-flow.md](../critical-paths/prepare-export-flow.md) — CSV instant, PDF ~376 pages on 39k PNR rows, reload wipes prepared data.

---
