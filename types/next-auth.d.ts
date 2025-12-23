/**
 * Extensão de tipos do NextAuth
 * Define tipos customizados para session e JWT
 */

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login?: string;
    };
  }
  
  interface User {
    login?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    login?: string;
  }
}
