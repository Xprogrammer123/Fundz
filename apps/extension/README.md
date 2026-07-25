# Funds browser extension

Phase 2 shell: a Chrome/Chromium MV3 popup that reuses `@funds/core` CSV parsing and Excel export. **No host permissions** — statement data stays on the device (`chrome.storage.local`).

## Build

```bash
pnpm --filter @funds/extension build
```

Load `apps/extension/dist` via `chrome://extensions` → Developer mode → Load unpacked.

## What it does

- Import bank CSV (auto-matches Chase / HSBC UK / GTBank / generic presets)
- Store rows locally in the extension
- Export Excel
- Wipe local extension data

Full charts and encrypted SQLite vault remain in the web PWA (`apps/web`).
