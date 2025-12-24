/**
 * Middleware NextAuth
 * Protege rotas que precisam de autenticação
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const pathname = req.nextUrl.pathname;
  
  console.log('[MIDDLEWARE]', {
    path: pathname,
    authenticated: isAuthenticated,
    hasCookies: req.cookies.getAll().length > 0,
  });

  if (!isAuthenticated) {
    console.error('[MIDDLEWARE] ERROR: Not authenticated, redirecting to /');
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/wrapped/:path*",
    "/api/stats/:path*",
    "/api/generate-wrapped/:path*",
  ],
};
