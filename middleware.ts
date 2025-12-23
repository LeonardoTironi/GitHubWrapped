/**
 * Middleware NextAuth
 * Protege rotas que precisam de autenticação
 */

export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/wrapped/:path*",
    "/api/stats/:path*",
    "/api/generate-wrapped/:path*",
  ],
};
