import { NextRequest, NextResponse } from "next/server";
import { getResult } from "@/lib/queue";

/**
 * GET /api/pdftoqrcode/result?jobId=<uuid>
 *
 * Poll this endpoint after receiving a 202 queued response.
 * Returns:
 *   - { status: "pending" }          → still in queue / processing
 *   - { status: "done", data: {...} } → completed successfully
 *   - { status: "error", error: "…" } → job failed
 *   - 404 if job ID not found or expired (TTL: 5 min)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: true, message: "jobId query parameter is required" },
      { status: 400 }
    );
  }

  const result = await getResult(jobId);

  if (!result) {
    return NextResponse.json(
      { error: true, message: "Job not found or result expired" },
      { status: 404 }
    );
  }

  if (result.status === "pending") {
    return NextResponse.json({ status: "pending" }, { status: 202 });
  }

  if (result.status === "done") {
    return NextResponse.json({ status: "done", ...result.data }, { status: 200 });
  }

  // error
  return NextResponse.json(
    { status: "error", error: result.error || "Job failed" },
    { status: 500 }
  );
}