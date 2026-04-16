import Redis from "ioredis";

// TCP connection via REDIS_URL — persistent socket, no HTTP cold-start per call
const redis = new Redis(process.env.REDIS_URL!, {
  tls: { rejectUnauthorized: false },
  lazyConnect: false,
  keepAlive: 10000,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
});

redis.on("error", (err) => {
  console.error("[redis] connection error:", err.message);
});

// Sliding window rate limiter via Lua (atomic, single round-trip)
const SLIDING_WINDOW_SCRIPT = `
local key       = KEYS[1]
local now       = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local max       = tonumber(ARGV[3])
local id        = ARGV[4]
redis.call('ZREMRANGEBYSCORE', key, 0, now - window_ms)
local count = redis.call('ZCARD', key)
if count < max then
  redis.call('ZADD', key, now, id)
  redis.call('PEXPIRE', key, window_ms)
  return 1
end
return 0
`;

// Per-user rate limit: 100 requests per minute per IP
export const ratelimit = {
  limit: async (ip: string) => {
    const now = Date.now();
    const result = await redis.eval(
      SLIDING_WINDOW_SCRIPT,
      1,
      `ratelimit:${ip}`,
      String(now),
      String(60 * 1000),
      String(100),
      `${now}-${Math.random()}`
    ) as number;
    return { success: result === 1 };
  },
};

// PDF.co global rate limit: max 2 calls per second across ALL requests
export async function waitForPdfcoSlot(): Promise<boolean> {
  const now = Date.now();
  const result = await redis.eval(
    SLIDING_WINDOW_SCRIPT,
    1,
    "pdfco-global",
    String(now),
    String(1000),
    String(2),
    `${now}-${Math.random()}`
  ) as number;
  return result === 1;
}

const QUEUE_KEY = "pdftoqrcode:active-jobs";
const MAX_CONCURRENT = 2;
const JOB_TTL_SECONDS = 30;

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
    1,
    QUEUE_KEY,
    String(now),
    String(JOB_TTL_SECONDS * 1000),
    String(MAX_CONCURRENT),
    jobId
  ) as number;
  return result === 1;
}

export async function releaseSlot(jobId: string): Promise<void> {
  await redis.zrem(QUEUE_KEY, jobId);
}

export async function waitForSlot(jobId: string): Promise<boolean> {
  return await acquireSlot(jobId);
}
