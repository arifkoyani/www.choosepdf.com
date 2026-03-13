import redis from "./redis";

const RATE_LIMIT_KEY = "pdftoqrcode:ratelimit";
const MAX_REQUESTS_PER_SECOND = parseInt(
  process.env.RATE_LIMIT_PER_SECOND || "5",
  10
);

/**
 * Uses a Redis sliding window (sorted set) to enforce N requests/second globally.
 * Returns true if the request is allowed, false if rate-limited.
 */
export async function checkRateLimit(): Promise<boolean> {
  const now = Date.now(); // milliseconds
  const windowStart = now - 1000; // 1 second window

  // Lua script for atomic check-and-add
  const luaScript = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window_start = tonumber(ARGV[2])
    local max_requests = tonumber(ARGV[3])

    -- Remove entries outside the 1-second window
    redis.call("ZREMRANGEBYSCORE", key, "-inf", window_start)

    -- Count current requests in window
    local current_count = redis.call("ZCARD", key)

    if current_count < max_requests then
      -- Allow: add this request with score = current timestamp
      redis.call("ZADD", key, now, now .. "-" .. math.random(1000000))
      -- Expire key after 2 seconds to auto-clean
      redis.call("PEXPIRE", key, 2000)
      return 1
    else
      return 0
    end
  `;

  const result = await redis.eval(
    luaScript,
    1,
    RATE_LIMIT_KEY,
    now.toString(),
    windowStart.toString(),
    MAX_REQUESTS_PER_SECOND.toString()
  );

  return result === 1;
}

/**
 * Returns current request count in the sliding window (for debugging/monitoring).
 */
export async function getCurrentRequestCount(): Promise<number> {
  const now = Date.now();
  const windowStart = now - 1000;
  await redis.zremrangebyscore(RATE_LIMIT_KEY, "-inf", windowStart);
  return redis.zcard(RATE_LIMIT_KEY);
}