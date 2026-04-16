import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Per-user rate limit: 100 requests per minute per IP
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
});

// PDF.co global rate limit: max 2 calls per second across ALL requests
export const pdfcoRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "1 s"),
});

export async function waitForPdfcoSlot(): Promise<boolean> {
  const { success } = await pdfcoRatelimit.limit("pdfco-global");
  return success;
}

const QUEUE_KEY = "pdftoqrcode:active-jobs";
const MAX_CONCURRENT = 2;
const JOB_TTL_SECONDS = 30;

// Single Lua script: zremrangebyscore + zcard + zadd in ONE Redis round trip (was 3)
const ACQUIRE_SLOT_SCRIPT = `
local now    = tonumber(ARGV[1])
local ttl_ms = tonumber(ARGV[2])
local max    = tonumber(ARGV[3])
local job_id = ARGV[4]
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, now - ttl_ms)
local count = redis.call('ZCARD', KEYS[1])
if count < max then
  redis.call('ZADD', KEYS[1], now, job_id)
  return 1
end
return 0
`;

export async function acquireSlot(jobId: string): Promise<boolean> {
  const now = Date.now();
  const result = await redis.eval(
    ACQUIRE_SLOT_SCRIPT,
    [QUEUE_KEY],
    [String(now), String(JOB_TTL_SECONDS * 1000), String(MAX_CONCURRENT), jobId]
  ) as number;
  return result === 1;
}

export async function releaseSlot(jobId: string): Promise<void> {
  await redis.zrem(QUEUE_KEY, jobId);
}

export async function waitForSlot(jobId: string): Promise<boolean> {
  return await acquireSlot(jobId);
}


// To increase capacity
// Change this one line in lib/queueSystem.ts:


// // Currently:
// limiter: Ratelimit.slidingWindow(2, "1 s"),

// // If PDF.co plan allows 5/sec:
// limiter: Ratelimit.slidingWindow(5, "1 s"),
// That would multiply all numbers above by 2.5x (e.g. 432,000 req/day).