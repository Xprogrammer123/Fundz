# Funds

Local-first bank statement analyzer. Import CSV/PDF statements, store them in encrypted SQLite in your browser, chart cashflow with EvilCharts, and export Excel — without uploading your data.

## Privacy promise

**Processing happens only on your device. We never receive your statements.**

- No backend for statement data
- SQLite via sql.js, persisted to IndexedDB (optional AES-GCM passphrase)
- Works offline after the first load (PWA service worker)

## Develop

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Browser extension

```bash
pnpm build:extension
```

Load `apps/extension/dist` as an unpacked extension in Chrome/Chromium.

## Stack

- React + Vite PWA
- shadcn/ui + Tailwind
- EvilCharts (Apache ECharts engine)
- `@funds/core` — CSV/PDF parse, SQLite, crypto, Excel export
- `@funds/banks` — Chase / HSBC UK / GTBank / generic presets
- `@funds/extension` — MV3 local CSV import shell
