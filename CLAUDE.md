# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run worker       # Run the Redis queue worker (separate process)
npm run test:limiter # Test rate limiting logic
```

## Architecture

**ChoosePDF** is a Next.js 16 (App Router) platform wrapping the PDF.co API, exposing 50+ PDF manipulation tools through a modular UI.

### Key Layers

**API Routes** (`app/api/`): 50+ routes, each handling a distinct PDF operation (merge, compress, convert, etc.). All routes go through `lib/withRateLimit.ts` which enforces a global Redis sliding-window rate limit (default 5 req/sec via `RATE_LIMIT_PER_SECOND`).

**Rate Limiting + Queue** (`lib/`):
- `limiter.ts` — atomic Lua-script-based sliding window rate limiter using Redis sorted sets
- `queue.ts` — Redis list-based FIFO job queue; clients poll by job ID for results
- `withRateLimit.ts` — HOC wrapping API route handlers; enqueues if rate-limited (429)
- `redis.ts` — singleton Redis client (reused across Next.js hot-reloads)

**Queue Worker** (`workers/queueWorker.ts`): Standalone process that drains the Redis queue, calls PDF.co, and writes results back. Run separately with `npm run worker`. Handles PDF.co 429s with backoff and re-queuing. Configurable via `PDFCO_SAFE_LIMIT`.

**UI Components** (`app/components/ClientFeatures/`): ~122 feature components, one per PDF tool. All composed in `Main/` which renders a tabbed/searchable grid of tools.

**Auth** (`middleware.ts` + Supabase): Cookie-based auth guards the `/blog/dashboard`, `/blog/create-blogs`, `/blog/delete-blogs`, `/blog/update-blogs`, and `/blog/all-blogs` routes. Unauthenticated requests redirect to `/blog/login`.

### Environment Variables

```
REDIS_URL                    # Hosted Redis connection string
CHOOSE_PDF_API_KEY           # PDF.co API key
RATE_LIMIT_PER_SECOND        # Global rate limit (default: 5)
PDFCO_SAFE_LIMIT             # Safe req/sec for PDF.co plan (default: 2)
```

PDF.co endpoint URLs are also passed as env vars (e.g., `CHOOSE_PDF_JPG_TO_PDF_URL`).

### Path Alias

`@/*` resolves to the project root (set in `tsconfig.json`).
