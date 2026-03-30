cat > docs/RATE_LIMIT_QUEUE_SYSTEM.md << 'EOF'
# Rate Limit + Queue System for Next.js API Routes

## Overview

A production-ready system that protects your Next.js API routes from overload while ensuring all valid requests are processed. Built for Vercel serverless environment using Upstash Redis.

---

## Problem Solved

| Problem | Solution |
|---------|----------|
| 10 requests hit API at once | Queue processes only 2 at a time |
| Server overload | Global concurrency limit |
| Abusive users/bots | Rate limit per user (100/min) |
| Lost requests | All requests wait in queue |
| Serverless memory isolation | Redis as shared state |

---

## Architecture
```
User Requests
      │
      ▼
┌─────────────────────────┐
│  RATE LIMIT (Per User)  │
│  100 requests/minute    │
│  ❌ Blocks abusers      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  REDIS QUEUE (Global)   │
│  Max 2 concurrent jobs  │
│  ⏳ Others wait in line │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  PROCESS REQUEST        │
│  Your business logic    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  RELEASE SLOT           │
│  Next request starts    │
└─────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js (App Router) |
| Hosting | Vercel |
| Redis | Upstash (REST API) |
| Rate Limiting | @upstash/ratelimit |

---

## File Structure
```
project-root/
├── lib/
│   └── queueSystem.js      # Rate limit + Queue logic
├── utils/
│   └── uuid.js             # Unique job ID generator
├── app/
│   └── api/
│       └── pdftoqrcode/
│           └── route.js    # API endpoint
└── .env.local              # Upstash credentials
```

---

## Configuration

### Environment Variables
```env
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

### Adjustable Parameters

| Parameter | Location | Default | Description |
|-----------|----------|---------|-------------|
| `MAX_CONCURRENT` | queueSystem.js | 2 | Max simultaneous jobs |
| `JOB_TTL_SECONDS` | queueSystem.js | 30 | Job timeout (safety) |
| `maxWaitMs` | route.js | 60000 | Max queue wait time (ms) |
| Rate Limit | queueSystem.js | 100/1m | Requests per minute per user |

---

## How It Works

### 1. Rate Limiting (Per User)
```javascript
const { success } = await ratelimit.limit(ip);
```

- Tracks requests per IP address
- Blocks if > 100 requests in 1 minute
- Returns 429 status code

### 2. Queue System (Global)
```javascript
const gotSlot = await waitForSlot(jobId, 60000);
```

- Uses Redis sorted set to track active jobs
- Polls every 500ms for available slot
- Automatically cleans expired jobs (30s TTL)

### 3. Slot Management
```javascript
// Acquire slot before processing
await acquireSlot(jobId);

// Release slot after done (in finally block)
await releaseSlot(jobId);
```

---

## API Response Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 429 | Rate limit exceeded |
| 503 | Queue timeout |
| 500 | Processing error |

---

## Example Request Flow
```
Time 0s:   Request 1 → Slot 1 ✅ Processing
Time 0s:   Request 2 → Slot 2 ✅ Processing
Time 0s:   Request 3 → ⏳ Waiting...
Time 0s:   Request 4 → ⏳ Waiting...
Time 2s:   Request 1 → Done, releases slot
Time 2s:   Request 3 → Slot 1 ✅ Processing
Time 2s:   Request 2 → Done, releases slot
Time 2s:   Request 4 → Slot 2 ✅ Processing
Time 4s:   All done ✅
```

---

## Dependencies
```bash
yarn add @upstash/redis @upstash/ratelimit
```

---

## Setup Steps

1. Create Upstash account at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy REST URL and Token
4. Add to `.env.local`
5. Add to Vercel Environment Variables
6. Deploy

---

## Security Notes

- ⚠️ Never commit `.env.local` to git
- ⚠️ Never share tokens publicly
- ✅ Add `.env.local` to `.gitignore`
- ✅ Regenerate tokens if exposed

---

## Monitoring

View queue activity in Upstash Dashboard:
- Data Browser → `pdftoqrcode:active-jobs`
- Shows currently running jobs

---

## Limitations

| Limitation | Workaround |
|------------|------------|
| 60s max wait | Increase `maxWaitMs` |
| 10,000 cmds/day (free tier) | Upgrade Upstash plan |
| Jobs stuck if server crashes | 30s TTL auto-cleans |

---

