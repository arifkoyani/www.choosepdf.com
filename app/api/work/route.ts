import { NextRequest, NextResponse } from "next/server";
import { tick } from "@/workers/queueWorker";

/**
 * GET /api/worker
 *
 * Triggers one "tick" of the queue worker.
 * Use this with Vercel Cron Jobs or any external scheduler.
 *
 * Protect with a secret token to prevent unauthorized triggering.
 *
 * Example vercel.json cron config:
 * {
 *   "crons": [{ "path": "/api/worker", "schedule": "* * * * *" }]
 * }
 *
 * For sub-minute frequency (e.g. every 200ms), use an external cron
 * service like Upstash QStash or run the standalone worker process instead.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Optional: protect with a secret header/token
  const authHeader = request.headers.get("authorization");
  const workerSecret = process.env.WORKER_SECRET;

  if (workerSecret && authHeader !== `Bearer ${workerSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await tick();
    return NextResponse.json({ ok: true, message: "Worker tick completed" });
  } catch (err: any) {
    console.error("[Worker Route] Tick failed:", err.message);
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 }
    );
  }
}