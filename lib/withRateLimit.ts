import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "../lib/limiter";

/**
 * withRateLimit
 *
 * Wraps any Next.js API route handler with the shared global rate limiter.
 * All routes using this wrapper share the same 5 req/sec Redis bucket.
 *
 * Usage:
 *   export const POST = withRateLimit(async (request) => {
 *     // your handler logic
 *     return NextResponse.json({ ok: true });
 *   });
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const allowed = await checkRateLimit();

    if (!allowed) {
      return NextResponse.json(
        {
          error: true,
          message: "Rate limit exceeded. Max 5 requests/sec globally. Try again shortly.",
          retryAfter: 1,
        },
        {
          status: 429,
          headers: {
            "Retry-After": "1",
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Window": "1s",
          },
        }
      );
    }

    return handler(request);
  };
}