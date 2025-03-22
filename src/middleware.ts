import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only redirect if path starts with /admin and isn’t /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // No server-side admin check here yet; rely on client-side for now
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};