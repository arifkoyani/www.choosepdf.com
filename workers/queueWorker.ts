/**
 * queueWorker.ts
 *
 * Background worker that processes queued barcode generation requests.
 *
 * HOW TO RUN (standalone):
 *   npx ts-node workers/queueWorker.ts
 * OR add to package.json scripts:
 *   "worker": "ts-node workers/queueWorker.ts"
 *
 * In production (e.g. Vercel), use a cron job or a separate worker process
 * to run this. You can also trigger it via a `/api/worker` route protected
 * by a secret token (see the route example at the bottom of this file).
 */

import redis from "../lib/redis";
import { checkRateLimit } from "../lib/limiter";
import { dequeueRequest, storeResult, getQueueLength } from "../lib/queue";

const API_KEY =
  process.env.CHOOSE_PDF_API_KEY ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY ||
  "";
const PDF_TO_QRCODE_URL =
  process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  "https://api.pdf.co/v1/barcode/generate";

const WORKER_INTERVAL_MS = 200; // Poll every 200ms
const MAX_BATCH_PER_TICK = 5; // Max jobs to process per tick (matches rate limit)

async function processJob(job: {
  id: string;
  payload: Record<string, any>;
}): Promise<void> {
  console.log(`[Worker] Processing job ${job.id}`);

  try {
    const res = await fetch(PDF_TO_QRCODE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(job.payload),
    });

    let data: Record<string, any>;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || "Non-JSON response from barcode API");
    }

    if (!res.ok || data.error === true) {
      const errorMsg =
        data?.message || data?.error || "Barcode generation failed";
      console.error(`[Worker] Job ${job.id} failed:`, errorMsg);
      await storeResult(job.id, { status: "error", error: errorMsg });
      return;
    }

    if (data.error === false && data.url) {
      await storeResult(job.id, {
        status: "done",
        data: {
          error: false,
          url: data.url,
          name: data.name || "barcode.png",
          status: data.status || 200,
          remainingCredits: data.remainingCredits || 0,
        },
      });
      console.log(`[Worker] Job ${job.id} completed: ${data.url}`);
    } else {
      await storeResult(job.id, {
        status: "error",
        error: data?.message || "Unknown error",
      });
    }
  } catch (err: any) {
    console.error(`[Worker] Job ${job.id} threw error:`, err.message);
    await storeResult(job.id, {
      status: "error",
      error: err.message || "Internal worker error",
    });
  }
}

async function tick(): Promise<void> {
  const queueLength = await getQueueLength();
  if (queueLength === 0) return;

  console.log(`[Worker] Queue length: ${queueLength}`);

  let processed = 0;
  while (processed < MAX_BATCH_PER_TICK) {
    // Respect rate limit before each job
    const allowed = await checkRateLimit();
    if (!allowed) {
      console.log("[Worker] Rate limit reached, pausing this tick");
      break;
    }

    const job = await dequeueRequest();
    if (!job) break; // Queue empty

    // Don't await so jobs in this tick run concurrently (up to MAX_BATCH)
    processJob(job);
    processed++;
  }
}

/**
 * Standalone worker loop — only runs when this file is executed directly.
 */
async function startWorker(): Promise<void> {
  console.log(
    `[Worker] Started. Polling every ${WORKER_INTERVAL_MS}ms, max ${MAX_BATCH_PER_TICK} jobs/tick`
  );

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("[Worker] Shutting down...");
    await redis.quit();
    process.exit(0);
  });

  setInterval(async () => {
    try {
      await tick();
    } catch (err: any) {
      console.error("[Worker] Tick error:", err.message);
    }
  }, WORKER_INTERVAL_MS);
}

// Run if executed directly (not imported)
if (require.main === module) {
  startWorker().catch(console.error);
}

// Export tick so it can be called from a Next.js API route cron trigger
export { tick };