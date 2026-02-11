import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

async function test() {
  await redis.set("ping", "pong");
  console.log(await redis.get("ping"));
  process.exit(0);
}

test().catch(console.error);
