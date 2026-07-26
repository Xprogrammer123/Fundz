# Funds — User & Product Guide

Funds is a **local-first** bank statement analyzer. You import CSV/PDF statements in the browser, store them in an on-device SQLite vault, explore charts, and export Excel or chart images — without uploading transaction data to a server.

## Privacy promise

**Processing happens only on your device. We never receive your statements.**

| Claim | Meaning |
|-------|---------|
| No statement upload | File contents are read with the browser File API only |
| Local database | sql.js → IndexedDB (optional AES-GCM passphrase) |
| Offline-capable | Service worker caches the app after first load |
| No bank login | Manual file import only (no Plaid / scraping) |

## Quick start

1. Run `pnpm install` then `pnpm dev`
2. Open the printed localhost URL
3. Create a vault (passphrase optional)
4. **Import** → use a sample under `/samples/` or your bank CSV
5. Confirm mapping → you are taken to **Transactions**
6. Open **Charts**, pick chart type + day/month/year filters
7. Export Excel and/or chart PNG/JPG

## Screens

- **Home** — product positioning and trust summary
- **Import** — CSV/PDF wizard; auto-navigates to Transactions after success
- **Transactions** — search, edit categories, Excel export
- **Charts** — bar/line/area/pie/composed/radar/sankey + period filters + image export
- **Docs** — in-app documentation (`/docs`)
- **Settings** — passphrase, wipe local data

## Bank presets

Defined in `packages/banks`:

- Generic amount / debit-credit
- Chase CSV
- HSBC UK CSV
- GTBank CSV
- Generic PDF heuristic

Presets auto-match when headers look familiar.

## Chart modules (for custom EvilCharts styles)

Each chart type is isolated so you can paste style variants later:

- `apps/web/src/components/charts/bar-view.tsx`
- `line-view.tsx`, `area-view.tsx`, `pie-view.tsx`
- `composed-view.tsx`, `radar-view.tsx`, `sankey-view.tsx`
- Shared shell + PNG/JPG export: `chart-shell.tsx`, `export-chart-image.ts`

EvilCharts components live under `apps/web/src/components/evilcharts/`.

## Security notes

Local-first avoids a central breach of everyone’s statements. Remaining risks are device theft, malware, shared browsers, and mishandled exports. Use a passphrase on shared machines and wipe the vault when done.

Leaked statements can enable fraud, phishing, and profiling — do not treat Excel exports casually.

## Extension

```bash
pnpm build:extension
```

Load `apps/extension/dist` unpacked in Chrome. No host permissions; CSV import + Excel only.

## Monetization direction

- Free core local features
- Future one-time offline license for advanced packs
- Never sell transaction data
