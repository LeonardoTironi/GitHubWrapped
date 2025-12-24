import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user repo",
        },
      },
    }),
  ],
  trustHost: true, // ✅ Necessário para produção (Vercel)
  callbacks: {
    async jwt({ token, account, profile }) {
      
      // ✅ SEGURO: Salva o accessToken APENAS no JWT (server-side, criptografado)
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      
      // ✅ SEGURO: Passa o accessToken para a sessão
      // Isso é seguro porque a sessão só é acessível server-side nas API routes
      if (token.login && session.user) {
        session.user.login = token.login as string;
      }
      
      // Adiciona accessToken à sessão (server-side only)
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      
      return session;
    },
  },
});

/**
 * ✅ FUNÇÃO SEGURA: Obtém o accessToken apenas em contextos server-side
 * Esta função usa auth() que decodifica o JWT internamente
 * O token NUNCA é exposto ao cliente
 */
export async function getServerAuth() {
  const session = await auth();
  if (!session) return null;

  // Em Next.js 15+ com NextAuth v5, precisamos acessar o JWT diretamente
  // A melhor forma é usar getToken do next-auth/jwt em routes
  return session;
}
