import Bottleneck from 'bottleneck';
import { initRedis } from './redis';

let limiter: Bottleneck;

export async function initLimiter() {
  const redisClient = await initRedis();

  limiter = new Bottleneck({
    maxConcurrent: 10,
    minTime: 100,
    datastore: 'redis',
    clientOptions: {
      client: redisClient, // pass the connected Redis client
    },
    id: 'barcode-limiter',
  });

  console.log('✅ Bottleneck limiter initialized with Redis Cloud');
  return limiter;
}

export default {
  getLimiter: () => {
    if (!limiter) {
      throw new Error('Limiter has not been initialized. Please call initLimiter() first.');
    }
    return limiter;
  },
  initLimiter,
};
