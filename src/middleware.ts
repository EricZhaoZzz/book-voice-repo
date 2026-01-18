import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/auth", "/forgot-password", "/reset-password"];
const AUTH_ROUTES = ["/auth"];
const ADMIN_PUBLIC_ROUTES = ["/admin/login"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createMiddlewareClient(request, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Check for guest mode cookie
  const isGuest = request.cookies.get("guest_mode")?.value === "true";

  // Allow admin login page without authentication
  if (ADMIN_PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (session && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow public routes and guest mode
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    isGuest ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // Redirect unauthenticated users to auth page
  if (!session) {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
