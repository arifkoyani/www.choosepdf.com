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

export async function waitForPdfcoSlot(maxWaitMs = 30000): Promise<boolean> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const { success } = await pdfcoRatelimit.limit("pdfco-global");
    if (success) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const QUEUE_KEY = "pdftoqrcode:active-jobs";
const MAX_CONCURRENT = 2;
const JOB_TTL_SECONDS = 30;

export async function acquireSlot(jobId: string): Promise<boolean> {
  const now = Date.now();
  await redis.zremrangebyscore(QUEUE_KEY, 0, now - JOB_TTL_SECONDS * 1000);
  const runningCount = await redis.zcard(QUEUE_KEY);

  if (runningCount < MAX_CONCURRENT) {
    await redis.zadd(QUEUE_KEY, { score: now, member: jobId });
    return true;
  }
  return false;
}

export async function releaseSlot(jobId: string): Promise<void> {
  await redis.zrem(QUEUE_KEY, jobId);
}

export async function waitForSlot(jobId: string, maxWaitMs = 60000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const acquired = await acquireSlot(jobId);
    if (acquired) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}
