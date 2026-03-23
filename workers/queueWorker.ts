/**
 * queueWorker.ts
 *
 * Drains the Redis queue and calls PDF.co at a safe, controlled rate.
 * Never calls PDF.co more than MAX_REQUESTS_PER_SECOND times/sec.
 *
 * Run locally:
 *   npx ts-node workers/queueWorker.ts
 *
 * On Vercel: trigger /api/worker via Vercel Cron every minute.
 */

import redis from "../lib/redis";
import { dequeueRequest, storeResult, getQueueLength } from "../lib/queue";

const API_KEY =
  process.env.CHOOSE_PDF_API_KEY ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY ||
  "";

const PDF_TO_QRCODE_URL =
  process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL ||
  "https://api.pdf.co/v1/barcode/generate";

// ── Rate control ──────────────────────────────────────────────────────────────
// PDF.co allows 2 req/sec on your plan, so we use 1.8 to stay safely under.
// Change this to match your actual PDF.co plan limit.
const PDFCO_SAFE_LIMIT = parseInt(process.env.PDFCO_SAFE_LIMIT || "2", 10);

// Minimum gap between consecutive PDF.co calls in ms
// e.g. 2 req/sec → 1000/2 = 500ms gap
const MIN_GAP_MS = Math.ceil(1000 / PDFCO_SAFE_LIMIT);

let lastCallAt = 0; // Timestamp of last PDF.co call

// ── Sleep helper ──────────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Process one job ───────────────────────────────────────────────────────────
async function processJob(job: {
  id: string;
  payload: Record<string, any>;
}): Promise<void> {
  // Enforce minimum gap between calls
  const now = Date.now();
  const elapsed = now - lastCallAt;
  if (elapsed < MIN_GAP_MS) {
    await sleep(MIN_GAP_MS - elapsed);
  }

  lastCallAt = Date.now();
  console.log(`[Worker] Calling PDF.co for job ${job.id}`);

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
    const ct = res.headers.get("content-type");

    if (ct && ct.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || "Non-JSON response from PDF.co");
    }

    // PDF.co returned its own 429 — back off and re-queue
    if (res.status === 429) {
      console.warn(`[Worker] PDF.co 429 on job ${job.id} — re-queuing after 2s`);
      await sleep(2000);
      // Push job back to front of queue
      await redis.lpush("pdftoqrcode:queue", JSON.stringify(job));
      return;
    }

    if (!res.ok || data.error === true) {
      const errorMsg = data?.message || data?.error || "Barcode generation failed";
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
      console.log(`[Worker] Job ${job.id} done → ${data.url}`);
    } else {
      await storeResult(job.id, {
        status: "error",
        error: data?.message || "Unknown error",
      });
    }
  } catch (err: any) {
    console.error(`[Worker] Job ${job.id} threw:`, err.message);
    await storeResult(job.id, {
      status: "error",
      error: err.message || "Internal worker error",
    });
  }
}

// ── One tick: drain as many jobs as possible ──────────────────────────────────
export async function tick(): Promise<void> {
  const queueLength = await getQueueLength();
  if (queueLength === 0) return;

  console.log(`[Worker] Queue has ${queueLength} job(s)`);

  // Process jobs one-by-one with enforced gap (no concurrency = no burst)
  while (true) {
    const job = await dequeueRequest();
    if (!job) break;
    await processJob(job); // sequential — waits for each before next
  }
}

// ── Standalone loop ───────────────────────────────────────────────────────────
async function startWorker(): Promise<void> {
  console.log(
    `[Worker] Started. PDF.co safe limit: ${PDFCO_SAFE_LIMIT} req/sec (${MIN_GAP_MS}ms gap)`
  );

  process.on("SIGINT", async () => {
    console.log("[Worker] Shutting down...");
    await redis.quit();
    process.exit(0);
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await tick();
    } catch (err: any) {
      console.error("[Worker] Tick error:", err.message);
    }
    await sleep(MIN_GAP_MS); // Wait one gap before checking queue again
  }
}

if (require.main === module) {
  startWorker().catch(console.error);
}


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


// import redis from "../lib/redis";
// import { checkRateLimit } from "../lib/limiter";
// import { dequeueRequest, storeResult, getQueueLength } from "../lib/queue";

// const API_KEY =
//   process.env.CHOOSE_PDF_API_KEY ||
//   process.env.NEXT_PUBLIC_CHOOSE_PDF_API_KEY ||
//   "";
// const PDF_TO_QRCODE_URL =
//   process.env.CHOOSE_PDF_PDF_TO_QRCODE_URL ||
//   process.env.NEXT_PUBLIC_CHOOSE_PDF_PDF_TO_QRCODE_URL ||
//   "https://api.pdf.co/v1/barcode/generate";

// const WORKER_INTERVAL_MS = 200; // Poll every 200ms
// const MAX_BATCH_PER_TICK = 5; // Max jobs to process per tick (matches rate limit)

// async function processJob(job: {
//   id: string;
//   payload: Record<string, any>;
// }): Promise<void> {
//   console.log(`[Worker] Processing job ${job.id}`);

//   try {
//     const res = await fetch(PDF_TO_QRCODE_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": API_KEY,
//       },
//       body: JSON.stringify(job.payload),
//     });

//     let data: Record<string, any>;
//     const contentType = res.headers.get("content-type");
//     if (contentType && contentType.includes("application/json")) {
//       data = await res.json();
//     } else {
//       const text = await res.text();
//       throw new Error(text || "Non-JSON response from barcode API");
//     }

//     if (!res.ok || data.error === true) {
//       const errorMsg =
//         data?.message || data?.error || "Barcode generation failed";
//       console.error(`[Worker] Job ${job.id} failed:`, errorMsg);
//       await storeResult(job.id, { status: "error", error: errorMsg });
//       return;
//     }

//     if (data.error === false && data.url) {
//       await storeResult(job.id, {
//         status: "done",
//         data: {
//           error: false,
//           url: data.url,
//           name: data.name || "barcode.png",
//           status: data.status || 200,
//           remainingCredits: data.remainingCredits || 0,
//         },
//       });
//       console.log(`[Worker] Job ${job.id} completed: ${data.url}`);
//     } else {
//       await storeResult(job.id, {
//         status: "error",
//         error: data?.message || "Unknown error",
//       });
//     }
//   } catch (err: any) {
//     console.error(`[Worker] Job ${job.id} threw error:`, err.message);
//     await storeResult(job.id, {
//       status: "error",
//       error: err.message || "Internal worker error",
//     });
//   }
// }

// async function tick(): Promise<void> {
//   const queueLength = await getQueueLength();
//   if (queueLength === 0) return;

//   console.log(`[Worker] Queue length: ${queueLength}`);

//   let processed = 0;
//   while (processed < MAX_BATCH_PER_TICK) {
//     // Respect rate limit before each job
//     const allowed = await checkRateLimit();
//     if (!allowed) {
//       console.log("[Worker] Rate limit reached, pausing this tick");
//       break;
//     }

//     const job = await dequeueRequest();
//     if (!job) break; // Queue empty

//     // Don't await so jobs in this tick run concurrently (up to MAX_BATCH)
//     processJob(job);
//     processed++;
//   }
// }

// /**
//  * Standalone worker loop — only runs when this file is executed directly.
//  */
// async function startWorker(): Promise<void> {
//   console.log(
//     `[Worker] Started. Polling every ${WORKER_INTERVAL_MS}ms, max ${MAX_BATCH_PER_TICK} jobs/tick`
//   );

//   // Graceful shutdown
//   process.on("SIGINT", async () => {
//     console.log("[Worker] Shutting down...");
//     await redis.quit();
//     process.exit(0);
//   });

//   setInterval(async () => {
//     try {
//       await tick();
//     } catch (err: any) {
//       console.error("[Worker] Tick error:", err.message);
//     }
//   }, WORKER_INTERVAL_MS);
// }

// // Run if executed directly (not imported)
// if (require.main === module) {
//   startWorker().catch(console.error);
// }

// // Export tick so it can be called from a Next.js API route cron trigger
// export { tick };