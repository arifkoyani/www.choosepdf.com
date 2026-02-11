import { initLimiter } from './limiter';

(async () => {
  const limiter = await initLimiter();
  console.log('Starting 20 test requests...');

  for (let i = 1; i <= 20; i++) {
    limiter.schedule(async () => {
      const time = new Date().toISOString();
      console.log(`Request ${i} processed at ${time}`);
      return i;
    });
  }

  setTimeout(() => {
    console.log('✅ All test requests processed!');
    process.exit(0);
  }, 5000);
})();
