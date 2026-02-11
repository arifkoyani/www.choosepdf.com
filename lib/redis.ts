import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient>;

// Function to create and connect Redis client
export async function initRedis() {
  if (!redisClient) {
    redisClient = createClient({
      username: 'default',
      password: process.env.REDIS_PASSWORD || 'sIaqqkHp2ykiPCIa5U3gMijA5WGf11C6',
      socket: {
        host: process.env.REDIS_HOST || 'redis-15239.c8.us-east-1-4.ec2.cloud.redislabs.com',
        port: Number(process.env.REDIS_PORT) || 15239,
      },
    });

    redisClient.on('error', (err) => console.error('Redis Client Error', err));

    await redisClient.connect();
    console.log('✅ Redis client connected!');
  }
  return redisClient;
}
