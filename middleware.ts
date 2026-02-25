/* This file blocks unauthenticated users from app routes using a session cookie. */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("mvp_session")?.value;
  const isAuthed = sessionCookie === "1";
  const pathname = request.nextUrl.pathname;
  const appRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/teams") || pathname.startsWith("/goals") || pathname.startsWith("/notes");
  const authRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (appRoute && !isAuthed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authRoute && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/teams/:path*", "/goals/:path*", "/notes/:path*", "/login", "/signup"],
};
