import redis from "./redis";
import { v4 as uuidv4 } from "uuid";

const QUEUE_KEY = "pdftoqrcode:queue";
const RESULT_KEY_PREFIX = "pdftoqrcode:result:";
const RESULT_TTL_SECONDS = 300; // Results stored for 5 minutes

export interface QueuedRequest {
  id: string;
  payload: Record<string, any>;
  enqueuedAt: number;
}

export interface QueuedResult {
  status: "pending" | "done" | "error";
  data?: Record<string, any>;
  error?: string;
}

/**
 * Adds a request to the Redis queue.
 * Returns the unique job ID so the client can poll for results.
 */
export async function enqueueRequest(
  payload: Record<string, any>
): Promise<string> {
  const id = uuidv4();
  const job: QueuedRequest = {
    id,
    payload,
    enqueuedAt: Date.now(),
  };

  // Push to the right of the list (FIFO queue)
  await redis.rpush(QUEUE_KEY, JSON.stringify(job));

  // Set result as pending so client can poll
  const pendingResult: QueuedResult = { status: "pending" };
  await redis.setex(
    `${RESULT_KEY_PREFIX}${id}`,
    RESULT_TTL_SECONDS,
    JSON.stringify(pendingResult)
  );

  console.log(`[Queue] Enqueued job ${id}`);
  return id;
}

/**
 * Dequeues the next request from the queue (FIFO).
 * Returns null if the queue is empty.
 */
export async function dequeueRequest(): Promise<QueuedRequest | null> {
  const raw = await redis.lpop(QUEUE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as QueuedRequest;
  } catch {
    console.error("[Queue] Failed to parse queued job:", raw);
    return null;
  }
}

/**
 * Returns the current queue length.
 */
export async function getQueueLength(): Promise<number> {
  return redis.llen(QUEUE_KEY);
}

/**
 * Stores the result of a processed job.
 */
export async function storeResult(
  id: string,
  result: QueuedResult
): Promise<void> {
  await redis.setex(
    `${RESULT_KEY_PREFIX}${id}`,
    RESULT_TTL_SECONDS,
    JSON.stringify(result)
  );
}

/**
 * Retrieves the result of a job by ID.
 * Returns null if the job ID doesn't exist or has expired.
 */
export async function getResult(id: string): Promise<QueuedResult | null> {
  const raw = await redis.get(`${RESULT_KEY_PREFIX}${id}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as QueuedResult;
  } catch {
    return null;
  }
}