# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

One2All / QH视觉检测平台 — an Electron + Nuxt 3 desktop application for industrial visual inspection. The app captures images from industrial cameras (Basler GigE), runs AI-based defect detection via an external Python backend, and supports model training/retraining with FP/FN sample management. Hardware trigger is provided through a Modbus-connected PLC with physical start/reset buttons and indicator lights.

## Key Commands

```bash
# Development (runs both Nuxt dev server on :3001 and Electron)
npm run dev

# Production build (full pipeline: Prisma generate + Nuxt generate + electron-builder)
npm run build

# Fast build (skips some compression)
npm run build:fast

# Prisma
npm run prisma:generate          # Regenerate Prisma client to prisma/generated/
npx prisma studio                # Open Prisma Studio to inspect SQLite data

# Renderer only
cd renderer && npm run dev       # Nuxt dev server only (port 3001)
cd renderer && npm run generate  # Static site generation to .output/public/
```

## Architecture

### Three-layer architecture

1. **Electron main process** (`electron/main.js`) — the host layer. Manages the BrowserWindow, a built-in static file server (prod mode), all IPC handlers, the Modbus button monitor, and camera service proxying. Also directly uses PrismaClient for database access.

2. **Nuxt 3 renderer** (`renderer/`) — the UI layer. Vue 3 + Tailwind CSS + shadcn-vue (Radix UI) components. i18n support (zh/en). Runs as a Nuxt dev server in development, or as pre-built static files served by the Electron main process in production.

3. **Python backend** (external, default `http://localhost:8000`) — the AI compute layer. Manages camera connections (Basler SDK), model training, ONNX conversion, and inference deployment. The Electron app communicates with it via HTTP; the Nuxt server API proxies deploy/inference requests to it.

### IPC Communication

The renderer communicates with the Electron main process exclusively through `window.electronAPI` (defined in `electron/preload.js`, typed in `renderer/electron-api.d.ts`). Each API method maps to an `ipcMain.handle()` channel. There's also a special `window.__externalCapture()` — set by the renderer — that the Modbus button monitor calls to trigger image capture from hardware button presses.

### Database (Prisma + SQLite)

The database file is `prisma/dev.db`. Key models:
- **Product** — inspection target, can bind an AnnotationScheme
- **TrainingRecord** — training job records with retrain support (taskChain, generation for lineage tracking)
- **RoiImage** — saved ROI crops from inference results, classified as FP (false positive) or FN (false negative), used for retraining
- **AppSettings** — singleton (id=1) storing data path, locale, backend URL, image and Modbus settings
- **Camera** — registered cameras (system or network)
- **AnnotationScheme / Annotation / DatasetVersion** — annotation and dataset management

### Renderer pages

- `index.vue` — main inspection page (image capture, ROI display, annotation, camera control)
- `training.vue` — model training and retraining with FP/FN sample management
- `deploy.vue` — model deployment as HTTP inference services
- `settings.vue` — app settings (data path, backend, Modbus, image parameters)
- `annotation.vue` — manual annotation tools

### Nuxt Server API

`renderer/server/api/deploy/[...path].ts` — a catch-all API route that manages deploy lifecycle (start/stop HTTP services, ONNX conversion, inference, health checks, logs). Proxies to the Python backend for actual model operations but maintains an in-memory registry of running services.

`renderer/server/utils/settings.ts` — reads AppSettings from Prisma for use in server-side API routes.

### Modbus Hardware Integration

`electron/main.js` contains a `ButtonMonitor` class that polls a Modbus TCP module for physical button states:
- Start button (DI channel) → triggers image capture via `window.__externalCapture()`
- Reset button → clears error state
- Controls indicator lights (green/yellow/red) and buzzer via Modbus coils
- Configuration is stored in `modbusSettings` within AppSettings

### Build Output

- `electron-builder` packages everything into `dist/` as an NSIS installer (Windows x64)
- Production structure: `renderer/.output/public/` is bundled as static files alongside `prisma/` in the ASAR
- SQLite DB is unpacked from ASAR (`asarUnpack`) so it's writable at runtime

### Others
使用中文回复，用英文思考和分析
