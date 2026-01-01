// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only protect these specific admin/blog management routes
  const protectedPaths = [
    "/blog/dashboard",
    "/blog/create-blogs",
    "/blog/delete-blogs",
    "/blog/update-blogs",
    "/blog/all-blogs",
  ];

  // Double-check the path is actually protected (redundant but safe)
  if (!protectedPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const isLoggedIn = Boolean(request.cookies.get("auth")); // adjust cookie name

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/blog/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/blog/dashboard",
    "/blog/create-blogs",
    "/blog/delete-blogs",
    "/blog/update-blogs",
    "/blog/all-blogs",
  ],
};
