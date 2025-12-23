# Segurança do Access Token - GitHub Wrapped

## ✅ Como o Token É Mantido Seguro

### 1. **Token Armazenado APENAS no JWT (Server-Side)**

```typescript
// auth.ts - JWT Callback
async jwt({ token, account, profile }) {
  if (account) {
    token.accessToken = account.access_token;  // ✅ Salvo no JWT
  }
  return token;
}
```

- O `accessToken` fica **apenas no JWT**
- O JWT é armazenado em um **cookie httpOnly**
- Cookies httpOnly **NÃO podem ser acessados via JavaScript** no navegador
- Protegido contra ataques XSS

### 2. **NÃO Exposto na Sessão do Cliente**

```typescript
// auth.ts - Session Callback
async session({ session, token }) {
  // ❌ NÃO fazemos isso:
  // session.accessToken = token.accessToken;

  // ✅ Apenas dados públicos:
  if (token.login && session.user) {
    session.user.login = token.login as string;
  }
  return session;
}
```

- A sessão que vai para o cliente (`useSession()`) **NÃO contém** o accessToken
- Apenas informações públicas (nome, email, login)

### 3. **Acesso Server-Side com Helper Seguro**

```typescript
// auth.ts - Helper Function
export async function getServerSession() {
  const session = await auth();
  if (!session) return null;

  // Pega o token do JWT (server-side)
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  return {
    user: session.user,
    accessToken: token.accessToken, // ✅ Disponível apenas server-side
    login: token.login,
  };
}
```

### 4. **Uso nas API Routes**

```typescript
// app/api/stats/route.ts
const session = await getServerSession(); // ✅ Server-side only

if (!session?.accessToken) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Usa o token para chamar GitHub API
const { data } = await fetchGitHubStats(session);
```

## 🔒 Camadas de Segurança

| Camada               | Proteção                                           |
| -------------------- | -------------------------------------------------- |
| **Cookie httpOnly**  | JavaScript não consegue acessar                    |
| **Cookie Secure**    | Enviado apenas via HTTPS em produção               |
| **JWT Encrypted**    | Token criptografado                                |
| **Server-Side Only** | `getServerSession()` só funciona no servidor       |
| **CORS**             | APIs protegidas, não acessíveis de outros domínios |
| **Rate Limiting**    | Previne abuso                                      |

## ⚠️ O Que NÃO Fazer

```typescript
// ❌ NUNCA faça isso:
async session({ session, token }) {
  session.accessToken = token.accessToken;  // PERIGOSO!
  return session;
}

// ❌ Cliente poderia acessar:
const { data: session } = useSession();
console.log(session.accessToken);  // Token exposto!
```

## ✅ Fluxo de Segurança

```
1. Usuário faz login → GitHub OAuth
2. GitHub retorna accessToken
3. accessToken salvo no JWT (criptografado, httpOnly cookie)
4. Cliente recebe sessão SEM accessToken
5. API routes chamam getServerSession()
6. getServerSession() decodifica JWT no servidor
7. accessToken usado para chamar GitHub API
8. Resposta enviada ao cliente
```

## 🧪 Como Testar a Segurança

### No Console do Navegador:

```javascript
// ✅ Isso funciona (dados públicos):
const session = await fetch("/api/auth/session").then((r) => r.json());
console.log(session.user); // { name, email, login }

// ❌ Isso NÃO mostra o token:
console.log(session.accessToken); // undefined

// ❌ Cookies httpOnly não podem ser lidos:
document.cookie; // Não mostra authjs.session-token
```

### Verificar Cookie:

1. F12 → Application (ou Storage)
2. Cookies → localhost:3000
3. `authjs.session-token`:
   - ✅ HttpOnly: true
   - ✅ Secure: true (em produção)
   - ✅ SameSite: Lax ou Strict

## 📚 Referências

- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Token Storage](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
