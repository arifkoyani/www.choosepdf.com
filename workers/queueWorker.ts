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
