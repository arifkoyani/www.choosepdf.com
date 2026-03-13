import Redis from "ioredis";

const REDIS_URL =
  process.env.REDIS_URL ||
  "redis://default:sIaqqkHp2ykiPCIa5U3gMijA5WGf11C6@redis-15239.c8.us-east-1-4.ec2.cloud.redislabs.com:15239";

// Singleton pattern to reuse connection across hot-reloads in Next.js dev
declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

let redis: Redis;

if (process.env.NODE_ENV === "production") {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });
} else {
  if (!global.__redis) {
    global.__redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }
  redis = global.__redis;
}

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected successfully");
});

export default redis;