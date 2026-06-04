# CLAUDE.md

## Project Overview

**Comparator** — web scraper that tracks values on URLs over time and displays their history.
- Node.js 25 / TypeScript 5 / Express 4 / SQLite (better-sqlite3)
- Vanilla HTML/CSS frontend (no framework), served as static files from Express
- Playwright for JS-rendered pages, axios + cheerio for static pages

## Commands

```bash
npm run dev          # dev server with hot reload (ts-node-dev)
npm run build        # compile TypeScript → dist/
npm start            # run compiled build
npm test             # Jest (30 tests)
npm run test:watch   # Jest watch mode
npm run test:coverage
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint on src/ and tests/
```

## Architecture

```
src/
  server.ts              # entry point — starts Express + scheduler
  app.ts                 # createApp() — Express setup, routes, static files
  types.ts               # shared interfaces (Tracker, HistoryEntry, CheckResult, TrackerStats, CreateTrackerDto)
  api/
    routes/
      trackers.ts        # CRUD + manual check endpoint
      history.ts         # history list + stats per tracker
    middleware/
      errorHandler.ts    # HttpError class + global error handler
  scraper/
    extractor.ts         # checkUrl() — dispatches to fetcher or playwright-fetcher
    fetcher.ts           # HTTP fetch via axios
    playwright-fetcher.ts# JS-rendered fetch via Playwright
  scheduler/
    index.ts             # node-cron tasks — scheduleTracker / stopTracker / startScheduler
  storage/
    db.ts                # singleton SQLite connection, auto-migration on first connect
    trackerRepo.ts       # CRUD for trackers table
    historyRepo.ts       # insert / findByTrackerId / findLatestByTrackerId / getStats
    migrations/
      001_init.sql       # trackers + history tables
      002_js_render.sql  # adds js_render column to trackers

public/
  index.html             # single-page frontend (vanilla HTML/CSS/JS)

tests/
  api/trackers.test.ts
  scraper/extractor.test.ts
  storage/trackerRepo.test.ts
  storage/historyRepo.test.ts
  setup.ts               # in-memory SQLite for tests (DB_PATH=:memory:)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/trackers` | List all trackers with latest history entry |
| GET | `/api/trackers/:id` | Get single tracker |
| POST | `/api/trackers` | Create tracker + run first check immediately |
| PATCH | `/api/trackers/:id` | Update tracker fields (reschedules if interval/active changes) |
| DELETE | `/api/trackers/:id` | Delete tracker + stop its schedule |
| POST | `/api/trackers/:id/check` | Trigger manual check |
| GET | `/api/history/:trackerId` | Get history (default limit 100, `?limit=N`) |
| GET | `/api/history/:trackerId/stats` | Get stats (globalMin/Max/Avg, todayMin/Max, count) |

## Key Behaviors

- **DB path**: `data.db` at project root by default; override with `DB_PATH` env var (tests use `:memory:`)
- **Port**: `3000` by default; override with `PORT` env var
- **Auth**: if `API_KEY` env var is set, all `/api` routes require `Authorization: Bearer <key>`; if not set, the API is open (dev mode). The frontend stores the key in `localStorage` and prompts for it on 401.
- **Scheduler**: starts automatically with the server, loads all active trackers from DB
- **Interval → cron**: `< 60 min` → `*/N * * * *`; `≥ 60 min` → `0 */H * * *`
- **jsRender flag**: when true, fetches via Playwright (headless Chromium); when false, uses axios
- **Migrations**: auto-applied at startup via `PRAGMA user_version`

## Tooling & Quality

- **TypeScript**: strict mode, `target: ES2020`, `module: commonjs`, source maps on
- **ESLint**: `@typescript-eslint` rules on `src/` and `tests/`
- **Jest**: ts-jest, 4 test suites, 30 tests — all must pass before committing
- **CI** (GitHub Actions on push/PR to `main`): lint → typecheck → test with coverage
- **PostToolUse hook**: runs `npm test` automatically after every file edit
- **Stop hook**: runs `npm run typecheck` at end of each Claude session

## Known Gaps (to address)

- No rate limiting
- No rate limiting
- `src/db/`, `src/models/`, `src/routes/`, `src/services/` are empty placeholder dirs
- No coverage threshold enforced in CI
- No CD pipeline
- CI uses Node 20, local dev uses Node 25
