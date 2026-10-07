import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const pathname = nextUrl.pathname;

  const isAuthRoute = pathname === "/login" || pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isSalesRoute =
    pathname.startsWith("/beranda") ||
    pathname.startsWith("/input") ||
    pathname.startsWith("/riwayat") ||
    pathname.startsWith("/profil");

  // Redirect authenticated user away from login pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (userRole === "SALES") {
        return NextResponse.redirect(new URL("/beranda", nextUrl));
      }
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Guard sales routes against unauthenticated users and non-sales roles
  if (isSalesRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "SALES") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Guard admin routes against unauthenticated users and sales role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole === "SALES") {
      return NextResponse.redirect(new URL("/beranda", nextUrl));
    }
    return NextResponse.next();
  }

  // Root path routing
  if (pathname === "/") {
    if (isLoggedIn) {
      return userRole === "SALES"
        ? NextResponse.redirect(new URL("/beranda", nextUrl))
        : NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|.*\\.png$).*)",
  ],
};
