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
import {
  getDefaultRouteForRole,
  canAccessAdminArea,
  isSuperAdmin,
} from "@/lib/auth/roleRoutes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const pathname = nextUrl.pathname;

  // ─── 0. REDIRECT ALIAS RUTE CONVENIENCE ──────────────────────────────────
  if (pathname === "/admin/prospect") {
    return NextResponse.redirect(new URL("/admin/prospects", nextUrl));
  }
  if (pathname === "/spv/prospect" || pathname === "/spv/prospects") {
    return NextResponse.redirect(new URL("/admin/prospects", nextUrl));
  }
  if (pathname === "/spv/team") {
    return NextResponse.redirect(new URL("/admin/team", nextUrl));
  }
  if (pathname === "/spv/profile") {
    return NextResponse.redirect(new URL("/admin/profile", nextUrl));
  }

  const isAuthRoute = pathname === "/login" || pathname === "/admin/login";
  const isSettingsRoute = pathname.startsWith("/admin/settings");
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

  // ─── 1. PROTEKSI SUPERADMIN CONTROL CENTER (403 FORBIDDEN) ───────────────
  if (isSettingsRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (!isSuperAdmin(userRole)) {
      return new NextResponse("403 Forbidden: Akses khusus Superadmin.", {
        status: 403,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.next();
  }

  // ─── 2. PROTEKSI RUTE SALES (SALES ONLY) ──────────────────────────────────
  if (isSalesRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    // Jika Admin/SPV membuka /profil, izinkan atau teruskan
    if (userRole !== "SALES" && pathname !== "/profil") {
      return NextResponse.redirect(new URL(getDefaultRouteForRole(userRole), nextUrl));
    }
    return NextResponse.next();
  }

  // ─── 3. PROTEKSI RUTE ADMIN / SPV / SUPERADMIN ────────────────────────────
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
