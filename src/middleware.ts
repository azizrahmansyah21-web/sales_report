/**
 * Next.js Middleware Proteksi Rute & Navigasi Terpusat
 * Agung Toyota UjungBatu (Cabang 220)
 *
 * Menerapkan kontrol akses berbasis peran (RBAC) menggunakan utilitas roleRoutes.
 * Menjamin Sales tidak dapat membuka /admin/* dan diarahkan ke /input,
 * serta Admin, ADH, dan SPV diarahkan ke /admin/prospects.
 */

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { getDefaultRouteForRole, canAccessAdminArea } from "@/lib/auth/roleRoutes";

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

  // Alihkan pengguna yang sudah terautentikasi jika mencoba membuka halaman login
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(getDefaultRouteForRole(userRole), nextUrl));
    }
    return NextResponse.next();
  }

  // Proteksi rute Sales: Wajib login dan berstatus role SALES
  if (isSalesRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "SALES") {
      return NextResponse.redirect(new URL(getDefaultRouteForRole(userRole), nextUrl));
    }
    return NextResponse.next();
  }

  // Proteksi rute Admin/SPV/ADH: Wajib login dan bukan role SALES
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (!canAccessAdminArea(userRole)) {
      return NextResponse.redirect(new URL(getDefaultRouteForRole(userRole), nextUrl));
    }
    return NextResponse.next();
  }

  // Rute Root (/)
  if (pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(getDefaultRouteForRole(userRole), nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|.*\\.png$).*)",
  ],
};
